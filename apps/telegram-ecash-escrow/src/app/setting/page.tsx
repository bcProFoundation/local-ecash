'use client';
import Footer from '@/src/components/Footer/Footer';
import Header from '@/src/components/Header/Header';
import MobileLayout from '@/src/components/layout/MobileLayout';
import CustomToast from '@/src/components/Toast/CustomToast';
import {
  getSelectedWalletPath,
  getWalletMnemonic,
  removeAllWallets,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { CheckCircleOutline } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Backdrop,
  Button,
  Stack,
  Typography
} from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const ContainerSetting = styled.div`
  padding: 1rem;
  .setting-content {
    padding: 0 0 1rem;
    .setting-item {
      margin-bottom: 1rem;
      .title {
        padding: 0 1rem;
        font-size: 16px;
        font-weight: 400;
        color: #edeff099;
      }
      .ico-alert {
        align-self: center !important;
      }
    }

    .address-string {
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      margin: 1rem 0;
      color: #28a5e0;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .collapse-backup-seed {
    margin: 0 !important;
    .MuiAccordionSummary-content {
      margin: 0 0 0px !important;
    }
  }

  .MuiCollapse-wrapper {
    .MuiAccordionDetails-root {
      padding: 0 16px 10px !important;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      .mnemonic {
        color: #edeff099;
        text-align: center;
      }
    }
  }
    
  }
`;

export default function Setting() {
  const { data: sessionData } = useSession();
  const dispatch = useLixiSliceDispatch();
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const selectedMnemonic = useLixiSliceSelector(getWalletMnemonic);
  // const mainButton = useMainButton();
  // const backButton = useBackButton();
  // const popUp = usePopup();
  // const haptic = useHapticFeedback();

  // useEffect(() => {
  //   backButton.show();
  // }, []);

  // useEffect(() => {
  //   backButton.on('click', onBackButtonClick);
  // }, [backButton]);

  const [openToastCopySuccess, setOpenToastCopySuccess] = useState(false);

  const handleOnCopy = () => {
    setOpenToastCopySuccess(true);
  };

  const onBackButtonClick = () => {
    // router.back();
    //   backButton.hide();
    //   mainButton.hide();
  };

  const handleSignOut = () => {
    dispatch(removeAllWallets());
    signOut({ redirect: true, callbackUrl: '/' });
  };

  const handleDeleteAccount = () => {
    // haptic.notificationOccurred('warning');
    // popUp
    //   .open({
    //     title: 'DELETE ACCOUNT',
    //     message: 'Please backup your seed before delete account to avoid lost your account!',
    //     buttons: [
    //       { id: 'delete-cancel', type: 'cancel' },
    //       { id: 'delete-ok', type: 'ok' }
    //     ]
    //   })
    //   .then((rs) => {
    //     if (rs === 'delete-ok') {
    //       localStorage.removeItem('accounts');
    //     }
    //     console.log(rs);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  const handleVerifyAddress = () => {
    // haptic.notificationOccurred('warning');
    // popUp
    //   .open({
    //     title: 'VERIFY ADDRESS',
    //     message: 'Your address: eCash:qp8ks7622cklc7c9pm2d3ktwzctack6njq6q83ed9x',
    //     buttons: [
    //       { id: 'delete-cancel', type: 'cancel' },
    //       { id: 'delete-ok', type: 'ok' }
    //     ]
    //   })
    //   .then((rs) => {
    //     // if (rs === 'delete-ok') {
    //     // }
    //     console.log(rs);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  if (selectedWalletPath === null && sessionData) {
    return (
      <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={true}>
        <Stack>
          <Typography variant="h5" align="center">
            No wallet detected
          </Typography>
          <Typography variant="body1" align="center">
            Please sign out and try again!
          </Typography>
          <Button
            variant="contained"
            style={{ marginTop: '15px' }}
            onClick={() => {
              dispatch(removeAllWallets());
              signOut({ redirect: true, callbackUrl: '/' });
            }}
          >
            Sign Out
          </Button>
        </Stack>
      </Backdrop>
    );
  }

  return (
    <MobileLayout>
      <ContainerSetting>
        <Header />
        <div className="setting-info">
          <Typography variant="h4" className="title">
            Setting
          </Typography>
        </div>
        {/*TODO: Verify account*/}
        <div className="setting-content">
          {/* <div className="setting-item">
          <p className="title">Verify address</p>
          <Alert icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />} severity="warning">
            Please verify every 1 month to keep your address always updated on Telegram.
          </Alert>
          <Accordion className="collapse-backup-seed">
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <p>Click to verify your address</p>
            </AccordionSummary>
            <AccordionDetails>
              <p className="address-string">eCash:qp8ks7622cklc7c9pm2d3ktwzctack6njq6q83ed9x</p>
              {/* <Button variant='linear' onClickItem={handleVerifyAddress}>Verify</LixiButton>	 
              <Button>Verify</Button>
            </AccordionDetails>
          </Accordion>
        </div> */}

          <div className="setting-item">
            <p className="title">Backup your account</p>
            <Alert icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />} severity="warning">
              Your seed phrase is the only way to restore your account. Write it down. Keep it safe. Do not share with
              anyone!
            </Alert>
            <Accordion className="collapse-backup-seed">
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <p>Click to reveal seed phrase</p>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" className="mnemonic">
                  {selectedMnemonic}
                </Typography>
                <CopyToClipboard
                  style={{
                    display: 'inline-block',
                    width: '100%'
                  }}
                  text={selectedMnemonic}
                  onCopy={handleOnCopy}
                >
                  <Button className="btn-backup" variant="outlined">
                    Backup
                  </Button>
                </CopyToClipboard>
              </AccordionDetails>
            </Accordion>
          </div>
          <hr />
          <div className="setting-item">
            <Alert icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />} severity="error">
              Sign out of the current session
            </Alert>
            <Accordion className="collapse-backup-seed">
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <p>Click to reveal sign out button</p>
              </AccordionSummary>
              <AccordionDetails>
                <Button
                  variant="outlined"
                  style={{
                    display: 'inline-block',
                    width: '100%'
                  }}
                  onClick={() => handleSignOut()}
                >
                  Sign Out
                </Button>
              </AccordionDetails>
            </Accordion>
          </div>

          {/*TODO: delete account*/}
          {/* <div className="setting-item">
          <p className="title">Delete account</p>
          <Alert icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />} severity="error">
            Delete your account in platform. You can import it later by seed phrase have been stored.
          </Alert>
          <Accordion className="collapse-backup-seed">
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <p>Click to delete account</p>
            </AccordionSummary>
            <AccordionDetails>
              <Button onClick={handleDeleteAccount}>Delete</Button>
            </AccordionDetails>
          </Accordion>
        </div> */}

          {/*TODO: import account*/}
          {/* <div className="setting-item">
          <p className="title">Import account</p>
          <Alert icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />} severity="info">
            Enter your recovery phrase (12 words) in the correct order. Separate each word with a single space only (no
            commas or any other punctuation).
          </Alert>
          <Accordion className="collapse-backup-seed">
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <p>Click to import account</p>
            </AccordionSummary>
            <AccordionDetails>
              <Link href="/import">
                <Button>Import account</Button>
              </Link>
            </AccordionDetails>
          </Accordion>
        </div> */}
        </div>
        <CustomToast
          isOpen={openToastCopySuccess}
          handleClose={() => setOpenToastCopySuccess(false)}
          content="Copy to clipboard"
          type="info"
        />
      </ContainerSetting>
      <Footer />
    </MobileLayout>
  );
}
