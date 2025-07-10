// Authentication related constants

// Polling configuration
export const POLLING_TIMEOUT_MS = 500;
export const MAX_POLLING_ATTEMPTS = 40;
export const MNEMONIC_MIN_LENGTH = 10;

// Valid wallet roles by environment
export const VALID_ROLES_BY_ENV = {
  local: ['Seller', 'Buyer', 'Arb'],
  dev: ['Seller', 'Buyer']
} as const;

// Wallet type mapping for seeds.json
export const WALLET_TYPE_MAP = {
  local: {
    Seller: 'SellerLocalWallet',
    Buyer: 'BuyerLocalWallet',
    Arb: 'ArbLocalWallet'
  },
  dev: {
    Seller: 'SellerDevWallet',
    Buyer: 'BuyerDevWallet'
  }
} as const;
