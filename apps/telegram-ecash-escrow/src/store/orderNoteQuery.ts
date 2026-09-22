/**
 * Published redux-store 1.2.64 selects the offer headline (`escrowOffer.message`)
 * but not `noteOffer`. Insert the field so an escrowed order still shows the
 * offer note without a client package bump.
 */
export function withOfferNoteField(query: string): string {
  return query.replace(/escrowOffer:\s*offer\s*\{[^}]*\}/g, block => {
    if (/\bnoteOffer\b/.test(block)) return block;
    if (!/\bmessage\b/.test(block)) return block;
    return block.replace(/\bmessage\b/, 'message noteOffer');
  });
}

export function installOfferNoteQueryPatch(): void {
  const host = globalThis as typeof globalThis & { __offerNoteFetchPatched?: boolean };
  if (host.__offerNoteFetchPatched || typeof globalThis.fetch !== 'function') return;

  const original = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.body && typeof init.body === 'string' && init.body.includes('escrowOffer')) {
      try {
        const parsed = JSON.parse(init.body) as { query?: string };
        if (typeof parsed.query === 'string') {
          const nextQuery = withOfferNoteField(parsed.query);
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
  host.__offerNoteFetchPatched = true;
}
