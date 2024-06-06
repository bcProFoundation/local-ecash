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
import { Providers } from '../lib/provider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SDKProvider acceptCustomStyles debug>
      <Providers>
        <html lang="en">
          <AppRouterCacheProvider>
            <body>{children}</body>
          </AppRouterCacheProvider>
        </html>
      </Providers>
    </SDKProvider>
  );
}
