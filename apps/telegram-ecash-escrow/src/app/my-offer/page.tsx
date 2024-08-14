'use client';
import Footer from '@/src/components/Footer/Footer';
import OfferDetailInfo from '@/src/components/OfferDetailInfo/OfferDetailInfo';
import TickerHeader from '@/src/components/TickerHeader/TickerHeader';
import { TabType } from '@/src/store/constants';
import { getSelectedAccount, offerApi, Post, useSliceSelector as useLixiSliceSelector } from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Add } from '@mui/icons-material';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import Fab from '../../components/Fab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const MyOfferPage = styled.div`
  min-height: 100vh;
  background-image: url('/bg-dialog.svg');
  background-repeat: no-repeat;
  background-size: cover;
  padding-bottom: 56px;

  .MuiTab-root {
    color: white;
    text-transform: none;
    font-weight: 600;
    font-size: 16px;

    &.Mui-selected {
      background-color: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
    }
  }

  .MuiTabs-indicator {
    background-color: #0076c4;
  }

  .MuiBox-root {
    padding: 16px;
  }

  .MuiFab-root {
    bottom: 10%;
  }

  .list-item {
    div:not(.payment-group-btns) {
      border-bottom: 2px dashed rgba(255, 255, 255, 0.3);
      padding-bottom: 16px;
      margin-bottom: 16px;

      &:last-of-type {
        border-bottom: 0;
      }
    }
  }
`;

export default function MyOffer() {
  const [value, setValue] = useState(0);
  const { useAllOfferByPublicKeyQuery } = offerApi;
  const selectedAccount = useLixiSliceSelector(getSelectedAccount);
  const { data } = useAllOfferByPublicKeyQuery({
    publicKey: selectedAccount.publicKey!
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <React.Fragment>
      <MyOfferPage>
        <TickerHeader hideIcon={true} title="My offers" />

        <Tabs value={value} onChange={handleChange} indicatorColor="secondary" textColor="inherit" variant="fullWidth">
          <Tab
            label={TabType.ACTIVE}
            id={`full-width-tab-${TabType.ACTIVE}`}
            aria-controls={`full-width-tabpanel-${TabType.ACTIVE}`}
          />
          <Tab
            label={TabType.ARCHIVED}
            id={`full-width-tab-${TabType.ARCHIVED}`}
            aria-controls={`full-width-tabpanel-${TabType.ARCHIVED}`}
          />
        </Tabs>
        <SwipeableViews index={value} onChangeIndex={handleChangeIndex}>
          <TabPanel value={value} index={0}>
            <div className="list-item">
              {data?.allOfferByPublicKey.edges.map(edge => (
                <OfferDetailInfo key={edge.node.id} post={edge.node.data as Post} />
              ))}
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <div className="list-item">
              {/* <OrderDetailInfo />
              <OrderDetailInfo /> */}
            </div>
          </TabPanel>
        </SwipeableViews>

        <Fab route="/my-offer/new" icon={<Add />} />
      </MyOfferPage>

      <Footer />
    </React.Fragment>
  );
}
