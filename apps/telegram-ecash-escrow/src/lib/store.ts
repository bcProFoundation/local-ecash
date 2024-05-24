import { counterReducer } from '@bcpros/counter';
import { Action, Store, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import createSagaMiddleware, { Task } from 'redux-saga';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

export interface SagaStore extends Store {
  __sagaTask: Task;
}

const sagaMiddleware = createSagaMiddleware({
  context: {}
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: {
    counter: counterReducer
  },

  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: false
    });

    return middleware.concat(sagaMiddleware);
  },
  devTools: true
});

setupListeners(store.dispatch);
(store as SagaStore).__sagaTask = sagaMiddleware.run(rootSaga);

// Infer the type of makeStore
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
// Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
