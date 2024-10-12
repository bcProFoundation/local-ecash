'use client';

import CreateOfferModal from '@/src/components/CreateOfferModal/CreateOfferModal';
import Footer from '@/src/components/Footer/Footer';
import Header from '@/src/components/Header/Header';
import OfferItem from '@/src/components/OfferItem/OfferItem';
import TopSection from '@/src/components/TopSection/TopSection';
import {
  OfferFilterInput,
  TimelineQueryItem,
  accountsApi,
  axiosClient,
  getCountries,
  getNewPostAvailable,
  getOfferFilterConfig,
  getPaymenMethods,
  getSelectedWalletPath,
  offerApi,
  removeAllWallets,
  saveOfferFilterConfig,
  setNewPostAvailable,
  useInfiniteOfferFilterQuery,
  useInfiniteOffersByScoreQuery,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import SignalWifiConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiConnectedNoInternet4';
import {
  Backdrop,
  Badge,
  Button,
  Fade,
  Skeleton,
  Slide,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useContext, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAuthorization from '../components/Auth/use-authorization.hooks';
import MiniAppBackdrop from '../components/Common/MiniAppBackdrop';
import MobileLayout from '../components/layout/MobileLayout';
import { TelegramMiniAppContext } from '../store/telegram-mini-app-provider';

const WrapHome = styled.div`
  .btn-create-offer {
    position: fixed;
    bottom: 100px;
    z-index: 1;
    cursor: pointer;
    background-color: rgb(255, 219, 209);
    padding: 10px;
    border-radius: 50%;
    display: flex;
  }
`;

const HomePage = styled.div`
  position: relative;
  padding: 1rem;
  padding-bottom: 56px;
  min-height: 100svh;

  .MuiButton-root {
    text-transform: none;
  }

  .MuiIconButton-root {
    padding: 0 !important;

    &:hover {
      background: none;
      opacity: 0.8;
    }
  }
`;

const Section = styled.div`
  .content-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-offer {
      font-weight: 600;
    }
  }
`;

const StyledBadge = styled(Badge)`
  background: #0f98f2;
  position: absolute;
  z-index: 1;
  left: 40%;
  top: 1rem;
  cursor: pointer;
  padding: 8px 13px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  color: white;
  gap: 3px;

  .refresh-text {
    font-size: 14px;
    font-weight: bold;
  }
`;

export default function Home() {
  const prevRef = useRef(0);
  const theme = useTheme();
  const { data: sessionData, status } = useSession();
  const askAuthorization = useAuthorization();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { launchParams } = useContext(TelegramMiniAppContext);

  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const offerFilterConfig = useLixiSliceSelector(getOfferFilterConfig);
  const newPostAvailable = useLixiSliceSelector(getNewPostAvailable);

  const [mismatchAccount, setMismatchAccount] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState<boolean>(false);

  const { useUpdateAccountTelegramUsernameMutation, useGetAccountByAddressQuery } = accountsApi;
  const { currentData: accountQueryData } = useGetAccountByAddressQuery(
    { address: selectedWalletPath?.xAddress },
    { skip: !selectedWalletPath }
  );

  const [createTriggerUpdateAccountTelegramUsername] = useUpdateAccountTelegramUsernameMutation();
  const dispatch = useLixiSliceDispatch();

  const { data, hasNext, isFetching, fetchNext, refetch } = useInfiniteOffersByScoreQuery({ first: 20 }, false);
  const {
    data: dataFilter,
    hasNext: hasNextFilter,
    isFetching: isFetchingFilter,
    fetchNext: fetchNextFilter
  } = useInfiniteOfferFilterQuery({ first: 20, offerFilterInput: offerFilterConfig }, false);

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  const loadMoreItemsFilter = () => {
    if (hasNextFilter && !isFetchingFilter) {
      fetchNextFilter();
    } else if (hasNextFilter) {
      fetchNextFilter();
    }
  };
  const handleCreateOfferClick = () => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      setOpen(true);
    }
  };

  const handleRefresh = () => {
    dispatch(offerApi.api.util.resetApiState());
    refetch();
    dispatch(setNewPostAvailable(false));
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        const currentScrollPos = window.scrollY;
        setVisible(prevRef.current > currentScrollPos || currentScrollPos < 20);
        prevRef.current = currentScrollPos;
      };
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    sessionData &&
      accountQueryData &&
      accountQueryData?.getAccountByAddress.telegramUsername !== sessionData?.user.name &&
      createTriggerUpdateAccountTelegramUsername({
        telegramId: sessionData.user.id,
        telegramUsername: sessionData.user.name
      });
  }, [sessionData, accountQueryData?.getAccountByAddress]);

  //reset fitler and flag for new-post when reload
  useEffect(() => {
    const offerFilterInput: OfferFilterInput = {
      countryId: null,
      countryName: '',
      stateId: null,
      stateName: '',
      paymentMethodIds: []
    };
    dispatch(saveOfferFilterConfig(offerFilterInput));
    dispatch(setNewPostAvailable(false));
  }, []);

  //auto call paymentMethods and countries
  useEffect(() => {
    dispatch(getPaymenMethods());
    dispatch(getCountries());
  }, []);

  useEffect(() => {
    if (selectedWalletPath && sessionData) {
      (async () => {
        try {
          await axiosClient.get(`/api/accounts/telegram`, {
            params: {
              telegramId: sessionData.user.id,
              publicKey: selectedWalletPath.publicKey
            }
          });
        } catch (e) {
          if (e.message === 'Network Error') {
            setNetworkError(true);

            return;
          }

          setMismatchAccount(true);
        }
      })();
    }
  }, [selectedWalletPath, sessionData]);

  if (selectedWalletPath === null && sessionData && !launchParams) {
    return (
      <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={true}>
        <Stack>
          <Typography variant="h5" align="center">
            No wallet detected
          </Typography>
          <Typography variant="body1" align="center">
            Please sign out and try again!
          </Typography>
          <Button
            variant="contained"
            style={{ marginTop: '15px' }}
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
          >
            Sign Out
          </Button>
        </Stack>
      </Backdrop>
    );
  }

  if (mismatchAccount) {
    return (
      <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={true}>
        <Stack>
          <Typography variant="h5" align="center">
            Mismatch Telegram account with current wallet
          </Typography>
          <Typography variant="body1" align="center">
            Please sign out and try again!
          </Typography>
          <Button
            variant="contained"
            style={{ marginTop: '15px' }}
            onClick={() => {
              dispatch(removeAllWallets());
              signOut({ redirect: true, callbackUrl: '/' });
            }}
          >
            Sign Out
          </Button>
        </Stack>
      </Backdrop>
    );
  }

  if (networkError) {
    return (
      <Backdrop
        sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1, backgroundColor: 'black' })}
        open={true}
      >
        <Stack alignItems="center">
          <SignalWifiConnectedNoInternet4Icon fontSize="large" />
          <Typography variant="h5">Network Error</Typography>
          <Typography variant="h5">Please try again later</Typography>
        </Stack>
      </Backdrop>
    );
  }

  return (
    <MobileLayout>
      <MiniAppBackdrop />
      <WrapHome>
        <Slide direction="down" in={newPostAvailable && visible}>
          <StyledBadge className="badge-new-offer" color="info" onClick={handleRefresh}>
            <CachedRoundedIcon color="action" /> <span className="refresh-text">Refresh</span>
          </StyledBadge>
        </Slide>
        <HomePage>
          <Header />
          <TopSection />

          <Section>
            <div className="content-wrap">
              <Typography className="title-offer" variant="body1">
                Offer Watchlist
              </Typography>
            </div>
            <div className="offer-list">
              {offerFilterConfig.countryId ||
              offerFilterConfig.stateId ||
              (offerFilterConfig.paymentMethodIds?.length ?? 0) > 0 ? (
                dataFilter.length > 0 ? (
                  <InfiniteScroll
                    dataLength={dataFilter.length}
                    next={loadMoreItemsFilter}
                    hasMore={hasNextFilter}
                    loader={
                      <>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                      </>
                    }
                    scrollableTarget="scrollableDiv"
                    scrollThreshold={'100px'}
                  >
                    {dataFilter.map(item => {
                      return <OfferItem key={item.id} timelineItem={item as TimelineQueryItem} />;
                    })}
                  </InfiniteScroll>
                ) : (
                  <Typography style={{ textAlign: 'center', marginTop: '2rem' }}>No offer in your filter</Typography>
                )
              ) : data.length > 0 ? (
                <InfiniteScroll
                  dataLength={data.length}
                  next={loadMoreItems}
                  hasMore={hasNext}
                  loader={
                    <>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                    </>
                  }
                  scrollableTarget="scrollableDiv"
                  scrollThreshold={'100px'}
                >
                  {data.map(item => {
                    return <OfferItem key={item.id} timelineItem={item as TimelineQueryItem} />;
                  })}
                </InfiniteScroll>
              ) : (
                <Typography style={{ textAlign: 'center', marginTop: '2rem' }}>No offer here</Typography>
              )}
            </div>
          </Section>
        </HomePage>
        <Fade in={visible}>
          <div
            className="btn-create-offer"
            onClick={handleCreateOfferClick}
            style={{
              right: fullScreen ? `calc((100% - 576px) / 4.5 + 75px)` : `calc((100% - 576px) / 2 + 75px)`
            }}
          >
            <img src="/ico-create-post.svg" alt="create-post-ico" />
          </div>
        </Fade>
        <CreateOfferModal
          isOpen={open}
          onDissmissModal={value => {
            setOpen(value);
          }}
        />
        <Footer hidden={visible} />
      </WrapHome>
    </MobileLayout>
  );
}
