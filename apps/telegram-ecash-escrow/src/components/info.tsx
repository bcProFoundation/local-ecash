'use client';
import { User } from '@/pages/api/auth/[...nextauth]';
import { Box, Button, Card, CardActions, CardContent, Skeleton, Stack } from '@mui/material';
import { LoginButton } from '@telegram-auth/react';
import { signIn, signOut, useSession } from 'next-auth/react';

function LoadingPlaceholder() {
  return (
    <Box padding="6">
      <Skeleton variant="rectangular" />
    </Box>
  );
}

export function Info({ botUsername }: { botUsername: string }) {
  const { data: session, status } = useSession();
  console.log('🚀 ~ Info ~ session.id:', session);

  if (status === 'loading') {
    return <LoadingPlaceholder />;
  }

  const user = session?.user as User;

  if (status === 'authenticated') {
    return (
      <Card>
        {user?.image ? (
          <picture>
            <img src={user?.image} alt="" />
          </picture>
        ) : null}
        <Stack>
          <div>You are signed in as {user.name}</div>

          <Button
            onClick={() => {
              signOut();
            }}
          >
            {'Sign out'}
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h1>Hello</h1>
        You are not signed in
      </CardContent>
      <CardActions>
        <LoginButton
          botUsername={botUsername}
          showAvatar={true}
          onAuthCallback={(data) => {
            console.log('🚀 ~ Info ~ data:', data);
            signIn('telegram-login', { redirect: false }, data as any);
          }}
        />
      </CardActions>
    </Card>
  );
}
