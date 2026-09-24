/**
 * The published GraphQL client (redux-store 1.2.64) does not select offerCategory yet.
 * Insert the field next to priceGoodsServices so goods listings are recognized
 * when their payment method is bank, cash, an app, or another coin.
 * Once the client document already asks for offerCategory, this is a no-op.
 */
export function withOfferCategoryField(query: string): string {
  if (!query.includes('priceGoodsServices') || query.includes('offerCategory')) return query;
  return query.replace(/\bpriceGoodsServices\b/g, 'priceGoodsServices offerCategory');
}

export function installOfferCategoryQueryPatch(): void {
  const host = globalThis as typeof globalThis & { __offerCategoryFetchPatched?: boolean };
  if (host.__offerCategoryFetchPatched || typeof globalThis.fetch !== 'function') return;

  const original = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.body && typeof init.body === 'string' && init.body.includes('priceGoodsServices')) {
      try {
        const parsed = JSON.parse(init.body) as { query?: string };
        if (typeof parsed.query === 'string') {
          const nextQuery = withOfferCategoryField(parsed.query);
          if (nextQuery !== parsed.query) {
            init = { ...init, body: JSON.stringify({ ...parsed, query: nextQuery }) };
          }
        }
      } catch {
        // Leave non-JSON bodies unchanged.
      }
    }
    return original(input, init);
  };
  host.__offerCategoryFetchPatched = true;
}
