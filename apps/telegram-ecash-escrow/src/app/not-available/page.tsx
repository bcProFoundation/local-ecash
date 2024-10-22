'use client';
import { Backdrop, Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function NotAvailable() {
  const router = useRouter();

  return (
    <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={true}>
      <Stack alignItems="center" justifyContent="center">
        <Typography variant="h5">{`Sorry :(`}</Typography>
        <Typography variant="h5">App is not available in your country</Typography>
        <Button onClick={() => router.push('/')} variant="contained">
          Back to home
        </Button>
      </Stack>
    </Backdrop>
  );
}
