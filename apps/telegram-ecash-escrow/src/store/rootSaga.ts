import { websocketSaga } from '@bcpros/redux-store';
import accountSaga from '@bcpros/redux-store/build/main/store/account/saga';
import analyticEventSaga from '@bcpros/redux-store/build/main/store/analytic-event/saga';
import burnSaga from '@bcpros/redux-store/build/main/store/burn/saga';
import categorySaga from '@bcpros/redux-store/build/main/store/category/saga';
import claimSaga from '@bcpros/redux-store/build/main/store/claim/saga';
import commentSaga from '@bcpros/redux-store/build/main/store/comment/saga';
import countrySaga from '@bcpros/redux-store/build/main/store/country/saga';
import envelopeSaga from '@bcpros/redux-store/build/main/store/envelope/saga';
import lixiSaga from '@bcpros/redux-store/build/main/store/lixi/saga';
import localAccountSaga from '@bcpros/redux-store/build/main/store/localAccount/saga';
import messageSaga from '@bcpros/redux-store/build/main/store/message/saga';
import notificationSaga from '@bcpros/redux-store/build/main/store/notification/saga';
import pageSaga from '@bcpros/redux-store/build/main/store/page/saga';
import postSaga from '@bcpros/redux-store/build/main/store/post/saga';
import sendSaga from '@bcpros/redux-store/build/main/store/send/saga';
import settingsSaga from '@bcpros/redux-store/build/main/store/settings/saga';
import tokenSaga from '@bcpros/redux-store/build/main/store/token/saga';
import walletSaga from '@bcpros/redux-store/build/main/store/wallet/saga';
import webpushSaga from '@bcpros/redux-store/build/main/store/webpush/saga';
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
