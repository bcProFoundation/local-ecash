# LocaleCash Testing

Playwright-based end-to-end testing suite for the LocaleCash escrow application.

## Quick Start Guide

### 📋 Prerequisites

- Node.js 18+
- pnpm
- Playwright browsers installed
- Valid Telegram test accounts with recovery phrases
- LocaleCash application running (local) or dev environment access

---

## 🚀 Setup Instructions

### Step 1: Configure Seeds File

```bash
# Copy the template and fill with your data
cp seeds.template.json seeds.json
```

**Edit `seeds.json` with:**

- Real test wallet recovery phrases (12 words each)
- Valid phone numbers for Telegram authentication
- Accessible test accounts

⚠️ **Important**: Never commit `seeds.json` to version control!

---

### Step 2: Create Offer for Testing

**Before running tests, you need to create an offer manually:**

1. **Login as Seller account** in your target environment
2. **Create an offer** using "Goods/Service" method and type "SellOffer"
3. **Copy the Offer ID** from the URL or offer details
4. **Update your `.env` file** with the Offer ID:

## ⚙️ Environment Configuration

Create/update `.env` file:

```bash
# Environment URLs
LOCAL_LINK=https://escrow.test
DEV_LINK=https://dev.localecash.com

# Telegram Bot Names
LOCAL_BOT_NAME=your_bot_name
DEV_BOT_NAME=local_ecash_dev_bot

# Current Environment (local or dev)
TEST_ENV=local

# Offer IDs for Testing
OFFER_ID=your_local_offer_id
DEV_OFFER_ID=your_dev_offer_id
```

---

## 🎯 Running Tests

### Option A: Local Testing

```bash
# 1. Generate authentication for local environment
pnpm run test:auth:local

# 2. Run all main flow tests
pnpm run test:main-flows
```

**What this does:**

- Sets up Seller, Buyer, and Arbitrator accounts for local environment
- Runs all escrow flows: release, return, dispute (with and without deposits)

---

### Option B: Dev Environment Testing

- Node: v18.17.0, pnpm: 9.15.9

```bash
# 1. Generate authentication for dev environment
pnpm run test:auth:dev

# 2. Run random test selection
pnpm run test:dev:random
```

**What this does:**

- Sets up Seller and Buyer accounts for dev environment
- Randomly selects and runs one of: release, release-with-deposit, return, return-with-deposit

---

## 📁 Test Structure

```
tests/
├── local/               # Local environment tests
│   ├── seller-release-local.spec.ts
│   ├── seller-release-have-buyer-deposit-local.spec.ts
│   ├── return-flow-local.spec.ts
│   ├── return-flow-buyer-deposit-local.spec.ts
│   ├── dispute-flow-local.spec.ts
│   └── dispute-flow-buyer-deposit-local.spec.ts
└── dev/                 # Dev environment tests
    └── random-main-flow.spec.ts

utils/
├── index.ts             # Context setup utilities with UTXO loading
├── orderUtils.ts        # Order creation utilities
└── environment.ts       # Environment configuration

scripts/
└── run-random-dev-test.sh  # Random test runner for dev
```

---

## 🔧 Available Commands

### Authentication Management

```bash
# Generate auth for all roles
pnpm run test:auth:local      # Local environment (Seller, Buyer, Arb)
pnpm run test:auth:dev        # Dev environment (Seller, Buyer)

# Generate auth for specific roles
pnpm run test:auth:seller
pnpm run test:auth:buyer
pnpm run test:auth:arb

# Dev environment specific
pnpm run test:auth:dev:seller
pnpm run test:auth:dev:buyer
```

### Test Execution

```bash
# Main test flows
pnpm run test:main-flows         # All local flows
pnpm run test:dev:random-flows   # Random dev flow

# Individual test flows
pnpm run test:release                    # Basic release flow
pnpm run test:release-with-deposit      # Release with buyer deposit
pnpm run test:return                     # Basic return flow
pnpm run test:return-with-deposit       # Return with buyer deposit
pnpm run test:dispute                    # Basic dispute flow
pnpm run test:dispute-with-deposit      # Dispute with buyer deposit
```

---

## 🎲 Random Dev Testing

The `test:dev:random-flows` command randomly selects one of four test scenarios:

- **Release flow** (no deposit)
- **Release with deposit**
- **Return flow** (no deposit)
- **Return with deposit**

This script:

- Sets `TEST_ENV=dev` automatically
- Provides random test coverage
- Perfect for continuous testing

---

## 🔍 Test Scenarios Explained

### Release Flow

1. Buyer creates order → Seller escrows → Seller releases → Buyer claims

### Return Flow

1. Buyer creates order → Seller escrows → Buyer returns → Seller reclaims

### Dispute Flow

1. Buyer creates order → Seller escrows → Dispute created → Arbitrator resolves

### With Deposits

All flows can include buyer security deposits for additional protection.

---

## 🛠️ Troubleshooting

**Authentication Issues:**

- Verify `seeds.json` has correct 12-word recovery phrases
- Ensure phone numbers are accessible for Telegram verification
- Check bot names in `.env` match your Telegram bots

**Test Failures:**

- Ensure offer ID exists and is active in the target environment
- Verify environment URLs are accessible
- Check that wallets have sufficient balance
- Regenerate auth if tests were interrupted

**UTXO/Loading Issues:**

- The new UTXO detection should eliminate most timing issues
- If tests still fail, check wallet connectivity
- Ensure proper network access to blockchain APIs

**Network Issues:**

- Check internet connection
- Verify VPN settings if using dev environment
- Ensure Telegram access is available

---

## 🔒 Security Notes

- ⚠️ **Never commit `seeds.json`** - contains sensitive wallet data
- Use test wallets only, never production wallets
- Keep authentication files secure (`data-auth/` folder)
