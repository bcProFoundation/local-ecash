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
import ReduxProvider from '../store/provider';
import { TelegramAuthProvider } from '../store/telegram-auth-provider';
import theme from '../theme/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#04080F', margin: '0' }}>
        <TelegramAuthProvider>
          <ReduxProvider>
            <SDKProvider acceptCustomStyles debug>
              <AppRouterCacheProvider>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
              </AppRouterCacheProvider>
            </SDKProvider>
          </ReduxProvider>
        </TelegramAuthProvider>
      </body>
    </html>
  );
}
