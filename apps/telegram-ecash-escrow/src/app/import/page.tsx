'use client';
import {
  axiosClient,
  generateAccount,
  importAccount,
  useSliceDispatch as useLixiSliceDispatch,
  WalletContextNode
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const ContainerImportWallet = styled.div`
  padding: 1rem;
  .receive-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    img {
      align-self: center;
      filter: drop-shadow(2px 4px 6px black);
    }
    .header-receive {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      .title {
        margin-top: 1rem;
      }
      .subtitle {
        span {
          font-size: 12px;
          color: #d5d5d5;
        }
      }
    }
  }
  .coin-address {
    .address-string {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      background: #5476eb42;
      color: #5476eb;
      width: fit-content;
      margin: auto;
      border-radius: 1rem;
      gap: 4px;
      svg {
        font-size: 14px;
      }
      span {
        font-size: 12px;
      }
    }
  }
  .receive-form {
    padding: 1rem 0;
  }
`;

export default function ImportWallet() {
  const search = useSearchParams();
  const dispatch = useLixiSliceDispatch();
  const router = useRouter();
  const id = search!.get('id');
  const {
    handleSubmit,
    formState: { errors },
    control
  } = useForm();
  const { status, data } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const { getXecWalletPublicKey } = useContext(WalletContextNode);
  // const mainButton = useMainButton();
  // const backButton = useBackButton();
  // const popUp = usePopup();
  // const scanner = useQRScanner();
  // const haptic = useHapticFeedback();

  // useEffect(() => {
  //   mainButton.enable().show();
  //   mainButton.setText('Import');
  //   backButton.show();
  // }, []);

  // useEffect(() => {
  //   mainButton.on('click', onMainButtonClick);
  //   backButton.on('click', onBackButtonClick);
  // }, [mainButton, backButton]);

  // const onMainButtonClick = () => {
  // importWallet();
  // };

  // const onBackButtonClick = () => {
  // backButton.hide();
  // mainButton.hide();
  // mainButton.off('click', onMainButtonClick);
  // backButton.off('click', onBackButtonClick);
  // navigate({ to: '/wallet' });
  // };

  const scanQRCode = () => {
    // haptic.notificationOccurred('warning');
    // scanner.open('Scan the seed phrase').then((content) => {
    //   setSeedPhrase(content || '');
    //   scanner.close();
    // });
  };

  const importWallet = async (data: { recoveryPhrase: string }) => {
    const { recoveryPhrase } = data;
    setLoading(true);
    try {
      const publicKey = await getXecWalletPublicKey(recoveryPhrase);

      await axiosClient.get(`/api/accounts/telegram`, {
        params: {
          telegramId: id,
          publicKey: publicKey
        }
      });

      dispatch(importAccount(recoveryPhrase));

      setSuccess(true);
    } catch (e) {
      setError(true);
    }

    setLoading(false);
  };

  const handleCreateNewWallet = async () => {
    setLoading(true);
    try {
      await axiosClient.get(`/api/accounts/telegram/unlink/${id}`);

      dispatch(generateAccount({ coin: 'XEC', telegramId: id!.toString() }));

      setSuccess(true);
    } catch (e) {
      setError(true);
    }

    setLoading(false);
  };

  const handleClose = () => {
    setSuccess(false);
  };

  if (status === 'unauthenticated') {
    return (
      <div>
        <h1 style={{ color: 'white' }}>Please sign in to continue</h1>
        <Button onClick={() => router.push('/login')}>Login</Button>
      </div>
    );
  }

  if (status === 'authenticated' && data.user.id !== id) {
    return (
      <div>
        <h1 style={{ color: 'white' }}>You are not authorized to access this page</h1>
      </div>
    );
  }

  return (
    <ContainerImportWallet>
      <div className="receive-info">
        <picture>
          <img width={96} height={96} src="/import.svg" alt="" />
        </picture>
        <div className="header-receive">
          <h2 className="title" style={{ color: 'white' }}>
            Import
          </h2>
          <Tooltip title={'Test'}>
            <IconButton>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className="receive-form">
        <p className="title" style={{ color: 'white' }}>
          We detected telegram account already exists. Please import your mnemonic seed phrase to continue.
        </p>
        <FormControl fullWidth={true}>
          <Controller
            name="recoveryPhrase"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                disabled={loading || success}
                id="recoveryPhrase"
                label="Recovery phrase"
                placeholder="Enter your recovery phrase (12 words) in the correct order. Separate each word with a single space only (no commas or any other punctuation)."
                color="primary"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <div onClick={scanQRCode}>
                        <QrCodeScannerOutlinedIcon />
                      </div>
                    </InputAdornment>
                  )
                }}
                required
                multiline
                rows={5}
                error={errors.recoveryPhrase && true}
                helperText={errors.recoveryPhrase && 'Valid mnemonic seed phrase required'}
              />
            )}
          />
        </FormControl>
        <Button onClick={handleSubmit(importWallet)} disabled={loading || success}>
          Import
        </Button>
      </div>
      <div className="receive-form">
        <p className="title" style={{ color: 'white' }}>
          I forgot my wallet recovery phrase. Create me a new one.
        </p>
        <Button onClick={() => handleCreateNewWallet()} disabled={loading || success}>
          Create new wallet
        </Button>
      </div>
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loading} onClick={handleClose}>
        <CircularProgress color={'inherit'} />
      </Backdrop>
      <Stack>
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() =>
            setTimeout(() => {
              router.push('/');
            })
          }
        >
          <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%' }}>
            Import wallet success - Redirecting to home...
          </Alert>
        </Snackbar>

        <Snackbar open={error} autoHideDuration={4000} onClose={() => setError(false)}>
          <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: '100%' }}>
            Import wallet failed — Please check your mnemonic seed phrase
          </Alert>
        </Snackbar>
      </Stack>
    </ContainerImportWallet>
  );
}
