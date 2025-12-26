import {
  constructXECRatesFromFiatCurrencies,
  convertXECAndCurrency,
  formatAmountFor1MXEC,
  isConvertGoodsServices,
  showPriceInfo,
  transformFiatRates
} from '@/src/utils';
import { PAYMENT_METHOD, getTickerText } from '@bcpros/lixi-models';
import { fiatCurrencyApi } from '@bcpros/redux-store';
import React from 'react';

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

  const isGoodsServicesConversion = React.useMemo(
    () => isConvertGoodsServices(paymentInfo?.priceGoodsServices, paymentInfo?.tickerPriceGoodsServices),
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
        const transformedRates = transformFiatRates(xecCurrency.fiatRates);
        setRateData(transformedRates);
      } else {
        // FALLBACK: If XEC entry is missing, construct it from fiat currencies
        const constructedRates = constructXECRatesFromFiatCurrencies(fiatData?.getAllFiatRate);
        if (constructedRates) {
          const transformedRates = transformFiatRates(constructedRates);
          setRateData(transformedRates);
        } else {
          setRateData(null);
        }
      }
    } else {
      // Pure XEC offers: Set identity rate data (1 XEC = 1 XEC)
      if (paymentInfo?.coinPayment?.toUpperCase() === 'XEC') {
        setRateData([
          { coin: 'XEC', rate: 1, ts: Date.now() },
          { coin: 'xec', rate: 1, ts: Date.now() }
        ]);
        return;
      }

      // Crypto Offers: Find and transform the user's selected local currency
      const currencyData = fiatData?.getAllFiatRate?.find(
        item => item.currency === (paymentInfo?.localCurrency ?? 'USD')
      );

      if (currencyData?.fiatRates) {
        const transformedRates = transformFiatRates(currencyData.fiatRates);
        setRateData(transformedRates);
      } else {
        setRateData(null);
      }
    }
  }, [paymentInfo?.localCurrency, paymentInfo?.coinPayment, fiatData, isGoodsServices]);

  React.useEffect(() => {
    if (!rateData) return;
    const { amountXEC, amountCoinOrCurrency } = convertXECAndCurrency({
      rateData: rateData,
      paymentInfo: paymentInfo,
      inputAmount: inputAmount
    });

    // For Goods & Services:
    // - If priceGoodsServices is set and tickerPriceGoodsServices is not XEC: use converted amountXEC
    // - Otherwise (legacy offers or XEC-priced): use priceGoodsServices or default to 1 XEC
    const displayPrice = isGoodsServicesConversion
      ? amountXEC
      : paymentInfo?.priceGoodsServices && paymentInfo?.priceGoodsServices > 0
        ? paymentInfo.priceGoodsServices
        : 1; // Default to 1 XEC for legacy offers without price

    setAmountXECGoodsServices(displayPrice);
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
