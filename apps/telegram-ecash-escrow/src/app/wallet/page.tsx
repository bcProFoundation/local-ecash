'use client';

import { BackupModalProps } from '@/src/components/Common/BackupModal';
import Header from '@/src/components/Header/Header';
import QRCode from '@/src/components/QRcode/QRcode';
import SendComponent from '@/src/components/Send/send';
import { TabPanel } from '@/src/components/Tab/Tab';
import AuthorizationLayout from '@/src/components/layout/AuthorizationLayout';
import MobileLayout from '@/src/components/layout/MobileLayout';
import { TabType } from '@/src/store/constants';
import { SettingContext } from '@/src/store/context/settingProvider';
import { UtxoContext } from '@/src/store/context/utxoProvider';
import { formatNumber } from '@/src/store/util';
import { COIN } from '@bcpros/lixi-models';
import {
  getSeedBackupTime,
  getSelectedWalletPath,
  openModal,
  parseCashAddressToPrefix,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import { Backdrop, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { signOut, useSession } from 'next-auth/react';
import { useContext, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';

const WrapWallet = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundRepeat: 'no-repeat',
  padding: '1rem',
  paddingBottom: '85px',
  minHeight: '100svh',

  '.MuiTab-root': {
    color: theme.custom.colorItem,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '16px',
    '&.Mui-selected': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(8px)'
    }
  },

  '.MuiTabs-indicator': {
    backgroundColor: '#0076c4'
  }
}));

const WrapContentWallet = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  '.balance-amount': {
    h5: {
      fontWeight: 'bold'
    },
    '.amount': {
      margin: '16px 0',
      backgroundColor: theme.custom.bgItem3,
      padding: '28px 16px',
      borderRadius: '16px',
      display: 'flex',
      justifyContent: 'center',
      '.coin-ticker': {
        fontSize: '13px'
      }
    }
  }
}));

const ReceiveWrap = styled('div')(({ theme }) => ({
  display: 'flex',
  textAlign: 'center',
  marginTop: '10px'
}));

const SendWrap = styled('div')(({ theme }) => ({
  backgroundColor: theme.custom.bgItem4,
  borderRadius: '20px',
  padding: '15px',
  marginTop: '10px'
}));

export default function Wallet() {
  const { data: sessionData } = useSession();
  const dispatch = useLixiSliceDispatch();

  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const lastSeedBackupTimeOnDevice = useLixiSliceSelector(getSeedBackupTime);
  const settingContext = useContext(SettingContext);
  const seedBackupTime = settingContext?.setting?.lastSeedBackupTime ?? lastSeedBackupTimeOnDevice ?? '';

  const [address, setAddress] = useState(parseCashAddressToPrefix(COIN.XEC, selectedWalletPath?.cashAddress));

  const { totalValidAmount, totalValidUtxos } = useContext(UtxoContext);

  const [value, setValue] = useState(1);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0 && !isBackup()) {
      return;
    }
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    if (index === 0 && !isBackup()) {
      return;
    }
    setValue(index);
  };

  const isBackup = () => {
    //check backup
    const oneMonthLater = new Date(seedBackupTime);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const currentDate = new Date();
    const isGreaterThanOneMonth = currentDate > oneMonthLater;

    const backupModalProps: BackupModalProps = {
      isFromSetting: true,
      isFromHome: false
    };

    if (!seedBackupTime || isGreaterThanOneMonth) {
      dispatch(openModal('BackupModal', backupModalProps));

      return false;
    }
    return true;
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
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
          >
            Sign Out
          </Button>
        </Stack>
      </Backdrop>
    );
  }

  return (
    <MobileLayout>
      <AuthorizationLayout>
        <WrapWallet>
          <Header />

          <WrapContentWallet>
            <div className="balance-amount">
              <Typography variant="h5">Balance</Typography>
              <div className="amount">
                <Typography variant="h5">
                  {formatNumber(totalValidAmount ?? 0)} <span className="coin-ticker">XEC</span>
                </Typography>
              </div>
            </div>
            <div>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
              >
                <Tab
                  label={TabType.SEND}
                  id={`full-width-tab-${TabType.SEND}`}
                  aria-controls={`full-width-tabpanel-${TabType.SEND}`}
                />
                <Tab
                  label={TabType.RECEIVE}
                  id={`full-width-tab-${TabType.RECEIVE}`}
                  aria-controls={`full-width-tabpanel-${TabType.RECEIVE}`}
                />
              </Tabs>
              <SwipeableViews index={value} onChangeIndex={handleChangeIndex}>
                <TabPanel value={value} index={0}>
                  <SendWrap>
                    <SendComponent totalValidAmount={totalValidAmount} totalValidUtxos={totalValidUtxos} />
                  </SendWrap>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <ReceiveWrap>
                    <QRCode address={address} />
                  </ReceiveWrap>
                </TabPanel>
              </SwipeableViews>
            </div>
          </WrapContentWallet>
        </WrapWallet>
      </AuthorizationLayout>
    </MobileLayout>
  );
}
