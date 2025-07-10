import { test } from '@playwright/test';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { TEST_TIMEOUT_MS } from '../constants';
import {
  MAX_POLLING_ATTEMPTS,
  MNEMONIC_MIN_LENGTH,
  POLLING_TIMEOUT_MS,
  VALID_ROLES_BY_ENV,
  WALLET_TYPE_MAP
} from '../constants/auth';
import { getEnvironmentConfig } from '../utils/environment';
dotenv.config();

// Load seeds data
const seedsPath = path.join(process.cwd(), 'seeds.json');
const testEnv = process.env.TEST_ENV || 'local';
let recoveryPhrase: string, phoneNumber: string, phoneCode: string;
let walletRole = process.env.WALLET_ROLE || 'Seller';

const loadParams = async () => {
  // Environment-specific validation for wallet roles
  const validRoles = VALID_ROLES_BY_ENV[testEnv as keyof typeof VALID_ROLES_BY_ENV] || VALID_ROLES_BY_ENV.local;

  console.log(`🌐 Environment: ${testEnv.toUpperCase()}`);
  console.log(`🔑 Using wallet role: ${walletRole}`);

  if (!validRoles.includes(walletRole as any)) {
    throw new Error(
      `Invalid wallet role: ${walletRole} for ${testEnv} environment. Must be one of: ${validRoles.join(', ')}`
    );
  }

  try {
    const seedsData = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));
    const currentEnvMap = WALLET_TYPE_MAP[testEnv as keyof typeof WALLET_TYPE_MAP];
    const walletType = process.env.CI ? 'ciTestWallet' : currentEnvMap[walletRole as keyof typeof currentEnvMap];
    ({ recoveryPhrase, phoneNumber, phoneCode } = seedsData[walletType]);
    console.log(`📱 Using ${walletType} for testing as ${walletRole} role in ${testEnv} environment`);
  } catch (error) {
    console.error('Error loading seeds.json. Ensure seeds.template.json is copied and filled in.');
    throw error;
  }
};

// Function to wait for wallet data in IndexedDB
const waitForWalletDataInIndexedDB = async (page: any): Promise<Record<string, any>> => {
  return await page.evaluate(
    async (constants: any) => {
      const { POLLING_TIMEOUT_MS, MAX_POLLING_ATTEMPTS, MNEMONIC_MIN_LENGTH } = constants;

      const getIndexedDBData = async (): Promise<Record<string, any>> => {
        const request = indexedDB.open('escrow-indexeddb');
        return new Promise((resolve, reject) => {
          request.onerror = () => reject(request.error);
          request.onsuccess = async () => {
            const db = request.result;
            const store = db.transaction('keyvaluepairs', 'readonly').objectStore('keyvaluepairs');
            const data: Record<string, any> = {};

            const keys = await new Promise<IDBValidKey[]>((res, rej) => {
              const req = store.getAllKeys();
              req.onsuccess = () => res(req.result);
              req.onerror = () => rej(req.error);
            });

            for (const key of keys) {
              if (typeof key === 'string') {
                const value = await new Promise((res, rej) => {
                  const req = store.get(key);
                  req.onsuccess = () => res(req.result);
                  req.onerror = () => rej(req.error);
                });
                data[key] = value;
              }
            }

            db.close();
            resolve(data);
          };
        });
      };

      const checkMnemonicInData = (data: Record<string, any>): boolean => {
        const persistWallet = data['persist:wallet'];
        const persistRoot = data['persist:root'];

        // Check persist:wallet
        if (persistWallet && typeof persistWallet === 'string') {
          try {
            const walletData = JSON.parse(persistWallet);
            const mnemonicValue = walletData.mnemonic;
            if (mnemonicValue && typeof mnemonicValue === 'string') {
              const cleanMnemonic = mnemonicValue.replace(/\\"/g, '').replace(/"/g, '').trim();
              if (cleanMnemonic.length > MNEMONIC_MIN_LENGTH) return true;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }

        // Check persist:root
        if (persistRoot && typeof persistRoot === 'string') {
          try {
            const rootData = JSON.parse(persistRoot);
            if (rootData.wallet && typeof rootData.wallet === 'string') {
              const walletData = JSON.parse(rootData.wallet);
              const mnemonicValue = walletData.mnemonic;
              if (mnemonicValue && typeof mnemonicValue === 'string') {
                const cleanMnemonic = mnemonicValue.replace(/\\"/g, '').replace(/"/g, '').trim();
                if (cleanMnemonic.length > MNEMONIC_MIN_LENGTH) return true;
              }
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }

        return false;
      };

      // Poll for wallet data with mnemonic
      for (let i = 0; i < MAX_POLLING_ATTEMPTS; i++) {
        try {
          const data = await getIndexedDBData();
          if (checkMnemonicInData(data)) {
            return data;
          }
        } catch (error) {
          if (i === MAX_POLLING_ATTEMPTS - 1)
            throw new Error(
              `Wallet mnemonic not found after ${(MAX_POLLING_ATTEMPTS * POLLING_TIMEOUT_MS) / 1000} seconds`
            );
        }

        await new Promise(resolve => setTimeout(resolve, POLLING_TIMEOUT_MS));
      }

      throw new Error('Polling completed without finding wallet mnemonic data');
    },
    { POLLING_TIMEOUT_MS, MAX_POLLING_ATTEMPTS, MNEMONIC_MIN_LENGTH }
  );
};

// Increase timeout for the test
test.setTimeout(TEST_TIMEOUT_MS);

// Authentication test
test.describe('@auth', () => {
  test(`Generate ${walletRole} auth state for LocaleCash`, async ({ browser }) => {
    await loadParams();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Get environment configuration
    const config = getEnvironmentConfig(testEnv);

    console.log(`🌐 Navigating to: ${config.url}`);
    await page.goto(config.url, { waitUntil: 'networkidle' });

    // Start login process
    await page.locator('.MuiButtonBase-root').first().click();
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForLoadState('networkidle');

    // Wait for the iframe to load
    const iframeSelector = `#telegram-login-${config.botName}`;
    const iframe = page.locator(iframeSelector);

    // Wait for iframe to be attached
    await iframe.waitFor({ state: 'attached', timeout: 15000 });
    console.log('✅ Iframe found and attached');

    // Get the content frame of the iframe
    const contentFrame = iframe.contentFrame();
    if (!contentFrame) {
      throw new Error(`Content frame not found for iframe: ${iframeSelector}`);
    }

    // Now find the button within the iframe
    const telegramLoginButton = contentFrame.getByRole('button', { name: 'Log in with Telegram' });

    // Wait for popup with timeout and retry logic
    let popup;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        console.log(`🔄 Attempting to open Telegram login popup (attempt ${attempts + 1}/${maxAttempts})...`);

        // Set up popup promise before clicking
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

        // Click the login button
        await telegramLoginButton.click();

        // Wait for popup with timeout
        popup = await popupPromise;
        console.log('✅ Telegram login popup opened successfully');
        break;
      } catch (error) {
        attempts++;
        console.log(`❌ Popup attempt ${attempts} failed:`, error);

        if (attempts >= maxAttempts) {
          throw new Error(
            `Failed to open Telegram login popup after ${maxAttempts} attempts. This may indicate an issue with the Telegram widget or network connectivity.`
          );
        }

        // Wait a bit before retrying
        console.log('⏳ Waiting 2 seconds before retry...');
        await page.waitForTimeout(2000);
      }
    }

    await popup?.waitForLoadState('networkidle');

    // Enter phone details
    await popup?.locator('#login-phone-code').fill(phoneCode);
    await popup?.locator('#login-phone').fill(phoneNumber);
    await popup?.getByRole('button', { name: 'Next' }).click();

    // Wallet import
    await page.getByRole('textbox', { name: 'Enter your recovery phrase (' }).fill(recoveryPhrase);
    await page.getByRole('button', { name: 'Import' }).click();

    console.log('Waiting for successful login and wallet import...');
    await page.waitForLoadState('networkidle');

    console.log('🔍 Starting to poll for wallet data in IndexedDB...');
    // Wait for wallet data to be persisted in IndexedDB
    const indexedDBData = await waitForWalletDataInIndexedDB(page);

    console.log('✅ Wallet data polling completed successfully');

    // Save auth state and IndexedDB data
    const folderAuthData = path.join(process.cwd(), 'data-auth');
    const envAuthFolder = path.join(folderAuthData, testEnv);

    // Create environment-specific folder if it doesn't exist
    if (!fs.existsSync(envAuthFolder)) {
      fs.mkdirSync(envAuthFolder, { recursive: true });
    }

    // Create role-specific auth files
    const authPath = path.join(envAuthFolder, `${walletRole.toLowerCase()}-auth.json`);
    const indexedDBPath = path.join(envAuthFolder, `${walletRole.toLowerCase()}-indexeddb-data.json`);

    console.log(
      `💾 Saving authentication state and IndexedDB data for ${walletRole} role in ${testEnv} environment...`
    );

    try {
      // Save to role-specific location
      await context.storageState({ path: authPath });
      fs.writeFileSync(indexedDBPath, JSON.stringify(indexedDBData, null, 2));

      console.log(`Auth state and IndexedDB data saved successfully for ${walletRole} role.`);
      console.log(`Role-specific auth saved to: ${authPath}`);
      console.log(`Role-specific IndexedDB data saved to: ${indexedDBPath}`);
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    } finally {
      await context.close();
    }
  });
});
