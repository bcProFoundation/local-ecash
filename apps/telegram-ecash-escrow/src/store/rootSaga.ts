import {
  analyticEventSaga,
  burnSaga,
  categorySaga,
  claimSaga,
  commentSaga,
  countrySaga,
  envelopeSaga,
  lixiSaga,
  localAccountSaga,
  messageSaga,
  notificationSaga,
  pageSaga,
  postSaga,
  sendSaga,
  settingsSaga,
  tokenSaga,
  walletSaga,
  webpushSaga,
  websocketSaga
} from '@bcpros/redux-store';
import { accountSaga } from '@bcpros/redux-store/build/main/store/account';
import { all } from 'redux-saga/effects';

export function* emptySaga() {
  yield all([]);
}

export default function* rootSaga() {
  yield all([
    walletSaga(),
    localAccountSaga(),
    accountSaga(),
    lixiSaga(),
    sendSaga(),
    claimSaga(),
    envelopeSaga(),
    settingsSaga(),
    notificationSaga(),
    webpushSaga(),
    pageSaga(),
    postSaga(),
    commentSaga(),
    countrySaga(),
    tokenSaga(),
    burnSaga(),
    categorySaga(),
    messageSaga(),
    websocketSaga(),
    analyticEventSaga()
  ]);
}
