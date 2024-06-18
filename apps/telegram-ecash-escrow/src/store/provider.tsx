'use client';

import {
  AuthenticationProvider,
  AuthorizationProvider,
  ServiceWorkerProvider,
  SocketProvider,
  WalletProvider,
  callConfig
} from '@bcpros/redux-store';
import { Box, CircularProgress } from '@mui/material';
import React, { useRef } from 'react';
import OutsideCallConsumer from 'react-outside-call';
import { Provider } from 'react-redux';
import { persistStore, type Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { AppStore, makeStore } from './store';

const PGate = PersistGate as any;

interface ReduxProviderProps {
  children: React.ReactNode;
}

const LoadingComponent = () => {
  return (
    <>
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    </>
  );
};

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  const storeRef = useRef<AppStore>();
  const persistorRef = useRef<Persistor>({} as Persistor);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    persistorRef.current = persistStore(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      <PGate
        persistor={persistorRef.current}
        loading={(bootstrapped: boolean) => (bootstrapped ? null : LoadingComponent())}
      >
        <SocketProvider>
          <ServiceWorkerProvider>
            <WalletProvider>
              <AuthenticationProvider>
                <AuthorizationProvider>
                  <OutsideCallConsumer config={callConfig}>{children}</OutsideCallConsumer>
                </AuthorizationProvider>
              </AuthenticationProvider>
            </WalletProvider>
          </ServiceWorkerProvider>
        </SocketProvider>
      </PGate>
    </Provider>
  );
};

export default ReduxProvider;
