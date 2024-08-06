'use client';

import styled from '@emotion/styled';
import { HomeOutlined, SettingsOutlined } from '@mui/icons-material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { IconButton, Typography } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

const Tabs = styled.div`
  position: fixed;
  z-index: 999;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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

export default function Footer() {
  const router = useRouter();
  const pathName = usePathname();

  console.log('AAA', pathName);

  return (
    <Tabs>
      <TabMenu className={`${pathName === '/home' && 'active'}`}>
        <IconButton onClick={() => router.push('/home')}>
          <HomeOutlined />
        </IconButton>
        <Typography variant="body2">Home</Typography>
      </TabMenu>
      <TabMenu className={`${pathName === '/my-offer' && 'active'}`}>
        <IconButton onClick={() => router.push('/my-offer')}>
          <LocalOfferOutlinedIcon />
        </IconButton>
        <Typography variant="body2">Offers</Typography>
      </TabMenu>
      <TabMenu className={`${pathName === '/my-order' && 'active'}`}>
        <IconButton onClick={() => router.push('/my-order')}>
          <InventoryOutlinedIcon />
        </IconButton>
        <Typography variant="body2">Orders</Typography>
      </TabMenu>
      <TabMenu className={`${pathName === '/my-dispute' && 'active'}`}>
        <IconButton onClick={() => router.push('/my-dispute')}>
          <GavelOutlinedIcon />
        </IconButton>
        <Typography variant="body2">Dispute</Typography>
      </TabMenu>
      <TabMenu className={`${pathName === '/setting' && 'active'}`}>
        <IconButton onClick={() => router.push('/setting')}>
          <SettingsOutlined />
        </IconButton>
        <Typography variant="body2">Setting</Typography>
      </TabMenu>
    </Tabs>
  );
}
