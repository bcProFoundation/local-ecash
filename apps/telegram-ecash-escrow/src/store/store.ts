import { Action, Store, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { FLUSH, PAUSE, PERSIST, PURGE, Persistor, REGISTER, REHYDRATE, persistStore } from 'redux-persist';
import createSagaMiddleware, { Task } from 'redux-saga';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

export interface SagaStore extends Store {
  __sagaTask: Task;
  __persistor: Persistor;
}

export const makeStore = () => {
  const sagaMiddleware = createSagaMiddleware({
    context: {}
  });

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
      }).concat(sagaMiddleware);
    },
    devTools:
      process.env.NODE_ENV === 'production'
        ? false
        : {
            actionsDenylist: [
              'wallet/writeWalletStatus',
              'posts/setShowCreatePost',
              'analyticEvent/batchEvents',
              'analyticEvent/analyticEvent'
            ]
          }
  });
  setupListeners(store.dispatch);

  (store as SagaStore).__persistor = persistStore(store);
  (store as SagaStore).__sagaTask = sagaMiddleware.run(rootSaga);
  return store;
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
// Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
