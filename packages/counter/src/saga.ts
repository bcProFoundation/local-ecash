import { select, takeEvery } from 'redux-saga/effects'

import { decrement, increment } from './actions'
import { countSelector } from './selectors'

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
