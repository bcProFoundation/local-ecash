import { Action, Store, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import createSagaMiddleware, { Task } from 'redux-saga';
import rootReducer from './rootReducer';
import { Persistor, persistStore } from 'redux-persist';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import rootSaga from './rootSaga';
// import rootSaga from './rootSaga';

export interface SagaStore extends Store {
  __sagaTask: Task;
  __persistor: Persistor
}

export const makeStore = () => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sagaMiddleware = createSagaMiddleware({});


  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      return (
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
          }
        }).concat(sagaMiddleware)
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
