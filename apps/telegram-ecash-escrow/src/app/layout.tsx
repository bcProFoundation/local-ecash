/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
'use client'
import { globalTokens as $ } from '@/src/app/globalTokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { Providers } from '../lib/provider';
import './globals.css';
import { SDKProvider } from '@tma.js/sdk-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SDKProvider acceptCustomStyles debug>
      <Providers>
        <html {...stylex.props(styles.html, styles.reset)} lang="en">
          <body {...stylex.props(styles.reset, styles.body)}>{children}</body>
        </html>
      </Providers>
    </SDKProvider>
  );
}

const DARK = '@media (prefers-color-scheme: dark)';

const styles = stylex.create({
  html: {
    colorScheme: 'light dark'
  },
  reset: {
    minHeight: '100%',
    margin: 0,
    padding: 0
  },
  body: {
    color: `rgba(${$.foregroundR}, ${$.foregroundG}, ${$.foregroundB}, 1)`,
    backgroundImage: {
      default: 'linear-gradient(to bottom, rgb(214, 219, 220), white)',
      [DARK]: 'linear-gradient(to bottom, rgb(20, 22, 27), black)'
    }
  }
});
