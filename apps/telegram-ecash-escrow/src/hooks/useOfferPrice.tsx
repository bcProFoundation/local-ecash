import React from 'react';
import { getTickerText, PAYMENT_METHOD } from '@bcpros/lixi-models';
import { convertXECAndCurrency, formatAmountFor1MXEC, isConvertGoodsServices, showPriceInfo } from '@/src/utils';
import { fiatCurrencyApi } from '@bcpros/redux-store';

const { useGetAllFiatRateQuery } = fiatCurrencyApi;

type UseOfferPriceOpts = {
  paymentInfo: any; // PostOffer-like object
  inputAmount?: number; // amount to feed into convertXECAndCurrency (default 1)
};

export default function useOfferPrice({ paymentInfo, inputAmount = 1 }: UseOfferPriceOpts) {
  // Get fiat rates from GraphQL API with cache reuse
  // Skip if not needed (will be checked by needsFiatRates logic)
  const needsFiatRates = React.useMemo(() => {
    const isGoodsServices = paymentInfo?.paymentMethods?.[0]?.paymentMethod?.id === PAYMENT_METHOD.GOODS_SERVICES;
    if (isGoodsServices) return true;
    return paymentInfo?.coinPayment && paymentInfo?.coinPayment !== 'XEC';
  }, [paymentInfo]);

  const { data: fiatData } = useGetAllFiatRateQuery(undefined, {
    skip: !needsFiatRates,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false
  });

  const [rateData, setRateData] = React.useState<any>(null);
  const [amountPer1MXEC, setAmountPer1MXEC] = React.useState('');
  const [amountXECGoodsServices, setAmountXECGoodsServices] = React.useState(0);

  const coinCurrency = React.useMemo(() => {
    return getTickerText(
      paymentInfo?.localCurrency,
      paymentInfo?.coinPayment,
      paymentInfo?.coinOthers,
      paymentInfo?.priceCoinOthers
    );
  }, [paymentInfo]);

  const showPrice = React.useMemo(() => {
    const paymentId = paymentInfo?.paymentMethods?.[0]?.paymentMethod?.id ?? paymentInfo?.paymentMethod?.id;
    return showPriceInfo(
      paymentId,
      paymentInfo?.coinPayment,
      paymentInfo?.priceCoinOthers,
      paymentInfo?.priceGoodsServices,
      paymentInfo?.tickerPriceGoodsServices
    );
  }, [paymentInfo]);

  const isGoodsServicesConversion = React.useMemo(() =>
    isConvertGoodsServices(paymentInfo?.priceGoodsServices, paymentInfo?.tickerPriceGoodsServices),
    [paymentInfo]
  );

  // Whether this offer uses the Goods & Services payment method.
  // We compute this from the PAYMENT_METHOD enum instead of using a magic number.
  const isGoodsServices = React.useMemo(
    () => paymentInfo?.paymentMethods?.[0]?.paymentMethod?.id === PAYMENT_METHOD.GOODS_SERVICES,
    [paymentInfo]
  );

  React.useEffect(() => {
    // For Goods & Services: Always use XEC fiat rates (price is in fiat, need to convert to XEC)
    // For Crypto Offers: Use the selected fiat currency from localCurrency (user's choice)
    if (isGoodsServices) {
      // Goods & Services: Find XEC currency and transform its fiat rates
      const xecCurrency = fiatData?.getAllFiatRate?.find(item => item.currency === 'XEC');
      
      if (xecCurrency?.fiatRates) {
        // Transform: Backend returns "1 XEC = X USD", we need "1 USD = X XEC" (inverted)
        const transformedRates = xecCurrency.fiatRates
          .filter(item => item.rate && item.rate > 0)
          .map(item => ({
            coin: item.coin,
            rate: 1 / item.rate, // Invert the rate
            ts: item.ts
          }));
        
        // Add XEC itself with rate 1
        transformedRates.push({ coin: 'xec', rate: 1, ts: Date.now() });
        transformedRates.push({ coin: 'XEC', rate: 1, ts: Date.now() });
        
        setRateData(transformedRates);
      } else {
        setRateData(null);
      }
    } else {
      // Crypto Offers: Find and transform the user's selected local currency
      const currencyData = fiatData?.getAllFiatRate?.find(
        item => item.currency === (paymentInfo?.localCurrency ?? 'USD')
      );
      
      if (currencyData?.fiatRates) {
        const transformedRates = currencyData.fiatRates
          .filter(item => item.rate && item.rate > 0)
          .map(item => ({
            coin: item.coin,
            rate: 1 / item.rate,
            ts: item.ts
          }));
        
        transformedRates.push({ coin: 'xec', rate: 1, ts: Date.now() });
        transformedRates.push({ coin: 'XEC', rate: 1, ts: Date.now() });
        
        setRateData(transformedRates);
      } else {
        setRateData(null);
      }
    }
  }, [paymentInfo?.localCurrency, fiatData, isGoodsServices]);

  React.useEffect(() => {
    if (!rateData) return;
    const { amountXEC, amountCoinOrCurrency } = convertXECAndCurrency({
      rateData: rateData,
      paymentInfo: paymentInfo,
      inputAmount: inputAmount
    });

    setAmountXECGoodsServices(isGoodsServicesConversion ? amountXEC : paymentInfo?.priceGoodsServices);
    setAmountPer1MXEC(formatAmountFor1MXEC(amountCoinOrCurrency, paymentInfo?.marginPercentage, coinCurrency));
  }, [rateData, paymentInfo, inputAmount, isGoodsServicesConversion, coinCurrency]);

  return {
    showPrice,
    coinCurrency,
    amountPer1MXEC,
    amountXECGoodsServices,
    isGoodsServices
  };
}
