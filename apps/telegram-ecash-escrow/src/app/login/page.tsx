'use client';
import { generateAccount, useSliceDispatch as useLixiSliceDispatch } from '@bcpros/redux-store';
import axiosClient from '@bcpros/redux-store/build/main/utils/axiosClient';
import styled from '@emotion/styled';
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

const ContainerHome = styled.div`
  display: grid;
  grid-template-rows: 85% 15%;
  padding: 1rem;
  height: 100vh;
  text-align: center;
`;

const FeatureEducation = styled.div`
  img {
    max-width: 100%;
  }
  .feature-title {
    font-weight: 600;
    align-items: center;
    text-align: center;
    line-height: 34px;
  }
  .feature-subtitle {
    font-size: 16px;
    text-align: center;
    color: #9aa5ac;
    font-weight: 300;
    padding-top: 15px;
    line-height: 28px;
  }
`;

const FunctionalBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 0.5rem;
`;

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const dispatch = useLixiSliceDispatch();

  if (status === 'loading') {
    return <LoadingPlaceholder />;
  }

  if (status === 'authenticated') {
    return <h1 style={{ color: 'white' }}>You already signed in</h1>;
  }

  return (
    <React.Fragment>
      <h1 style={{ color: 'white' }}>Please login</h1>
      <LoginButton
        botUsername={process.env.NEXT_PUBLIC_BOT_USERNAME!}
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
    </React.Fragment>
  );
}
