'use client';

import { COIN_OTHERS, COIN_USD_STABLECOIN_TICKER } from '@/src/store/constants';
import { COIN, PAYMENT_METHOD, coinInfo } from '@bcpros/lixi-models';
import {
  DisputeStatus,
  EscrowOrderQueryItem,
  EscrowOrderStatus,
  OfferType,
  fiatCurrencyApi,
  getSelectedAccount,
  getSelectedWalletPath,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import { Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const OrderDetailWrap = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  cursor: 'pointer',
  background: theme.custom.bgItem,
  borderRadius: '10px',
  padding: '16px',
  marginBottom: '16px',
  '.prefix': {
    fontSize: '14px',
    color: '#79869b'
  },
  '.btn-payment': {
    borderRadius: '16px',
    fontSize: '12px',
    textTransform: 'none'
  },

  '.payment-method-wrap': {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },

  '.btn-order-type': {
    fontSize: '12px',
    borderRadius: '16px',
    textTransform: 'none'
  },

  '.order-first-line': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '5px'
  },

  '.wrap-order-id': {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },

  '.order-id': {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}));

type OrderItemProps = {
  item?: EscrowOrderQueryItem;
  amountXEC?: number;
  textAmountPer1MXEC?: string;
  setAmountXEC?: (value: number) => void;
  setTextAmountPer1MXEC?: (text: string) => void;
};

const OrderDetailInfo = ({
  item,
  amountXEC,
  setAmountXEC,
  textAmountPer1MXEC,
  setTextAmountPer1MXEC
}: OrderItemProps) => {
  const order = item;
  const isBuyOffer = order?.escrowOffer?.type === OfferType.Buy;
  const router = useRouter();
  const [rateData, setRateData] = useState(null);
  const [marginCurrentPrice, setMarginCurrentPrice] = useState(0);

  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const selectedAccount = useLixiSliceSelector(getSelectedAccount);

  const { useGetAllFiatRateQuery } = fiatCurrencyApi;
  const { data: fiatData } = useGetAllFiatRateQuery();

  const revertCompactNumber = compact => {
    const regex = /([\d.]+)([MKB]?)?/; // Match number and optional suffix
    const match = compact.match(regex);

    if (!match) return null;

    const value = parseFloat(match[1]); // Numeric part
    const suffix = match[2]; // Suffix part (M, K, etc.)

    switch (suffix) {
      case 'B':
        return value * 1_000_000_000;
      case 'M':
        return value * 1_000_000;
      case 'K':
        return value * 1_000;
      default:
        return value; // No suffix
    }
  };

  const convertXECToAmount = async () => {
    if (!rateData) return 0;
    const CONST_AMOUNT_XEC = 1000000;
    let amountXEC = 0;
    let amountCoinOrCurrency = 0;
    //if payment is crypto, we convert from coin => USD
    if (order?.escrowOffer?.coinPayment && order?.escrowOffer?.coinPayment !== COIN_USD_STABLECOIN_TICKER) {
      const coinPayment = order?.escrowOffer.coinPayment.toLowerCase();
      const rateArrayCoin = rateData.find(item => item.coin === coinPayment);
      const rateArrayXec = rateData.find(item => item.coin === 'xec');
      const latestRateCoin = rateArrayCoin?.rate;
      const latestRateXec = rateArrayXec?.rate;
      const rateCoinPerXec = latestRateCoin / latestRateXec;
      amountXEC = Number(order.amountCoinOrCurrency ?? '0') * rateCoinPerXec;
      amountCoinOrCurrency = (latestRateXec * CONST_AMOUNT_XEC) / latestRateCoin; //1M XEC (USD) / rateCoin (USD)
    } else {
      //convert from currency to XEC
      const rateArrayXec = rateData.find(item => item.coin === 'xec');
      const latestRateXec = rateArrayXec?.rate;
      amountXEC = Number(order.amountCoinOrCurrency ?? '0') / latestRateXec;
      amountCoinOrCurrency = CONST_AMOUNT_XEC * latestRateXec;
    }

    //we just need code below in buyOffer
    if (isBuyOffer) {
      //set amount XEC (plus margin amount because we just use it in buyOffer)
      const amountMargin = (amountXEC * order.escrowOffer.marginPercentage) / 100;

      //dynamic amountXEC
      amountXEC = amountXEC + amountMargin;
      const amountXecRounded = parseFloat(amountXEC.toFixed(2));
      amountXecRounded > 0 ? setAmountXEC(amountXecRounded) : setAmountXEC(0);

      const compactNumberFormatter = new Intl.NumberFormat('en-GB', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
      });

      const amountWithPercentage = amountCoinOrCurrency * (1 + order?.escrowOffer?.marginPercentage / 100);
      const amountFormatted =
        amountWithPercentage < 1
          ? amountWithPercentage.toFixed(5)
          : compactNumberFormatter.format(amountWithPercentage);
      setTextAmountPer1MXEC(
        `${amountFormatted} ${order?.escrowOffer.coinPayment ?? order?.escrowOffer.localCurrency ?? 'XEC'} / 1M XEC`
      );
    }

    //calculate marginPrice
    const compactNumber = order?.price.match(/[\d.]+[BMK]?/);
    const revertPriceOrder = revertCompactNumber(compactNumber[0]);

    //to calculate margin: (b - a) / a * 100
    const marginMarketPriceAndOrderPrice = ((revertPriceOrder - amountCoinOrCurrency) / amountCoinOrCurrency) * 100;
    setMarginCurrentPrice(marginMarketPriceAndOrderPrice);
  };

  const showMargin = () => {
    return (
      order?.paymentMethod?.id !== PAYMENT_METHOD.GOODS_SERVICES && order?.escrowOffer?.coinPayment !== COIN_OTHERS
    );
  };

  const isShowDynamicValue = () => {
    //dynamic value only pending and not for goods/service
    return isBuyOffer && order?.escrowOrderStatus === EscrowOrderStatus.Pending && showMargin();
  };

  const paymentDetailInfo = () => {
    if (isBuyOffer) {
      if (item.paymentMethod?.id === PAYMENT_METHOD.BANK_TRANSFER) {
        // bank
        return [order?.bankInfo?.accountNameBank, order?.bankInfo?.bankName, order?.bankInfo?.accountNumberBank]
          .filter(Boolean)
          .join(', ');
      }
      if (item.paymentMethod?.id === PAYMENT_METHOD.PAYMENT_APP) {
        // app
        return [order?.bankInfo?.accountNameApp, order?.bankInfo?.appName, order?.bankInfo?.accountNumberApp]
          .filter(Boolean)
          .join(', ');
      }
    }
    return null;
  };

  const orderStatus = () => {
    if (order?.dispute && order?.dispute?.status === DisputeStatus.Active) return 'Dispute';

    if (order?.escrowOrderStatus === EscrowOrderStatus.Escrow) {
      if (order?.releaseSignatory) {
        return 'Released';
      }

      if (order?.returnSignatory) {
        return 'Returned';
      }
    }

    return order?.escrowOrderStatus?.toLowerCase()?.replace(/^./, char => char.toUpperCase());
  };

  //get rate data
  useEffect(() => {
    //just set if seller or buyOffer
    if (selectedWalletPath?.hash160 === order?.sellerAccount?.hash160 || isBuyOffer) {
      const rateData = fiatData?.getAllFiatRate?.find(
        item => item.currency === (order?.escrowOffer?.localCurrency ?? 'USD')
      );
      setRateData(rateData?.fiatRates);
    }
  }, [order?.escrowOffer?.localCurrency, fiatData?.getAllFiatRate]);

  //convert to XEC
  useEffect(() => {
    if (showMargin() || (isBuyOffer && showMargin())) {
      convertXECToAmount();
    }
  }, [rateData]);

  return (
    <OrderDetailWrap onClick={() => router.push(`/order-detail?id=${order.id}`)}>
      <Typography className="order-first-line" variant="body1" component="div">
        <div className="wrap-order-id">
          <span className="prefix">No: </span>
          <span className="order-id">{order.id}</span>
        </div>
        <div className="order-type">
          {order?.sellerAccount.id === selectedAccount?.id && (
            <Button className="btn-order-type" size="small" color="error" variant="outlined">
              Sell
            </Button>
          )}
          {order?.buyerAccount.id === selectedAccount?.id && (
            <Button className="btn-order-type" size="small" color="success" variant="outlined">
              Buy
            </Button>
          )}
        </div>
      </Typography>
      <Typography variant="body1">
        {order?.sellerAccount.id === selectedAccount?.id && (
          <React.Fragment>
            <span className="prefix">{order.escrowOffer.type === OfferType.Buy ? 'Offered' : 'Ordered'} by: </span>
            {order?.buyerAccount.anonymousUsernameLocalecash}
          </React.Fragment>
        )}
        {order?.buyerAccount.id === selectedAccount?.id && (
          <React.Fragment>
            <span className="prefix">{order.escrowOffer.type === OfferType.Buy ? 'Ordered' : 'Offered'} by: </span>
            {order?.sellerAccount.anonymousUsernameLocalecash}
          </React.Fragment>
        )}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Ordered at: </span>
        {new Date(order?.createdAt).toLocaleString('vi-VN')}
      </Typography>
      {showMargin() && (
        <Typography variant="body1">
          <span className="prefix">Price: </span>
          {isShowDynamicValue() ? textAmountPer1MXEC : order?.price}
        </Typography>
      )}
      <Typography variant="body1">
        <span className="prefix">Order amount:</span> {isShowDynamicValue() ? amountXEC : order?.amount}{' '}
        {coinInfo[COIN.XEC].ticker}
      </Typography>
      {showMargin() && (
        <Typography variant="body1">
          <span className="prefix">Payment amount:</span> {order?.amountCoinOrCurrency}{' '}
          {order?.escrowOffer?.coinPayment ?? order?.escrowOffer?.localCurrency ?? 'XEC'}
        </Typography>
      )}
      <Typography className="payment-method-wrap" variant="body1">
        <span className="prefix">Payment method:</span>
        <Button className="btn-payment" size="small" color="success" variant="outlined">
          {order?.paymentMethod.name}
        </Button>
        {order?.escrowOffer?.coinOthers && (
          <Button className="btn-payment" size="small" color="success" variant="outlined">
            {order.escrowOffer.coinOthers}
          </Button>
        )}
        {order?.escrowOffer?.paymentApp && (
          <Button size="small" color="success" variant="outlined">
            {order.escrowOffer.paymentApp}
          </Button>
        )}
      </Typography>
      {selectedWalletPath?.hash160 === order?.sellerAccount?.hash160 &&
        showMargin() &&
        ((order?.escrowOrderStatus === EscrowOrderStatus.Pending && !isBuyOffer) ||
          order?.escrowOrderStatus === EscrowOrderStatus.Escrow) && (
          <Typography variant="body1">
            <span className="prefix">Margin of current price:</span> {marginCurrentPrice.toFixed(2)}%
          </Typography>
        )}
      <Typography variant="body1">
        <span className="prefix">Status: </span>
        {orderStatus()}
      </Typography>
      <Typography>
        <span className="prefix">Escrow Address: </span>
        <a
          style={{
            color: 'cornflowerblue',
            wordWrap: 'break-word',
            maxWidth: '100%',
            display: 'inline-block'
          }}
          href={`${coinInfo[COIN.XEC].blockExplorerUrl}/address/${order?.escrowAddress}`}
          target="_blank"
        >
          <span>{order?.escrowAddress}</span>
        </a>
      </Typography>
      {paymentDetailInfo() !== null && (
        <Typography>
          <span className="prefix">Payment-detail: </span>
          {paymentDetailInfo()}
        </Typography>
      )}
    </OrderDetailWrap>
  );
};

export default OrderDetailInfo;
