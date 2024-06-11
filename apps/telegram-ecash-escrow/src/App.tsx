import { TmaSDKLoader } from '@/components/Common/TmaSDKLoader';
import { ThemeProvider, useMediaQuery } from '@mui/material';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './App.css';
import { routeTree } from './routeTree.gen';
import { ReduxProvider } from './store/provider';
import { darkTheme, lightTheme } from './theme/theme';

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
};

const router = createRouter({ routeTree });

const App = () => {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <>
      <TmaSDKLoader>
        <ReduxProvider>
          <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
            <RouterProvider router={router} />
          </ThemeProvider>
        </ReduxProvider>
      </TmaSDKLoader>
    </>
  );
};

export default App;
