'use client';

import {
  Role,
  accountsApi,
  getSelectedWalletPath,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import { Wallet } from '@mui/icons-material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { IconButton, Slide, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useAuthorization from '../Auth/use-authorization.hooks';
import { WrapFooter } from '../layout/MobileLayout';

const Tabs = styled('div')(({}) => ({
  position: 'fixed',
  zIndex: 999,
  bottom: 0,
  display: 'grid',
  justifyItems: 'center',
  width: '100%',
  maxWidth: '100%',
  background: 'rgba(255, 255, 255, 0.07)',
  padding: '8px 0',
  backdropFilter: 'blur(8px)'
}));

const TabMenu = styled('div')(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  button: {
    paddingBottom: '4px',
    color: '#696f74',
    svg: {
      fontSize: '28px'
    },
    '&:hover': {
      color: theme.palette.primary.main
    }
  },

  p: {
    color: '#696f74',
    fontSize: '12px'
  },

  '&.active button': {
    color: theme.custom.colorItem
  },
  '&.active p': {
    color: theme.custom.colorItem,
    fontWeight: 600
  }
}));

type PropsFooter = {
  hidden?: boolean;
};

export default function Footer({ hidden = true }: PropsFooter) {
  const router = useRouter();
  const pathName = usePathname();
  const { status } = useSession();
  const askAuthorization = useAuthorization();
  const { useGetAccountByAddressQuery } = accountsApi;
  const [isArbiMod, setIsArbiMod] = useState(false);
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);

  const { currentData: accountQueryData } = useGetAccountByAddressQuery(
    { address: selectedWalletPath?.xAddress },
    { skip: !selectedWalletPath }
  );

  const handleIconClick = (pathName: string) => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      router.push(pathName);
    }
  };

  useEffect(() => {
    if (!accountQueryData) return;

    //check if user is moderator or arbitrator
    if (
      accountQueryData?.getAccountByAddress.role === Role.Arbitrator ||
      accountQueryData?.getAccountByAddress.role === Role.Moderator
    ) {
      setIsArbiMod(true);
    }
  }, [accountQueryData]);

  return (
    <WrapFooter>
      <Slide direction="up" in={hidden} className="Footer-content">
        <Tabs style={{ gridTemplateColumns: isArbiMod ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)' }}>
          <TabMenu className={`${pathName === '/' && 'active'}`}>
            <IconButton onClick={() => router.push('/')}>
              <SwapHorizIcon />
            </IconButton>
            <Typography variant="body2">Home</Typography>
          </TabMenu>
          <TabMenu className={`${pathName === '/my-offer' && 'active'}`}>
            <IconButton onClick={() => handleIconClick('my-offer')}>
              <LocalOfferOutlinedIcon />
            </IconButton>
            <Typography variant="body2">Offers</Typography>
          </TabMenu>
          <TabMenu className={`${pathName === '/my-order' && 'active'}`}>
            <IconButton onClick={() => handleIconClick('my-order')}>
              <InventoryOutlinedIcon />
            </IconButton>
            <Typography variant="body2">Orders</Typography>
          </TabMenu>
          {isArbiMod && (
            <TabMenu className={`${pathName === '/my-dispute' && 'active'}`}>
              <IconButton onClick={() => handleIconClick('my-dispute')}>
                <GavelOutlinedIcon />
              </IconButton>
              <Typography variant="body2">Dispute</Typography>
            </TabMenu>
          )}
          <TabMenu className={`${pathName === '/wallet' && 'active'}`}>
            <IconButton onClick={() => handleIconClick('wallet')}>
              <Wallet />
            </IconButton>
            <Typography variant="body2">Wallet</Typography>
          </TabMenu>
        </Tabs>
      </Slide>
    </WrapFooter>
  );
}
