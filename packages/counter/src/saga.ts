import { put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { countSelector } from '@/store/counter/selectors';
import { increment, decrement } from './actions';

function* incrementWorker() {
  let count: ReturnType<typeof countSelector> = yield select(countSelector)

  count += 1

}

function* decrementWatcher() {
  let count: ReturnType<typeof countSelector> = yield select(countSelector)

  count -= 1
}


export function* countWatcher() {
  yield takeEvery(increment.type, incrementWorker)
  yield takeEvery(decrement.type, decrementWatcher)
}