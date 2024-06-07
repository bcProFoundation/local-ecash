import React, { useEffect, useState } from 'react';
import { useBackButton, usePopup, useMainButton, useQRScanner, useHapticFeedback } from '@tma.js/sdk-react';
import { useRouter, useSearch } from '@tanstack/react-router';
import styled from '@emotion/styled';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Snackbar,
  Stack
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import PersonIcon from '@mui/icons-material/Person';
import { CheckCircleOutline } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ContainerSend = styled.div`
  padding: 1rem;
  .send-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    img {
      align-self: center;
      filter: drop-shadow(2px 4px 6px black);
    }
    .header-send {
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
  .send-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 2rem 0;
    .prefix-coin {
      color: #01abe8;
      font-size: 14px;
      font-weight: 600;
    }
  }
  .send-group-action {
    button {
      width: 100%;
    }
  }
`;

export const component = function Send() {
  const { navigate } = useRouter();
  const params = useSearch({
    strict: false
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [addressNotVerify, setAddressNotVerify] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [handleName, setHandleName] = useState<string>('');
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    handleParamsConfirm();
  }, [params]);

  const handleParamsConfirm = () => {
    const handleNameParams = params['handleName'];
    const addressParams = params['address'];
    const amountParams = params['amount'];
    if (handleNameParams && addressParams && amountParams) {
      setIsConfirm(true);
      setHandleName(handleNameParams);
      setAddress(addressParams);
      setAmount(parseInt(amountParams));
    } else {
      setIsConfirm(false);
    }
  };
  const mainButton = useMainButton();
  const backButton = useBackButton();
  const popUp = usePopup();
  const scanner = useQRScanner();
  const haptic = useHapticFeedback();

  useEffect(() => {
    mainButton.enable().show();
    backButton.show();
    mainButton.setText('Send');
  }, []);

  useEffect(() => {
    mainButton.on('click', onMainButtonClick);
    backButton.on('click', onBackButtonClick);
  }, [mainButton, backButton]);

  const onMainButtonClick = () => {
    haptic.notificationOccurred('warning');
    popUp
      .open({
        title: 'Confirm',
        message: 'Please double check input before send.',
        buttons: [
          { id: 'send-cancel', type: 'cancel' },
          { id: 'send-ok', type: 'ok' }
        ]
      })
      .then(rs => {
        console.log(rs);
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setSuccess(true);
        }, 2000);
      })
      .catch(err => {
        console.log(err);
      });
    console.log('Main button clicked!');
  };

  const onBackButtonClick = () => {
    backButton.hide();
    mainButton.hide();
    mainButton.off('click', onMainButtonClick);
    backButton.off('click', onBackButtonClick);
    navigate({to: '/wallet'});
  };

  const ScanQRCode = () => {
    haptic.notificationOccurred('warning');
    scanner.open('Scan the barcode').then(content => {
      console.log(content);
      setAddress(content || 'null');
      scanner.close();
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
  };

  const handleAdress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAddress(value);
  };

  const handleAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAmount(parseInt(value));
  };

  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setHandleName(value);
    if (value == '@ericson') {
      setAddress('ecash:qp8ks7622cklc7c9pm2d3ktwzctack6njq6q83ed9x');
    }
    if (value == '@nghiacc') {
      setAddress('ecash:qzmxql6wqqdlspcasdzelxy3c4tvnv7c6q7j82u8wn');
      setAddressNotVerify(true);
    }
  };

  const handleOnCopy = () => {
    setSuccess(true);
  };

  return (
    <>
      <ContainerSend>
        <div className="send-info">
          <img width={96} height={96} src="/send.svg" alt="" />
          <div className="header-send">
            <h2 className="title">Send</h2>
            <div>
              <InfoOutlinedIcon />
            </div>
          </div>
          <p className="subtitle">
            <span>Available:</span> 14,624 XEC
          </p>
        </div>
        <form className="send-form">
          <FormControl fullWidth={true}>
            <TextField
              id="username"
              label="Username (option)"
              placeholder="Input username"
              value={handleName}
              onChange={handleInputName}
              color="info"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <div>
                      <CopyToClipboard text={'12345667'} onCopy={handleOnCopy}>
                        <PersonIcon />
                      </CopyToClipboard>
                    </div>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
          <FormControl fullWidth={true}>
            <TextField
              id="address"
              label="Wallet address"
              placeholder="Paste address here"
              value={address}
              color={addressNotVerify ? 'warning' : 'info'}
              onChange={handleAdress}
              variant="outlined"
              error={error}
              helperText={
                (error && 'Incorrect address.') ||
                (addressNotVerify && (
                  <p style={{ color: '#ffa726' }}>The address has not been activated for a long time.</p>
                ))
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <div onClick={ScanQRCode}>
                      <QrCodeScannerOutlinedIcon />
                    </div>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
          <FormControl fullWidth={true}>
            <TextField
              id="amount"
              type="number"
              label="Amount"
              placeholder="0"
              value={amount}
              color="info"
              onChange={handleAmount}
              variant="outlined"
              error={typeof amount != 'number'}
              helperText={error && 'Invalid amount.'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <p className="prefix-coin">XEC</p>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        </form>
      </ContainerSend>
      {/* <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Use Google's location service?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Let Google help apps determine location. This means sending
            anonymous location data to Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleClose}>Agree</Button>
        </DialogActions>
      </Dialog> */}
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loading} onClick={handleClose}>
        <CircularProgress color={'inherit'} />
      </Backdrop>
      <Stack>
        <Snackbar
          open={success}
          onClose={handleClose}
          autoHideDuration={10000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            style={{ width: '100%' }}
            icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />}
            severity="success"
          >
            Transaction has been sent.
          </Alert>
        </Snackbar>
      </Stack>
    </>
  );
}
