import React from 'react';
import ReactDOM from 'react-dom/client';
import { makeStore, AppStore } from '@local-store/store';
import { PersistGate } from 'redux-persist/integration/react';
import OutsideCallConsumer from 'react-outside-call';
import { WalletProvider } from '@context/walletProvider';
import { callConfig } from '@context/shareContext';
import { SocketProvider } from '@context/socketContext';
import App from './App.tsx';
import './index.css';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { RouterProvider, Router, createRouter } from '@tanstack/react-router';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { Box, CircularProgress, ThemeProvider } from '@mui/material';
import { TmaSDKLoader } from '@components/Common/TmaSDKLoader.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

let persistor = persistStore(makeStore());

const rootElement = document.getElementById('root')!;

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient
  },
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0
});

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  const LoadingComponent = () => {
    return (
      <>
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress color="primary" />
        </Box>
      </>
    );
  };
  root.render(
    <TmaSDKLoader>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </TmaSDKLoader>
    // <Provider store={makeStore()}>
    //   <PersistGate loading={<LoadingComponent />} persistor={persistor}>
    //     <SocketProvider>
    //       <WalletProvider>
    //         <OutsideCallConsumer config={callConfig}>
    //           <ThemeProvider theme={theme}>
    //             <TmaSDKLoader>
    //               <RouterProvider router={router} />
    //             </TmaSDKLoader>
    //           </ThemeProvider>
    //         </OutsideCallConsumer>
    //       </WalletProvider>
    //     </SocketProvider>
    //   </PersistGate>
    // </Provider>
  );
}
