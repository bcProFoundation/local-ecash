'use client';

import { COIN_OTHERS, COIN_USD_STABLECOIN, COIN_USD_STABLECOIN_TICKER } from '@/src/store/constants';
import { SettingContext } from '@/src/store/context/settingProvider';
import {
  convertXECAndCurrency,
  formatAmountFor1MXEC,
  formatNumber,
  getOrderLimitText,
  isConvertGoodsServices,
  showPriceInfo
} from '@/src/store/util';
import { COIN, GOODS_SERVICES_UNIT, PAYMENT_METHOD, getTickerText } from '@bcpros/lixi-models';
import {
  OfferStatus,
  OfferType,
  PostQueryItem,
  Role,
  TimelineQueryItem,
  accountsApi,
  fiatCurrencyApi,
  getSeedBackupTime,
  getSelectedWalletPath,
  openModal,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Card, CardContent, Collapse, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import useAuthorization from '../Auth/use-authorization.hooks';
import { BackupModalProps } from '../Common/BackupModal';

const CardWrapper = styled(Card)(({ theme }) => ({
  marginTop: 16,
  backgroundColor: theme.custom.bgPrimary,
  borderRadius: 16,

  '.prefix': {
    fontSize: '12px',
    color: '#79869b'
  },

  '.MuiCardContent-root': {
    padding: '16px 16px 0 16px',

    '.payment-group-btns': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 5,
      '& button': {
        borderRadius: '10px'
      },
      pointerEvents: 'none'
    }
  },

  '.MuiCollapse-root': {
    '.MuiCardContent-root': {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '8px 16px 0'
    }
  },

  '.action-section': {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    alignItems: 'center',
    gap: '10px'
  }
}));

export const BuyButtonStyled = styled(Button)(({ theme }) => ({
  display: 'flex',
  gap: 8,
  fontWeight: 600,
  margin: 0,
  background: '#0076c4',
  width: 'fit-content',
  filter: 'drop-shadow(0px 0px 3px #0076c4)',
  color: 'white',
  boxShadow: 'none',
  borderRadius: '12px',
  fontSize: '13px',

  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled
  }
}));

const OfferShowWrapItem = styled('div')(({ theme }) => ({
  backdropFilter: 'blur(4px)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  '.push-offer-wrap, .minmax-collapse-wrap': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  '.username, .push-offer-wrap': {
    cursor: 'pointer',
    textDecoration: 'underline'
  },

  '.reputation-account': {
    fontSize: '11px',
    color: theme.custom.colorSecondary
  }
}));

type OfferItemProps = {
  timelineItem?: TimelineQueryItem;
};

export default function OfferItem({ timelineItem }: OfferItemProps) {
  const { status } = useSession();
  const askAuthorization = useAuthorization();
  const searchParams = useSearchParams();
  const router = useRouter();

  const dispatch = useLixiSliceDispatch();

  const post = timelineItem?.data as PostQueryItem;
  const offerData = post?.postOffer;
  const isBuyOffer = offerData?.type === OfferType.Buy;
  const countryName = offerData?.location?.country ?? offerData?.country?.name;
  const stateName = offerData?.location?.adminNameAscii;
  const cityName = offerData?.location?.cityAscii;

  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const lastSeedBackupTimeOnDevice = useLixiSliceSelector(getSeedBackupTime);
  const settingContext = useContext(SettingContext);
  const seedBackupTime = settingContext?.setting?.lastSeedBackupTime ?? lastSeedBackupTimeOnDevice ?? '';

  const { useGetAccountByAddressQuery } = accountsApi;
  const { currentData: accountQueryData } = useGetAccountByAddressQuery(
    { address: selectedWalletPath?.xAddress },
    { skip: !selectedWalletPath }
  );

  const [coinCurrency, setCoinCurrency] = useState<string>(COIN.XEC);
  const [rateData, setRateData] = useState(null);
  const [amountPer1MXEC, setAmountPer1MXEC] = useState('');
  const [amountXECGoodsServices, setAmountXECGoodsServices] = useState(0);
  const [isGoodsServices, setIsGoodsServices] = useState(
    offerData?.paymentMethods[0]?.paymentMethod?.id === PAYMENT_METHOD.GOODS_SERVICES
  );
  const [isGoodsServicesConversion, setIsGoodsServicesConversion] = useState(() =>
    isConvertGoodsServices(post?.postOffer?.priceGoodsServices, post?.postOffer?.tickerPriceGoodsServices)
  );

  const { useGetAllFiatRateQuery } = fiatCurrencyApi;
  const { data: fiatData } = useGetAllFiatRateQuery();

  const handleBuyClick = e => {
    e.stopPropagation();

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      //check backup
      const oneMonthLater = new Date(seedBackupTime);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      const currentDate = new Date();
      const isGreaterThanOneMonth = currentDate > oneMonthLater;

      const backupModalProps: BackupModalProps = {
        isFromHome: true,
        offerId: post.id
      };
      if (!seedBackupTime || isGreaterThanOneMonth) {
        dispatch(openModal('BackupModal', backupModalProps));
        return;
      }
      dispatch(openModal('PlaceAnOrderModal', { post: post }));
    }
  };

  const [expanded, setExpanded] = React.useState(false);

  const handleBoost = async e => {
    e.stopPropagation();

    if (status === 'unauthenticated') {
      askAuthorization();

      return;
    }

    dispatch(openModal('BoostModal', { post: post }));
  };

  const handleExpandClick = e => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleItemClick = () => {
    router.push(`/offer-detail?id=${offerData.postId}`);
  };

  const handleUserNameClick = e => {
    e?.stopPropagation();
    router.push(`/profile?address=${post?.account?.address}`);
  };

  // Helper: find URLs in text and render image preview if URL points to an image
  // Use split with a non-global capturing regex and rely on index parity (odd = URL)
  const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/i;
  const IMAGE_EXT_REGEX = /\.(png|jpe?g|gif|webp|svg)(?:[?#].*|$)/i;

  // Strict URL sanitizer to avoid XSS in href/src attributes
  const sanitizeUrl = (raw?: string): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:') || lower.startsWith('file:') || lower.startsWith('blob:')) return null;
    try {
      const url = new URL(trimmed);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      const port = url.port ? `:${url.port}` : '';
      const path = encodeURI(url.pathname + url.search + url.hash);
      return `${url.protocol}//${url.hostname}${port}${path}`;
    } catch (e) {
      return null;
    }
  };

  // Parse and validate http(s) URL; returns URL object or null
  const parseSafeHttpUrl = (urlStr: string): URL | null => {
    try {
      const url = new URL(urlStr);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      if (urlStr.startsWith('data:')) return null;
      return url;
    } catch (e) {
      return null;
    }
  };

  // Given a parsed URL, determine if it's a raster image we allow
  const isSafeImageUrl = (url: URL): boolean => {
    if (/\.svg(\?|$)/i.test(url.pathname)) return false;
    return /\.(png|jpe?g|gif|bmp|webp)$/i.test(url.pathname);
  };

  const renderTextWithLinks = (text?: string) => {
    if (!text) return null;

    // Split keeps captured URLs as separate array elements. Do NOT filter out empty strings — parity matters.
    const parts = text.split(URL_SPLIT_REGEX);

    return (
      <>
        {parts.map((part, idx) => {
          // odd indices are URLs because the regex has one capturing group

          if (idx % 2 === 1) {
            const url = part.trim();
            const parsed = parseSafeHttpUrl(url);
            const safe = sanitizeUrl(url);

            if (parsed && isSafeImageUrl(parsed) && safe && IMAGE_EXT_REGEX.test(safe)) {
              return (
                <a key={idx} href={safe} target="_blank" rel="noreferrer noopener" onClick={e => e.stopPropagation()}>
                  <img src={safe} alt="attachment" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, display: 'block', marginTop: 6 }} />
                </a>
              );
            }

            if (parsed && safe) {
              return (
                <a key={idx} href={safe} target="_blank" rel="noreferrer noopener" onClick={e => e.stopPropagation()} style={{ color: '#1976d2' }}>
                  {safe}
                </a>
              );
            }

            return <span key={idx}>{url}</span>;
          }

          // plain text (even indices)
          return <span key={idx}>{part}</span>;
        })}
      </>
    );
  };

  const convertXECToAmount = async () => {
    if (!rateData) return 0;

    const { amountXEC, amountCoinOrCurrency } = convertXECAndCurrency({
      rateData: rateData,
      paymentInfo: post?.postOffer,
      inputAmount: 1
    });
    setAmountXECGoodsServices(isGoodsServicesConversion ? amountXEC : post?.postOffer?.priceGoodsServices);
    setAmountPer1MXEC(formatAmountFor1MXEC(amountCoinOrCurrency, post?.postOffer?.marginPercentage, coinCurrency));
  };

  const showPrice = useMemo(() => {
    return showPriceInfo(
      offerData?.paymentMethods[0]?.paymentMethod?.id,
      post?.postOffer?.coinPayment,
      post?.postOffer?.priceCoinOthers,
      post?.postOffer?.priceGoodsServices,
      post?.postOffer?.tickerPriceGoodsServices
    );
  }, [post?.postOffer]);

  useEffect(() => {
    setCoinCurrency(
      getTickerText(
        post?.postOffer?.localCurrency,
        post?.postOffer?.coinPayment,
        post?.postOffer?.coinOthers,
        post?.postOffer?.priceCoinOthers
      )
    );
  }, [post?.postOffer]);

  //convert to XEC
  useEffect(() => {
    convertXECToAmount();
  }, [rateData]);

  //get rate data
  useEffect(() => {
    const rateData = fiatData?.getAllFiatRate?.find(
      item => item.currency === (post?.postOffer?.localCurrency ?? 'USD')
    );
    setRateData(rateData?.fiatRates);
  }, [post?.postOffer?.localCurrency, fiatData?.getAllFiatRate]);

  //open placeAnOrderModal if offerId is in url
  useEffect(() => {
    if (searchParams.get('offerId') === post.id) {
      dispatch(openModal('PlaceAnOrderModal', { post }));
    }
  }, []);

  const OfferItem = (
    <OfferShowWrapItem>
      <div className="push-offer-wrap">
          <Typography variant="body2" style={{ fontWeight: 'bold' }} onClick={handleItemClick}>
          {renderTextWithLinks(offerData?.message) ?? ''}
        </Typography>
        {(accountQueryData?.getAccountByAddress.role === Role.Moderator ||
          post?.account.hash160 === selectedWalletPath?.hash160) && (
          <IconButton onClick={e => handleBoost(e)}>
            <ArrowCircleUpRoundedIcon />
          </IconButton>
        )}
      </div>
      <Typography variant="body2">
        <span className="prefix">{isBuyOffer ? 'Buyer' : 'Seller'}: </span>{' '}
        <span className="username" onClick={handleUserNameClick}>
          {settingContext?.allSettings?.[`${post?.account?.id.toString()}`]?.usePublicLocalUserName
            ? post?.account?.anonymousUsernameLocalecash
            : post?.account?.telegramUsername}
        </span>
        <span className="reputation-account"> - {post?.account?.accountStatsOrder?.completedOrder} trades</span>
      </Typography>
      <div className="minmax-collapse-wrap" onClick={e => handleExpandClick(e)}>
        <Typography variant="body2">
          <span className="prefix">Min / max: </span>
          {getOrderLimitText(offerData?.orderLimitMin, offerData?.orderLimitMax, coinCurrency)}
        </Typography>
        {expanded ? <ExpandLessIcon style={{ cursor: 'pointer' }} /> : <ExpandMoreIcon style={{ cursor: 'pointer' }} />}
      </div>
    </OfferShowWrapItem>
  );

  const OfferItemPaymentMethod = (
    <div className="payment-group-btns">
      {offerData?.paymentMethods &&
        offerData.paymentMethods?.length > 0 &&
        offerData.paymentMethods.map(item => {
          return (
            <Button size="small" color="success" variant="outlined" key={item.paymentMethod.name}>
              {item.paymentMethod.name}
            </Button>
          );
        })}

      {(offerData?.coinPayment === COIN_USD_STABLECOIN_TICKER || offerData?.coinPayment === COIN_OTHERS) && (
        <Button size="small" color="success" variant="outlined">
          {offerData.coinPayment === COIN_USD_STABLECOIN_TICKER ? COIN_USD_STABLECOIN : COIN_OTHERS}
        </Button>
      )}

      {offerData?.coinOthers && (
        <Button size="small" color="success" variant="outlined">
          {offerData.coinOthers}
        </Button>
      )}
      {offerData?.paymentApp && (
        <Button size="small" color="success" variant="outlined">
          {offerData.paymentApp}
        </Button>
      )}
    </div>
  );

  if (offerData?.status == OfferStatus.Archive) return <div></div>;
  if (offerData?.hideFromHome) return <div></div>;
  //hide item have negative score
  if (post?.boostScore?.boostScore < 0) return <div></div>;

  return (
    <React.Fragment>
      <CardWrapper>
        <CardContent>{OfferItem}</CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit className="hidden-item-wrap">
          <CardContent>
            {(countryName || stateName) && (
              <Typography variant="body2">
                <span className="prefix">Location: </span>
                {[cityName, stateName, countryName].filter(Boolean).join(', ')}
              </Typography>
            )}
            {offerData?.noteOffer && (
              <Typography variant="body2">
                <span className="prefix">Note: </span>
                {renderTextWithLinks(offerData.noteOffer)}
              </Typography>
            )}
          </CardContent>
        </Collapse>
        <CardContent>{OfferItemPaymentMethod}</CardContent>

        <Typography component={'div'} className="action-section">
          <Typography variant="body2">
            <span className="prefix">Price: </span>
            {isGoodsServices ? (
              // Goods/Services display
              <>
                {formatNumber(amountXECGoodsServices)} XEC / {GOODS_SERVICES_UNIT}
              </>
            ) : showPrice ? (
              // Show detailed price
              <>
                <span>
                  ~ <span style={{ fontWeight: 'bold' }}>{amountPer1MXEC}</span>
                </span>{' '}
                ( Market price +{post?.postOffer?.marginPercentage ?? 0}% )
              </>
            ) : (
              // Show simple market price
              <>Market price</>
            )}
          </Typography>
          <BuyButtonStyled variant="contained" onClick={e => handleBuyClick(e)}>
            {offerData?.type === OfferType.Buy ? 'Sell' : 'Buy'}
            <Image width={25} height={25} src="/eCash.svg" alt="" />
          </BuyButtonStyled>
        </Typography>
      </CardWrapper>
    </React.Fragment>
  );
}
