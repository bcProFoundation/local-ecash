'use client';
import styled from '@emotion/styled';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import {
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
// import { useBackButton, useHapticFeedback, useMainButton, usePopup, useQRScanner } from '@tma.js/sdk-react';
import React, { useState } from 'react';

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
  // const { navigate } = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [seedPhrase, setSeedPhrase] = useState<string>('');
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

  const onMainButtonClick = () => {
    importWallet();
  };

  const onBackButtonClick = () => {
    // backButton.hide();
    // mainButton.hide();
    // mainButton.off('click', onMainButtonClick);
    // backButton.off('click', onBackButtonClick);
    // navigate({ to: '/wallet' });
  };

  const scanQRCode = () => {
    // haptic.notificationOccurred('warning');
    // scanner.open('Scan the seed phrase').then((content) => {
    //   setSeedPhrase(content || '');
    //   scanner.close();
    // });
  };

  const handleSeedPhrase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSeedPhrase(value);
  };

  const importWallet = () => {
    const result = true;
    // result =
    //   seedPhrase ===
    //   "firm panther globe worry affair solve monitor reason carpet yellow return labor"
    //     ? true
    //     : false;
    // Call API to import seed phrase
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    if (result) {
      // setError(false);
      // setSuccess(true);
      // localStorage.setItem('accounts', 'true');
      // setTimeout(() => {
      //   navigate({ to: '/wallet' });
      //   mainButton.hide();
      // }, 1000);
    } else {
      setError(true);
      setSuccess(false);
    }
  };

  const handleClose = () => {
    setLoading(false);
  };

  return (
    <ContainerImportWallet>
      <div className="receive-info">
        <picture>
          <img width={96} height={96} src="/import.svg" alt="" />
        </picture>
        <div className="header-receive">
          <h2 className="title">Import</h2>
          <Tooltip title={'Test'}>
            <IconButton>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className="receive-form">
        <FormControl fullWidth={true}>
          <TextField
            id="recovery-phrase"
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
            value={seedPhrase}
            onChange={handleSeedPhrase}
            required
            multiline
            rows={5}
            error={error}
            helperText={error && 'Valid mnemonic seed phrase required'}
          />
        </FormControl>
      </div>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading} onClick={handleClose}>
        <CircularProgress color={'inherit'} />
        {/* <Alert
          icon={<CheckCircleOutline fontSize="inherit" />}
          severity="success"
        >
          Import wallet success — Check it out!
        </Alert> */}
      </Backdrop>
      <Stack>
        <Snackbar
          open={success}
          autoHideDuration={2000}
          onClose={handleClose}
          message="Import wallet success — Check it out!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Stack>
      <Button>Import</Button>
    </ContainerImportWallet>
  );
}
