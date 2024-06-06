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
import { SDKProvider } from '@tma.js/sdk-react';
import { ReduxProvider } from '../store/provider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SDKProvider acceptCustomStyles debug>
      <ReduxProvider>
        <html lang="en">
          <AppRouterCacheProvider>
            <body>{children}</body>
          </AppRouterCacheProvider>
        </html>
      </ReduxProvider>
    </SDKProvider>
  );
}


