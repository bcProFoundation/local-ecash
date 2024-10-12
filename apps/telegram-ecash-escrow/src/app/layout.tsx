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
import { SDKProvider } from '@telegram-apps/sdk-react';
import React from 'react';
import ModalManager from '../components/ModalManager';
import { UtxoProvider } from '../store/context/utxoProvider';
import ReduxProvider from '../store/provider';
import { TelegramAuthProvider } from '../store/telegram-auth-provider';
import { TelegramMiniAppProvider } from '../store/telegram-mini-app-provider';
import theme from '../theme/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, interactive-widget=resizes-content"
        />
        <meta name="application-name" content="Local eCash" />
        <meta name="description" content="P2P exchange for eCash" />
        <meta name="version" content={process.env.NEXT_PUBLIC_APP_VERSION} />
        <meta name="commit-hash" content={process.env.NEXT_PUBLIC_COMMIT_HASH} />
      </head>
      <body style={{ background: '#04080F', margin: '0' }}>
        <TelegramAuthProvider>
          <ReduxProvider>
            <SDKProvider acceptCustomStyles debug>
              <TelegramMiniAppProvider>
                <AppRouterCacheProvider>
                  <UtxoProvider>
                    <ThemeProvider theme={theme}>
                      <ModalManager />
                      {children}
                    </ThemeProvider>
                  </UtxoProvider>
                </AppRouterCacheProvider>
              </TelegramMiniAppProvider>
            </SDKProvider>
          </ReduxProvider>
        </TelegramAuthProvider>
      </body>
    </html>
  );
}
