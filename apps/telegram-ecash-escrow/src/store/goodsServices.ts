/** Fiat tickers that have no minor unit in normal retail display. */
const NO_DECIMAL_CURRENCIES = ['VND', 'JPY', 'KRW', 'TWD', 'PHP', 'IDR'];

/**
 * Format a goods/services unit price.
 * USD, EUR, THB and similar currencies keep 2 decimals. Whole-unit currencies do not.
 */
export function formatPriceByType(price: number | string | null | undefined, currency?: string | null): string {
  if (price == null || price === '') return '';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (Number.isNaN(numPrice)) return '';

  const code = (currency || '').toUpperCase();
  if (NO_DECIMAL_CURRENCIES.includes(code)) {
    return Math.round(numPrice).toLocaleString('en-US');
  }

  const roundedPrice = Math.round(numPrice * 100) / 100;
  return roundedPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Legacy goods listings used payment method id 5.
 * New goods listings store OfferCategory.GOODS_SERVICES and a real payment method.
 */
export const GOODS_SERVICES_PAYMENT_METHOD_ID = 5;

export const OFFER_CATEGORY = {
  XEC_TRADING: 'XEC_TRADING',
  GOODS_SERVICES: 'GOODS_SERVICES'
} as const;

type GoodsOfferLike = {
  offerCategory?: string | null;
  paymentMethods?: Array<{ paymentMethod?: { id?: number | null } | null } | null> | null;
  paymentMethod?: { id?: number | null } | null;
};

/** True when the listing is goods and services, including legacy payment method 5. */
export function isGoodsServicesOffer(offer?: GoodsOfferLike | null): boolean {
  if (!offer) return false;
  if (offer.offerCategory === OFFER_CATEGORY.GOODS_SERVICES) return true;
  if (offer.offerCategory === OFFER_CATEGORY.XEC_TRADING) return false;
  const methodId = offer.paymentMethods?.[0]?.paymentMethod?.id ?? offer.paymentMethod?.id;
  return methodId === GOODS_SERVICES_PAYMENT_METHOD_ID;
}

/**
 * External goods orders: the buyer pays outside escrow and the seller locks XEC as collateral.
 * Orders that already include a buyer deposit stay on the normal release flow.
 */
export function isExternalGoodsServicesOrder(
  paymentMethodId?: number | null,
  buyerDepositTx?: string | null,
  offerCategory?: string | null
): boolean {
  return (
    isGoodsServicesOffer({ offerCategory, paymentMethod: { id: paymentMethodId ?? undefined } }) && !buyerDepositTx
  );
}

/** Taker action for a listing. Buy offers are taken by the seller; sell offers by the buyer. */
export function takerActionLabel(isBuyOffer: boolean): 'Buy' | 'Sell' {
  return isBuyOffer ? 'Sell' : 'Buy';
}
