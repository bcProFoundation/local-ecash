# Goods & Services Payment Flow Documentation

## Overview

The Goods & Services (G&S) marketplace supports two distinct payment flows depending on the payment method selected:

1. **External Payment Flow** - Seller escrows collateral while buyer pays externally
2. **Direct XEC Payment Flow** - Buyer deposits XEC directly (standard escrow)

## Quick Reference

### When is it External Payment?

- ✅ Legacy G&S offers (paymentMethodId = 5)
- ✅ G&S + Bank Transfer (paymentMethodId = 2)
- ✅ G&S + Payment App (paymentMethodId = 3)
- ✅ G&S + Other Cryptocurrencies (paymentMethodId = 4, coinPayment != 'XEC')

### When is it Direct XEC Payment?

- 🔷 G&S + XEC (paymentMethodId = 4, coinPayment = 'XEC')

## Payment Scenarios Explained

### External Payment Scenarios

**The buyer pays the seller OUTSIDE the blockchain** (via bank, app, or other crypto). The seller escrows XEC as collateral to ensure they deliver. When buyer confirms receipt, collateral is released back to seller.

#### Scenario A: Legacy G&S (paymentMethodId = 5)

**Deprecated but still supported for backward compatibility**

- Seller deposits XEC as collateral
- Buyer transfers money externally
- Buyer confirms receipt → Collateral released to seller

#### Scenario B: Bank Transfer (paymentMethodId = 2)

**Modern G&S with traditional banking**

- Seller deposits XEC as collateral
- Buyer transfers via bank → Seller receives funds
- Buyer confirms receipt → Collateral released to seller

#### Scenario C: Payment App (paymentMethodId = 3)

**Modern G&S with payment apps**

- Seller deposits XEC as collateral
- Buyer transfers via PayPal/Venmo/etc → Seller receives funds
- Buyer confirms receipt → Collateral released to seller

#### Scenario D: Non-XEC Crypto (paymentMethodId = 4, e.g., BTC)

**Modern G&S with alternative cryptocurrencies**

- Seller deposits XEC as collateral
- Buyer transfers BTC/ETH/etc to seller's wallet
- Buyer confirms receipt → Collateral released to seller

### Direct XEC Payment

#### Scenario E: XEC Direct Payment (paymentMethodId = 4, coinPayment = 'XEC')

**Modern G&S with direct XEC payment**

- **IMPORTANT**: This is NOT external payment
- Buyer deposits XEC directly into escrow (like standard XEC trading)
- Seller delivers goods/services
- Seller releases XEC to buyer (standard release flow)
- No seller collateral mechanism - buyer's XEC is held in escrow

## Frontend Implementation

### PlaceAnOrderModal.tsx

```typescript
const isExternalPayment = useMemo(() => {
  // Determines if order uses external payment (seller collateral)
  // or direct payment (buyer deposits)

  const hasGoodsServicesCategory = offerCategory === 'GOODS_SERVICES';
  const paymentMethodId = paymentMethod?.id;
  const coinPayment = (offer?.coinPayment || '').toUpperCase();

  // Case 1: Legacy G&S → External
  if (paymentMethodId === PAYMENT_METHOD.GOODS_SERVICES) return true;

  // Case 2: Not G&S → Direct (standard XEC trading)
  if (!hasGoodsServicesCategory) return false;

  // Case 3: G&S + XEC → Direct (NOT external!)
  if (paymentMethodId === PAYMENT_METHOD.CRYPTO && coinPayment === 'XEC') {
    return false;
  }

  // Case 4: All other G&S → External
  return true;
}, [offer, paymentMethod]);
```

### order-detail/page.tsx

Same logic to determine `isExternalPaymentOrder`:

- Shows "Seller Collateral Escrowed" UI only for external payments
- Shows "Confirm Receipt" button only for external payments
- Hides these UI elements for direct XEC payment

## UI Behavior Differences

### External Payment Order (Buyer View)

```
Status: ESCROW
├─ 🔐 Seller Collateral Escrowed
├─ 💰 Pay the seller externally for the goods/services
├─ 📝 Payment Details: [Bank Account / Payment App / Crypto Address]
├─ ⏳ Waiting for goods/services delivery...
└─ ✅ [Confirm Receipt] button enabled
```

### Direct XEC Payment Order (Buyer View)

```
Status: ESCROW
├─ Order Details (standard)
├─ Price: [amount] XEC
├─ ⏳ Waiting for seller to deliver...
└─ No special external payment messaging
```

## Backend Validation (escrow-order.resolver.ts)

### BUYER_CONFIRM_RECEIPT Action

This action is **ONLY** for external payment orders:

✅ **Valid for**:

- Legacy G&S (paymentMethodId = 5)
- G&S + Bank Transfer (paymentMethodId = 2)
- G&S + Payment App (paymentMethodId = 3)
- G&S + Non-XEC Crypto (paymentMethodId = 4, coinPayment != 'XEC')

❌ **NOT valid for**:

- G&S + XEC (paymentMethodId = 4, coinPayment = 'XEC')
  - Error: "BUYER_CONFIRM_RECEIPT cannot be used for direct XEC payment orders. Use standard release flow instead."
- Standard XEC trading (no G&S category)

### Implementation

```typescript
// Check if direct XEC payment (not allowed for BUYER_CONFIRM_RECEIPT)
if (offerCategory === 'GOODS_SERVICES' && paymentMethodId === PAYMENT_METHOD.CRYPTO && coinPayment === 'XEC') {
  throw new Error(
    'BUYER_CONFIRM_RECEIPT cannot be used for direct XEC payment orders. Use standard release flow instead.'
  );
}
```

## Decision Tree

```
User creates/views offer
         ↓
Is it G&S category?
│
├─ NO → Standard XEC Trading
│       • Buyer deposits XEC
│       • Seller releases to buyer
│       • Standard actions: RELEASE, RETURN
│
└─ YES → Check Payment Method
         │
         ├─ paymentMethodId = 5 (Legacy)
         │  └─ EXTERNAL PAYMENT ✅ BUYER_CONFIRM_RECEIPT
         │
         ├─ paymentMethodId = 2 (Bank)
         │  └─ EXTERNAL PAYMENT ✅ BUYER_CONFIRM_RECEIPT
         │
         ├─ paymentMethodId = 3 (App)
         │  └─ EXTERNAL PAYMENT ✅ BUYER_CONFIRM_RECEIPT
         │
         ├─ paymentMethodId = 4 (Crypto)
         │  │
         │  ├─ coinPayment = 'XEC'
         │  │  └─ DIRECT PAYMENT (buyer deposit)
         │  │     ✅ Standard release/return
         │  │     ❌ NOT BUYER_CONFIRM_RECEIPT
         │  │
         │  └─ coinPayment = 'BTC'/'ETH'/etc
         │     └─ EXTERNAL PAYMENT ✅ BUYER_CONFIRM_RECEIPT
```

## Error Messages

### User-Facing Errors

**Trying to use BUYER_CONFIRM_RECEIPT on non-G&S order:**

> "BUYER_CONFIRM_RECEIPT can only be used for Goods & Services marketplace orders"

**Trying to use BUYER_CONFIRM_RECEIPT on direct XEC payment:**

> "BUYER_CONFIRM_RECEIPT cannot be used for direct XEC payment orders. Use standard release flow instead."

**Non-buyer trying to confirm receipt:**

> "Only the buyer can confirm receipt of goods/services"

**Confirming receipt when order not in escrow:**

> "Escrow order is not in escrow status"

## Testing Checklist

### External Payment Flows

- [ ] Create G&S + Bank Transfer offer → Shows "Seller Collateral" UI
- [ ] Create G&S + Payment App offer → Shows "Seller Collateral" UI
- [ ] Create G&S + Bitcoin offer → Shows "Seller Collateral" UI
- [ ] Buyer can confirm receipt → Collateral released to seller
- [ ] Buyer sees payment details to submit externally

### Direct XEC Payment Flow

- [ ] Create G&S + XEC offer → Does NOT show "Seller Collateral" UI
- [ ] Buyer deposits XEC → Enters escrow (standard)
- [ ] BUYER_CONFIRM_RECEIPT rejected with proper error
- [ ] Standard release/return flows work

### Backward Compatibility

- [ ] Legacy G&S offers (paymentMethodId = 5) still work
- [ ] Legacy offers show "Seller Collateral" UI
- [ ] Legacy buyers can use BUYER_CONFIRM_RECEIPT
