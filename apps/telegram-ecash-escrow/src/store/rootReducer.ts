import { counterReducer } from '@bcpros/counter';
import {
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
  walletStateReducer,
  api
} from '@bcpros/redux-store';
import { combineReducers } from '@reduxjs/toolkit';

const reducer = combineReducers({
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

export default reducer;
