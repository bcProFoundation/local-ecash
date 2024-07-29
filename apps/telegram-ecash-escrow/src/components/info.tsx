'use client';
import { generateAccount, useSliceDispatch as useLixiSliceDispatch } from '@bcpros/redux-store';
import axiosClient from '@bcpros/redux-store/build/main/utils/axiosClient';
import { Box, Skeleton } from '@mui/material';
import { LoginButton, TelegramAuthData } from '@telegram-auth/react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

function LoadingPlaceholder() {
  return (
    <Box padding="6">
      <Skeleton variant="rectangular" />
    </Box>
  );
}

export function Info({ botUsername }: { botUsername: string }) {
  const { status } = useSession();
  const router = useRouter();
  const dispatch = useLixiSliceDispatch();

  if (status === 'loading') {
    return <LoadingPlaceholder />;
  }

  return (
    <React.Fragment>
      {status === 'unauthenticated' ? (
        <LoginButton
          botUsername={botUsername}
          showAvatar={true}
          onAuthCallback={async (data: TelegramAuthData) => {
            try {
              await axiosClient.get(`/api/accounts/telegram/${data.id}`);
              signIn('telegram-login', { redirect: false }, data as any);

              router.push(`/import?id=${data.id}`);
            } catch {
              dispatch(generateAccount({ coin: 'XEC', telegramId: data.id.toString() }));
              signIn('telegram-login', { redirect: false }, data as any);

              router.push('/home');
            }
          }}
        />
      ) : (
        <h1 style={{ color: 'white' }}>You already signed in</h1>
      )}
    </React.Fragment>
  );
}
