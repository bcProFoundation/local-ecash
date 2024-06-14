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

const makeStore = () => {
  const isServer = typeof window === 'undefined';

  const sagaMiddleware = createSagaMiddleware({
    onError: (error: Error, { sagaStack: string }) => {
      console.log(error);
    },
    context: {
    }
  });

  const routerMiddleware = createRouterMiddleware();
  const { asPath } = (context as any).ctx || (Router as any).router || {};
  let initialState;
  if (asPath) {
    initialState = {
      router: initialRouterState(asPath)
    };
  }

  let store;

  if (isServer) {
    store = configureStore({
      reducer: serverReducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware),
      devTools: false
    });
  } else {
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
            .concat(routerMiddleware)
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
      preloadedState: initialState
    });
    setupListeners(store.dispatch);

    (store as any).__persistor = persistStore(store);
  }

  (store as SagaStore).__sagaTask = sagaMiddleware.run(rootSaga);
  return store;
};

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
