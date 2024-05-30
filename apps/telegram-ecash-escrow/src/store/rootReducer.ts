import { counterReducer } from '@bcpros/counter';
import { combineReducers } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import indexedDbStorage from 'redux-persist-indexeddb-storage';
import { WalletState, walletStateReducer } from '@bcpros/redux-store';

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
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? indexedDbStorage('escrow-indexeddb')
    : createNoopStorage();


// const _persistConfig = {
//   timeout: 1000,
//   key: 'root',
//   version: 0,
//   storage: storage('escrow-indexeddb'),
//   blacklist: [
//     'accounts',
//     'router',
//     'modal',
//     'action-sheet',
//     'toast',
//     'wallet',
//     'api',
//     'root',
//     'posts',
//     'pages',
//     'burn',
//     'loading',
//     'notifications'
//   ],
// };

const counterPersistConfig = {
  key: 'counter',
  storage,
  whitelist: ['counter']
};

const walletPersistConfig: PersistConfig<WalletState> = {
  key: 'wallet',
  storage,
  whitelist: ['wallet']
};

const reducer = combineReducers({
  counter: persistReducer(counterPersistConfig, counterReducer),
  wallet: persistReducer(walletPersistConfig, walletStateReducer)
});

export default reducer;

