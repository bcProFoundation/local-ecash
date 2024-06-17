import { websocketSaga } from '@bcpros/redux-store';
import { accountSaga } from '@bcpros/redux-store';
import { envelopeSaga } from '@bcpros/redux-store';
import { settingsSaga } from '@bcpros/redux-store';
import { localAccountSaga } from '@bcpros/redux-store';
import { analyticEventSaga } from '@bcpros/redux-store';
import { burnSaga } from '@bcpros/redux-store';
import { categorySaga } from '@bcpros/redux-store';
import { claimSaga } from '@bcpros/redux-store';
import { commentSaga } from '@bcpros/redux-store';
import { countrySaga } from '@bcpros/redux-store';
import { lixiSaga } from '@bcpros/redux-store';
import { messageSaga } from '@bcpros/redux-store';
import { notificationSaga } from '@bcpros/redux-store';
import { pageSaga } from '@bcpros/redux-store';
import { postSaga } from '@bcpros/redux-store';
import { sendSaga } from '@bcpros/redux-store';
import { tokenSaga } from '@bcpros/redux-store';
import { walletSaga } from '@bcpros/redux-store';
import { webpushSaga } from '@bcpros/redux-store';
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

