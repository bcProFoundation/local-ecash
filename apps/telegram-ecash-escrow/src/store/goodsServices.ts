/** Fiat tickers that have no minor unit in normal retail display. */
const NO_DECIMAL_CURRENCIES = ['VND', 'JPY', 'KRW', 'TWD', 'PHP', 'IDR'];

/**
 * Read a price the user typed, without inserting grouping characters.
 * Whole-unit currencies (VND, JPY, …) treat `.` and `,` as thousands separators.
 * Other currencies treat a 1–2 digit tail as the decimal part, and groups of 3 as thousands
 * (`1,000` and `1.000` are one thousand; `10.5` and `10,5` are ten and a half).
 */
export function parseLocalizedAmount(value: string | number | null | undefined, currency?: string | null): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

  const raw = String(value).trim().replace(/\s/g, '');
  if (!raw) return 0;

  const code = (currency || '').toUpperCase();
  if (NO_DECIMAL_CURRENCIES.includes(code)) {
    const digits = raw.replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
  }

  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  let normalized = raw;

  if (lastComma !== -1 && lastDot !== -1) {
    normalized = lastComma > lastDot ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '');
  } else if (lastComma !== -1 || lastDot !== -1) {
    const sep = lastComma !== -1 ? ',' : '.';
    const parts = raw.split(sep);
    const head = parts[0] ?? '';
    const tail = parts[parts.length - 1] ?? '';
    const grouped =
      head !== '0' &&
      head.length > 0 &&
      head.length <= 3 &&
      tail.length === 3 &&
      parts.slice(1).every(part => part.length === 3);
    normalized = grouped ? parts.join('') : `${parts.slice(0, -1).join('')}.${tail}`;
  }

  const num = Number(normalized.replace(/[^\d.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

/** Keep only characters the user typed. Do not insert thousands separators. */
export function sanitizeAmountDraft(input: string): string {
  return input.replace(/[^\d.,]/g, '');
}

export function formatPriceByType(price: number | string | null | undefined, currency?: string | null): string {
  if (price == null || price === '') return '';
  const numPrice = typeof price === 'string' ? parseLocalizedAmount(price, currency) : price;
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

/** Crypto payment method id. Kept in sync with PAYMENT_METHOD.CRYPTO. */
export const CRYPTO_PAYMENT_METHOD_ID = 4;

/** Goods paid in XEC go through the buyer-deposit / release flow. XEC is the payment, not only collateral. */
export function isDirectXecGoodsPayment(paymentMethodId?: number | null, coinPayment?: string | null): boolean {
  return paymentMethodId === CRYPTO_PAYMENT_METHOD_ID && (coinPayment ?? '').trim().toUpperCase() === 'XEC';
}

/**
 * External goods orders: the buyer pays outside escrow and the seller locks XEC as collateral.
 * Goods paid in XEC, and orders that already include a buyer deposit, stay on the normal release flow.
 */
export function isExternalGoodsServicesOrder(
  paymentMethodId?: number | null,
  buyerDepositTx?: string | null,
  offerCategory?: string | null,
  coinPayment?: string | null
): boolean {
  if (buyerDepositTx) return false;
  if (!isGoodsServicesOffer({ offerCategory, paymentMethod: { id: paymentMethodId ?? undefined } })) return false;
  return !isDirectXecGoodsPayment(paymentMethodId, coinPayment);
}

/** Taker action for a listing. Buy offers are taken by the seller; sell offers by the buyer. */
export function takerActionLabel(isBuyOffer: boolean): 'Buy' | 'Sell' {
  return isBuyOffer ? 'Sell' : 'Buy';
}
