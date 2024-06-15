/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { SDKProvider } from '@tma.js/sdk-react';
import React from 'react';
import { ReduxProvider } from '../store/provider';
import theme from '../theme/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SDKProvider acceptCustomStyles debug>
      <ReduxProvider>
        <html lang="en">
          <body>
            <AppRouterCacheProvider>
              <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </AppRouterCacheProvider>
          </body>
        </html>
      </ReduxProvider>
    </SDKProvider>
  );
}
