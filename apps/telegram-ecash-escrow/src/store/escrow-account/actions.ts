import { AccountType, COIN, CreateAccountCommand, GenerateAccountType } from '@bcpros/lixi-models';
import { aesGcmEncrypt, getCurrentLocale, postAccount } from '@bcpros/redux-store';
import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, fork, getContext, put, select, takeLatest } from 'redux-saga/effects';
import { generateEscrowAccount } from './saga';

/**
 * Generate a account with random encryption password
 * @param action The data to needed generate a account
 */
function* generateEscrowAccountSaga(action: PayloadAction<GenerateAccountType>) {
  const { coin, telegramId, accountType } = action.payload;
  console.log('🚀 ~ function*generateEscrowAccountSaga ~ action.payload:', action.payload);

  const xpiContext = yield getContext('useXPI');
  const { getXPI } = xpiContext();
  console.log('🚀 ~ function*generateEscrowAccountSaga ~ getXPI:', getXPI);
  const XPI = getXPI();
  console.log('🚀 ~ function*generateEscrowAccountSaga ~ XPI:', XPI);
  const lang = 'english';
  const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);
  console.log('🚀 ~ function*generateEscrowAccountSaga ~ Bip39128BitMnemonic:', Bip39128BitMnemonic);

  let encryptedMnemonic: string = undefined;
  let mnemonicHash: string = undefined;

  if (!telegramId && accountType !== AccountType.NONCUSTODIAL) {
    // Encrypted mnemonic is encrypted by itself
    encryptedMnemonic = yield call(aesGcmEncrypt, Bip39128BitMnemonic, Bip39128BitMnemonic);
    console.log('🚀 ~ function*generateEscrowAccountSaga ~ encryptedMnemonic:', encryptedMnemonic);

    // Hash mnemonic and store it in the database
    const mnemonicUtf8 = new TextEncoder().encode(Bip39128BitMnemonic); // encode mnemonic as UTF-8
    console.log('🚀 ~ function*generateEscrowAccountSaga ~ mnemonicUtf8:', mnemonicUtf8);
    const mnemonicHashBuffer = yield call([crypto.subtle, crypto.subtle.digest], 'SHA-256', mnemonicUtf8); // hash the mnemonic
    mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');
    console.log('🚀 ~ function*generateEscrowAccountSaga ~ mnemonicHash:', mnemonicHash);
  }

  const locale: string | undefined = yield select(getCurrentLocale);
  console.log('🚀 ~ function*generateEscrowAccountSaga ~ locale:', locale);

  const account: CreateAccountCommand = {
    mnemonic: Bip39128BitMnemonic,
    encryptedMnemonic,
    mnemonicHash,
    language: locale,
    rootCoin: coin ? coin : COIN.XPI,
    telegramId: telegramId || undefined,
    accountType: accountType ? accountType : AccountType.NORMAL
  };

  console.log('🚀 ~ function*generateEscrowAccountSaga ~ account:', account);

  yield put(postAccount(account));
}

function* watchGenerateAccount() {
  yield takeLatest(generateEscrowAccount.type, generateEscrowAccountSaga);
}

export function* escrowAccountSaga() {
  yield all([fork(watchGenerateAccount)]);
}
