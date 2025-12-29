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
  // Debug: Log the input paymentInfo
  React.useEffect(() => {
    console.log('useOfferPrice INPUT:', {
      coinPayment: paymentInfo?.coinPayment,
      localCurrency: paymentInfo?.localCurrency,
      paymentMethodId: paymentInfo?.paymentMethods?.[0]?.paymentMethod?.id,
      marginPercentage: paymentInfo?.marginPercentage
    });
  }, [paymentInfo]);

  // Get fiat rates from GraphQL API with cache reuse
  // We need rates for: Goods & Services, XEC offers (coinPayment null + localCurrency set), or crypto offers
  const needsFiatRates = React.useMemo(() => {
    const isGoodsServicesCheck = paymentInfo?.paymentMethods?.[0]?.paymentMethod?.id === PAYMENT_METHOD.GOODS_SERVICES;
    if (isGoodsServicesCheck) return true;
    // For XEC offers: coinPayment is null but localCurrency is set
    if (!paymentInfo?.coinPayment && paymentInfo?.localCurrency) return true;
    // For crypto offers: coinPayment is set
    return !!paymentInfo?.coinPayment;
  }, [paymentInfo]);

  const { data: fiatData } = useGetAllFiatRateQuery(undefined, {
    skip: !needsFiatRates,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false
  });

  const [rateData, setRateData] = React.useState<any>(null);
  const [amountPer1MXEC, setAmountPer1MXEC] = React.useState('');
  const [amountXECGoodsServices, setAmountXECGoodsServices] = React.useState(0);

  // Whether this offer uses the Goods & Services payment method.
  // We compute this from the PAYMENT_METHOD enum instead of using a magic number.
  const isGoodsServices = React.useMemo(
    () => paymentInfo?.paymentMethods?.[0]?.paymentMethod?.id === PAYMENT_METHOD.GOODS_SERVICES,
    [paymentInfo]
  );

  // An "XEC offer" is when someone trades XEC for fiat currency.
  // In this case, coinPayment is null/undefined (XEC is the base currency) and localCurrency is set.
  const isXECOffer = React.useMemo(() => {
    const hasNoCoinPayment = !paymentInfo?.coinPayment || paymentInfo?.coinPayment?.toUpperCase() === 'XEC';
    const hasLocalCurrency = !!paymentInfo?.localCurrency;
    return hasNoCoinPayment && hasLocalCurrency && !isGoodsServices;
  }, [paymentInfo, isGoodsServices]);

  const coinCurrency = React.useMemo(() => {
    // For XEC offers, show price in local currency (VND, EUR, etc.)
    if (isXECOffer) {
      return paymentInfo?.localCurrency ?? 'USD';
    }
    return getTickerText(
      paymentInfo?.localCurrency,
      paymentInfo?.coinPayment,
      paymentInfo?.coinOthers,
      paymentInfo?.priceCoinOthers
    );
  }, [paymentInfo, isXECOffer]);

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

  React.useEffect(() => {
    // For Goods & Services: Always use XEC fiat rates (XEC has rates to all fiats)
    // For XEC Offers: Use the local currency rates directly (no inversion needed)
    // For other Crypto Offers: Use the selected fiat currency from localCurrency (user's choice)

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
          console.log('useOfferPrice: No XEC currency data found', fiatData);
          setRateData(null);
        }
      }
    } else if (isXECOffer) {
      // XEC Offers: Use the local currency data directly WITHOUT transformation
      // API returns: { coin: 'xec', rate: 0.3 } meaning "1 XEC = 0.3 VND"
      // So for 1M XEC: 0.3 * 1,000,000 = 300,000 VND
      // We do NOT invert because the rate is already "XEC -> local currency"
      const currency = (paymentInfo?.localCurrency ?? 'USD').toUpperCase();
      const currencyData = fiatData?.getAllFiatRate?.find(item => item.currency?.toUpperCase() === currency);

      console.log('useOfferPrice XEC offer: Looking for currency', currency, {
        found: !!currencyData,
        availableCurrencies: fiatData?.getAllFiatRate?.map(item => item.currency)?.slice(0, 10)
      });

      if (currencyData?.fiatRates) {
        // Find XEC rate directly - DO NOT transform/invert
        const xecRateEntry = currencyData.fiatRates.find(r => r.coin?.toLowerCase() === 'xec');

        if (xecRateEntry && xecRateEntry.rate > 0) {
          // Store just the XEC rate entry for calculation (no inversion needed)
          setRateData([{ ...xecRateEntry, isRawRate: true }]);
        } else {
          setRateData(null);
        }
      } else {
        console.log('useOfferPrice XEC offer: No currency data found for', currency);
        setRateData(null);
      }
    } else if (paymentInfo?.coinPayment === 'Others' && paymentInfo?.priceCoinOthers) {
      // Coin Others: Custom token with price set in USD
      // priceCoinOthers = price per token in USD (e.g., 1 USD per EAT)
      // We need raw XEC-to-USD rate (NOT inverted)
      // API returns: { coin: 'xec', rate: 0.00001 } meaning "1 XEC = 0.00001 USD"
      //
      // Calculation: If 1 EAT = 1 USD and 1 XEC = 0.00001 USD
      // Then 1M XEC = 0.00001 * 1,000,000 = 10 USD = 10 EAT
      const currency = 'USD';
      const currencyData = fiatData?.getAllFiatRate?.find(item => item.currency?.toUpperCase() === currency);

      console.log('useOfferPrice Coin Others: Looking for USD rates', {
        found: !!currencyData,
        priceCoinOthers: paymentInfo?.priceCoinOthers
      });

      if (currencyData?.fiatRates) {
        // Find XEC rate directly - DO NOT invert
        const xecRateEntry = currencyData.fiatRates.find(r => r.coin?.toLowerCase() === 'xec');
        console.log('useOfferPrice Coin Others: USD rate data', {
          xecRateEntry,
          xecRateValue: xecRateEntry?.rate,
          expectedPriceFor1MXEC: xecRateEntry?.rate
            ? (xecRateEntry.rate * 1000000) / paymentInfo.priceCoinOthers
            : 'N/A'
        });

        if (xecRateEntry && xecRateEntry.rate > 0) {
          // Store raw rate with marker for special handling
          setRateData([{ ...xecRateEntry, isRawRate: true, isCoinOthers: true }]);
        } else {
          setRateData(null);
        }
      } else {
        console.log('useOfferPrice Coin Others: No USD currency data found');
        setRateData(null);
      }
    } else {
      // Other Crypto Offers: transform rates as before
      const currency = (paymentInfo?.localCurrency ?? 'USD').toUpperCase();
      const currencyData = fiatData?.getAllFiatRate?.find(item => item.currency?.toUpperCase() === currency);

      if (currencyData?.fiatRates) {
        const transformedRates = transformFiatRates(currencyData.fiatRates);
        setRateData(transformedRates);
      } else {
        console.log('useOfferPrice: No currency data found for', currency);
        setRateData(null);
      }
    }
  }, [paymentInfo?.localCurrency, paymentInfo?.coinPayment, fiatData, isGoodsServices, isXECOffer]);

  React.useEffect(() => {
    if (!rateData) {
      console.log('useOfferPrice: No rateData available', {
        coinPayment: paymentInfo?.coinPayment,
        localCurrency: paymentInfo?.localCurrency
      });
      return;
    }

    console.log('useOfferPrice: Processing rateData', {
      isXECOffer,
      coinPayment: paymentInfo?.coinPayment,
      localCurrency: paymentInfo?.localCurrency,
      rateDataLength: rateData?.length
    });

    // Special handling for XEC offers to show Fiat price
    if (isXECOffer) {
      // For XEC offers, we stored the raw (non-inverted) XEC rate
      // API returns: { coin: 'xec', rate: 0.3 } meaning "1 XEC = 0.3 VND"
      // So for 1M XEC: 0.3 * 1,000,000 = 300,000 VND

      const xecRateEntry = rateData.find(item => item.coin?.toLowerCase() === 'xec');

      console.log('useOfferPrice XEC offer calculation:', {
        localCurrency: paymentInfo?.localCurrency,
        xecRateEntry,
        isRawRate: xecRateEntry?.isRawRate
      });

      if (xecRateEntry && xecRateEntry.rate && xecRateEntry.rate > 0) {
        // Rate is already "1 XEC = X local currency" - just multiply by 1M
        const priceOf1XECInLocalCurrency = xecRateEntry.rate;
        const priceOf1MXECInLocalCurrency = priceOf1XECInLocalCurrency * 1000000;

        console.log('useOfferPrice XEC calculation result:', {
          priceOf1XECInLocalCurrency,
          priceOf1MXECInLocalCurrency,
          coinCurrency
        });

        setAmountXECGoodsServices(1); // 1 XEC
        setAmountPer1MXEC(
          formatAmountFor1MXEC(priceOf1MXECInLocalCurrency, paymentInfo?.marginPercentage, coinCurrency)
        );
        return;
      } else {
        console.log('useOfferPrice: XEC rate not found in rate data');
      }
    }

    // Special handling for Coin Others (custom tokens with price in USD)
    const isCoinOthers = paymentInfo?.coinPayment === 'Others' && paymentInfo?.priceCoinOthers;
    if (isCoinOthers) {
      const xecRateEntry = rateData.find(item => item.coin?.toLowerCase() === 'xec');

      console.log('useOfferPrice Coin Others calculation:', {
        coinOthers: paymentInfo?.coinOthers,
        priceCoinOthers: paymentInfo?.priceCoinOthers,
        xecRateEntry,
        isCoinOthers: xecRateEntry?.isCoinOthers
      });

      if (xecRateEntry && xecRateEntry.rate && xecRateEntry.rate > 0) {
        // Rate is "1 XEC = X USD" (raw, not inverted)
        // priceCoinOthers is "1 Token = Y USD"
        // For 1M XEC: (xecRate * 1,000,000) / priceCoinOthers = tokens per 1M XEC
        const xecToUSD = xecRateEntry.rate; // e.g., 0.00001 USD per XEC
        const tokenPriceInUSD = paymentInfo.priceCoinOthers; // e.g., 1 USD per EAT
        const usdPer1MXEC = xecToUSD * 1000000; // e.g., 10 USD per 1M XEC
        const tokensPer1MXEC = usdPer1MXEC / tokenPriceInUSD; // e.g., 10 EAT per 1M XEC

        console.log('useOfferPrice Coin Others calculation result:', {
          xecToUSD,
          tokenPriceInUSD,
          usdPer1MXEC,
          tokensPer1MXEC,
          coinCurrency
        });

        setAmountXECGoodsServices(1);
        setAmountPer1MXEC(formatAmountFor1MXEC(tokensPer1MXEC, paymentInfo?.marginPercentage, coinCurrency));
        return;
      } else {
        console.log('useOfferPrice: Coin Others - XEC rate not found');
      }
    }

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
  }, [rateData, paymentInfo, inputAmount, isGoodsServicesConversion, coinCurrency, isXECOffer]);

  return {
    showPrice,
    coinCurrency,
    amountPer1MXEC,
    amountXECGoodsServices,
    isGoodsServices
  };
}
