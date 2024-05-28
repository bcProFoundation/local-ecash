import { routerReducer } from 'connected-next-router';
import { counterReducer } from '@bcpros/counter';
import { combineReducers } from '@reduxjs/toolkit';
import { createMigrate, PersistConfig, persistReducer } from 'redux-persist';
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
  walletStateReducer,
  actionReducer
} from '@bcpros/redux-store';
import { api } from '@bcpros/redux-store/api/baseApi';
import storage from 'redux-persist-indexeddb-storage';

const migration = {
  0: (state: { burn: any; }) => {
    return {
      ...state,
      burn: {
        ...state.burn,
        burnQueue: [],
        failQueue: []
      }
    };
  }
};

const persistConfig = {
  timeout: 1000,
  key: 'root',
  version: 0,
  storage: storage('lixi-indexeddb'),
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
  ],
  migrate: createMigrate(migration, { debug: false })
};

const walletPersistConfig: PersistConfig<WalletState> = {
  key: 'wallet',
  storage: storage('lixi-indexeddb')
};

const localAccountPersistConfig: PersistConfig<LocalUserAccountsState> = {
  key: 'localAccounts',
  storage: storage('lixi-indexeddb')
};

const accountPersistConfig: PersistConfig<AccountsState> = {
  key: 'accounts',
  storage: storage('lixi-indexeddb'),
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
  storage: storage('escrow-app-indexeddb'),
  blacklist: ['selectedId']
};
const lixiPersistConfig: PersistConfig<LixiesState> = {
  key: 'lixies',
  storage: storage('escrow-app-indexeddb')
};

const claimsPersistConfig: PersistConfig<ClaimsState> = {
  key: 'claims',
  storage: storage('escrow-app-indexeddb')
};

const shopPersistConfig: PersistConfig<PageState> = {
  key: 'pages',
  storage: storage('lixi-indexeddb'),
  blacklist: ['currentPageMessageSession']
};

const settingsPersistConfig: PersistConfig<SettingsState> = {
  key: 'settings',
  storage: storage('lixi-indexeddb'),
  whitelist: ['locale']
};

const countryPersistConfig: PersistConfig<CountriesState> = {
  key: 'countries',
  storage: storage('lixi-indexeddb')
};

const statePersistConfig: PersistConfig<StatesState> = {
  key: 'states',
  storage: storage('lixi-indexeddb')
};

const categoryPersistConfig: PersistConfig<CategoriesState> = {
  key: 'categories',
  storage: storage('lixi-indexeddb')
};

const pageMessagePersistConfig: PersistConfig<PageMessageSessionState> = {
  key: 'pageMessage',
  storage: storage('lixi-indexeddb')
};


export const serverReducer = combineReducers({
  router: routerReducer,
  counter: counterReducer,
  wallet: walletStateReducer,
  accounts: accountReducer,
  localAccounts: localUserAccountReducer,
  posts: postReducer,
  lixies: lixiReducer,
  claims: claimReducer,
  settings: settingsReducer,
  pages: pageReducer,
  tokens: tokenReducer,
  notifications: notificationReducer,
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  actionSheet: actionSheetReducer,
  toast: toastReducer,
  error: errorReducer,
  countries: countryReducer,
  states: stateReducer,
  categories: categoryReducer,
  burn: burnReducer,
  pageMessage: messageReducer,
  [api.reducerPath]: api.reducer,
  action: actionReducer
});

export const clientReducer = combineReducers({
  router: routerReducer,
  counter: counterReducer,
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
  [api.reducerPath]: api.reducer,
  action: actionReducer
});

export default persistReducer(persistConfig, clientReducer);
