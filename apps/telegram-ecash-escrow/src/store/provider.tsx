'use client';

import { Box, CircularProgress } from '@mui/material';
import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppStore, SagaStore, makeStore } from './store';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
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

  return (
    <Provider store={storeRef.current}>
      <PersistGate persistor={(storeRef.current as SagaStore).__persistor} loading={<LoadingComponent />}>
        {children}
      </PersistGate>
    </Provider>
  );
}
