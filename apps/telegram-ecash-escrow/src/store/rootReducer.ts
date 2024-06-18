import { counterReducer } from '@bcpros/counter';
import {
  AccountsState,
  CategoriesState,
  ClaimsState,
  CountriesState,
  LixiesState,
  LocalUserAccountsState,
  PageMessageSessionState,
  PageState,
  PostState,
  SettingsState,
  StatesState,
  WalletState,
  accountReducer,
  actionReducer,
  actionSheetReducer,
  burnReducer,
  categoryReducer,
  claimReducer,
  countryReducer,
  envelopeReducer,
  errorReducer,
  lixiReducer,
  loadingReducer,
  localUserAccountReducer,
  messageReducer,
  modalReducer,
  notificationReducer,
  pageReducer,
  postReducer,
  settingsReducer,
  stateReducer,
  toastReducer,
  tokenReducer,
  walletStateReducer
} from '@bcpros/redux-store';
import { combineReducers } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import indexedDbStorage from 'redux-persist-indexeddb-storage';

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: number) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    }
  };
};

const storage = typeof window !== 'undefined' ? indexedDbStorage('escrow-indexeddb') : createNoopStorage();

const _persistConfig = {
  timeout: 1000,
  key: 'root',
  version: 0,
  storage,
  blacklist: [
    'accounts',
    'router',
    'modal',
    'action-sheet',
    'toast',
    'wallet',
    'api',
    'root',
    'posts',
    'pages',
    'burn',
    'loading',
    'notifications'
  ]
};

const counterPersistConfig = {
  key: 'counter',
  storage,
  whitelist: ['counter']
};

const walletPersistConfig: PersistConfig<WalletState> = {
  key: 'wallet',
  storage
};

const localAccountPersistConfig: PersistConfig<LocalUserAccountsState> = {
  key: 'localAccounts',
  storage
};

const accountPersistConfig: PersistConfig<AccountsState> = {
  key: 'accounts',
  storage,
  blacklist: [
    `envelopeUpload`,
    'pageCoverUpload',
    'pageAvatarUpload',
    'postCoverUploads',
    'messageUploads',
    'leaderBoard',
    'graphqlRequestLoading',
    'productImageUploads',
    'accountInfoTemp',
    'commentUpload'
  ],
  timeout: 0
};
const postPersistConfig: PersistConfig<PostState> = {
  key: 'posts',
  storage,
  blacklist: ['selectedId']
};
const lixiPersistConfig: PersistConfig<LixiesState> = {
  key: 'lixies',
  storage
};

const claimsPersistConfig: PersistConfig<ClaimsState> = {
  key: 'claims',
  storage
};

const shopPersistConfig: PersistConfig<PageState> = {
  key: 'pages',
  storage,
  blacklist: ['currentPageMessageSession']
};

const settingsPersistConfig: PersistConfig<SettingsState> = {
  key: 'settings',
  storage,
  whitelist: ['locale']
};

const countryPersistConfig: PersistConfig<CountriesState> = {
  key: 'countries',
  storage
};

const statePersistConfig: PersistConfig<StatesState> = {
  key: 'states',
  storage
};

const categoryPersistConfig: PersistConfig<CategoriesState> = {
  key: 'categories',
  storage
};

const pageMessagePersistConfig: PersistConfig<PageMessageSessionState> = {
  key: 'pageMessage',
  storage
};

const reducer = combineReducers({
  counter: persistReducer(counterPersistConfig, counterReducer),
  wallet: persistReducer(walletPersistConfig, walletStateReducer),
  accounts: persistReducer(accountPersistConfig, accountReducer),
  localAccounts: persistReducer(localAccountPersistConfig, localUserAccountReducer),
  posts: persistReducer(postPersistConfig, postReducer),
  lixies: persistReducer(lixiPersistConfig, lixiReducer),
  claims: persistReducer(claimsPersistConfig, claimReducer),
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  pages: persistReducer(shopPersistConfig, pageReducer),
  tokens: tokenReducer,
  notifications: notificationReducer,
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  actionSheet: actionSheetReducer,
  toast: toastReducer,
  error: errorReducer,
  countries: persistReducer(countryPersistConfig, countryReducer),
  states: persistReducer(statePersistConfig, stateReducer),
  categories: persistReducer(categoryPersistConfig, categoryReducer),
  burn: burnReducer,
  pageMessage: persistReducer(pageMessagePersistConfig, messageReducer),
  action: actionReducer
});

export default reducer;
