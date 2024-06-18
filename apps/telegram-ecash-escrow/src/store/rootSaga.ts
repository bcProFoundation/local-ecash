import { countWatcher } from '@bcpros/counter';
import { all } from 'redux-saga/effects';

export default function* rootSaga() {
  yield all([countWatcher]);
}
