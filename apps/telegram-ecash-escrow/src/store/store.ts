import { Action, Store, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistStore } from 'redux-persist';
import createSagaMiddleware, { Task } from 'redux-saga';
import { api } from '@bcpros/redux-store/api/baseApi';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

export interface SagaStore extends Store {
  __sagaTask: Task;
}

const sagaMiddleware = createSagaMiddleware({
  context: {}
});

export const makeStore = () => {
  const isServer = typeof window === 'undefined';

  const sagaMiddleware = createSagaMiddleware({
    onError: (error: Error, { sagaStack: string }) => {
      console.log(error);
    },
    context: {
    }
  });

  let store;

  store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      return (
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
          }
        })
          // We only need one middleware for rtk query here
          // because all apis are splitted, but actually be enhanced from only 1 baseApi
          // If we concat multiple middleware here, each time there's an internal rtk query action
          // multiple instances of same action will be dispatched, caused onQueryStarted run multiple times.
          .concat(api.middleware)
          .concat(sagaMiddleware)
      );
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
        },
  });
  setupListeners(store.dispatch);

  (store as any).__persistor = persistStore(store);
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
