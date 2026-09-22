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
 * Goods & Services payment method id. Kept in sync with PAYMENT_METHOD.GOODS_SERVICES.
 * Orders that already include a buyer deposit stay on the normal release flow.
 */
export const GOODS_SERVICES_PAYMENT_METHOD_ID = 5;

export function isExternalGoodsServicesOrder(paymentMethodId?: number | null, buyerDepositTx?: string | null): boolean {
  return paymentMethodId === GOODS_SERVICES_PAYMENT_METHOD_ID && !buyerDepositTx;
}

/** Taker action for a listing. Buy offers are taken by the seller; sell offers by the buyer. */
export function takerActionLabel(isBuyOffer: boolean): 'Buy' | 'Sell' {
  return isBuyOffer ? 'Sell' : 'Buy';
}
