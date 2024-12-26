'use client';

import {
  Role,
  accountsApi,
  escrowOrderApi,
  getSelectedWalletPath,
  offerApi,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector,
  useSocket
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Wallet } from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/Circle';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { IconButton, Slide, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import useAuthorization from '../Auth/use-authorization.hooks';

const Tabs = styled.div`
  position: fixed;
  z-index: 999;
  bottom: 0;
  display: grid;
  justify-items: center;
  width: 100%;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.07);
  padding: 8px 0;
  backdrop-filter: blur(8px);
`;

const TabMenu = styled.div`
  width: 100%;
  text-align: center;

  button {
    padding-bottom: 4px;
    color: #696f74;
    svg {
      font-size: 28px;
    }
  }

  p {
    color: #696f74;
    font-size: 12px;
  }

  &.active {
    button {
      color: white;
    }

    p {
      color: white;
      font-weight: 600;
    }
  }
`;

const PopoverStyled = styled.div`
  .content-action {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .item-action {
      display: flex;
      gap: 5px;
      padding: 3px 0;
      button {
        padding: 0;
      }
      button,
      p {
        color: #c7cdd3;
      }
    }
  }
`;

const StyledSlide = styled(Slide)`
  padding-bottom: 16px;
  width: 500px;
  left: 50%;
  // Slide transform is broken in PC so this is the bypass. Need to better way to handle this
  ${props => props.in && 'transform: translateX(-50%) !important'};
  ${props => !props.in && 'transform: translateY(1000px) !important'};
  @media (max-width: 576px) {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
    width: 100%;
    box-shadow: none;
  }
`;

export default function Footer() {
  const prevRef = useRef(0);
  const router = useRouter();
  const { socket } = useSocket();
  const pathName = usePathname();
  const { status } = useSession();
  const dispatch = useLixiSliceDispatch();
  const askAuthorization = useAuthorization();

  const [visible, setVisible] = useState(true);
  const [isArbiMod, setIsArbiMod] = useState(false);
  const [newOrder, setNewOrder] = useState(false);
  const [prevRoute, setPrevRoute] = useState(pathName);
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const { useGetAccountByAddressQuery } = accountsApi;

  const { currentData: accountQueryData } = useGetAccountByAddressQuery(
    { address: selectedWalletPath?.xAddress },
    { skip: !selectedWalletPath }
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        const currentScrollPos = window.scrollY;
        setVisible(prevRef.current > currentScrollPos || currentScrollPos < 20);
        prevRef.current = currentScrollPos;
      };
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const handleIconClick = (path: string) => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();

      return;
    }

    if (path === '/' && prevRoute === '/') {
      console.log('reset home api query');
      dispatch(offerApi.api.util.resetApiState());

      return;
    }

    if (path === '/my-order' && prevRoute === '/my-order') {
      console.log('reset escrow api query');
      dispatch(escrowOrderApi.api.util.resetApiState());
      setNewOrder(false);

      return;
    }

    router.push(path);
    setPrevRoute(path);
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

  useEffect(() => {
    socket &&
      socket.on('recievedEscrowOrder', () => {
        setNewOrder(true);
      });
  }, [socket]);

  //No footer at offer detail and order-detail
  return (
    pathName !== '/order-detail' &&
    pathName !== '/offer-detail' && (
      <StyledSlide direction="up" in={visible} className="Footer-content">
        <Tabs style={{ gridTemplateColumns: isArbiMod ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)' }}>
          <TabMenu className={`${pathName === '/' && 'active'}`}>
            <IconButton onClick={() => handleIconClick('/')}>
              <SwapHorizIcon />
            </IconButton>
            <Typography variant="body2">Home</Typography>
          </TabMenu>
          <TabMenu className={`${pathName === '/my-offer' && 'active'}`}>
            <IconButton onClick={() => handleIconClick('/my-offer')}>
              <LocalOfferOutlinedIcon />
            </IconButton>
            <Typography variant="body2">Offers</Typography>
          </TabMenu>
          <TabMenu className={`${pathName === '/my-order' && 'active'}`}>
            <IconButton onClick={() => handleIconClick('/my-order')}>
              <InventoryOutlinedIcon />
              {newOrder && (
                <CircleIcon
                  style={{ color: '#0076c4', position: 'absolute', right: '0px', top: '0px', fontSize: '15px' }}
                />
              )}
            </IconButton>
            <Typography variant="body2">Orders</Typography>
          </TabMenu>
          {isArbiMod && (
            <TabMenu className={`${pathName === '/my-dispute' && 'active'}`}>
              <IconButton onClick={() => handleIconClick('/my-dispute')}>
                <GavelOutlinedIcon />
              </IconButton>
              <Typography variant="body2">Dispute</Typography>
            </TabMenu>
          )}
          <TabMenu className={`${pathName === '/wallet' && 'active'}`}>
            <IconButton onClick={() => handleIconClick('/wallet')}>
              <Wallet />
            </IconButton>
            <Typography variant="body2">Wallet</Typography>
          </TabMenu>
        </Tabs>
      </StyledSlide>
    )
  );
}
