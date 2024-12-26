'use client';
import Footer from '@/src/components/Footer/Footer';
import CustomToast from '@/src/components/Toast/CustomToast';
import MobileLayout from '@/src/components/layout/MobileLayout';
import {
  getSelectedAccount,
  getSelectedWalletPath,
  getWalletMnemonic,
  removeAllWallets,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
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
import { styled } from '@mui/material/styles';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const ContainerSetting = styled('div')(({ theme }) => ({
  padding: '1rem',
  '.setting-content': {
    padding: '0 0 4rem',
    '.setting-item': {
      marginBottom: '1rem',
      '.title': {
        paddingTop: '1rem',
        paddingBottom: '0.5rem',
        fontSize: '16px',
        fontWeight: 'bold'
      },
      '.ico-alert': {
        alignSelf: 'center !important'
      }
    }
  },

  '.address-string': {
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    margin: '1rem 0',
    color: '#28a5e0',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },

  '.collapse-backup-seed': {
    margin: '0 !important',
    '.MuiAccordionSummary-content': {
      margin: '0 0 0px !important'
    }
  },

  '.MuiCollapse-wrapper': {
    '.MuiAccordionDetails-root': {
      padding: '0 16px 10px !important',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      '.mnemonic': {
        // color: '#edeff099',
        textAlign: 'center'
      }
    }
  }
}));

export default function Setting() {
  const { data: sessionData } = useSession();
  const dispatch = useLixiSliceDispatch();
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const selectedMnemonic = useLixiSliceSelector(getWalletMnemonic);
  const selectedAccount = useLixiSliceSelector(getSelectedAccount);

  const [openToastCopySuccess, setOpenToastCopySuccess] = useState(false);

  const handleOnCopy = () => {
    setOpenToastCopySuccess(true);
  };

  const handleSignOut = () => {
    dispatch(removeAllWallets());
    signOut({ redirect: true, callbackUrl: '/' });
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
            <Typography variant="subtitle1" className="title">
              Backup your account
            </Typography>
            <Alert icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />} severity="warning">
              <Typography variant="subtitle2">
                Your seed phrase is the only way to restore your account. Write it down. Keep it safe. Do not share with
                anyone!
              </Typography>
            </Alert>
            <Accordion className="collapse-backup-seed">
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography variant="body1">Click to reveal seed phrase</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CopyToClipboard
                  style={{
                    display: 'inline-block',
                    width: '100%'
                  }}
                  text={selectedMnemonic}
                  onCopy={handleOnCopy}
                >
                  <Typography variant="subtitle2" className="mnemonic">
                    {selectedMnemonic}
                  </Typography>
                </CopyToClipboard>
              </AccordionDetails>
            </Accordion>
          </div>
          <div className="setting-item">
            <Typography variant="subtitle1" className="title">
              Sign out
            </Typography>
            <Alert icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />} severity="error">
              <Typography variant="subtitle2">Sign out of the current session</Typography>
            </Alert>
            <Accordion className="collapse-backup-seed">
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography variant="body1">Click to reveal sign out button</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Button
                  variant="contained"
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    fontWeight: 'bold',
                    color: '#fff'
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
