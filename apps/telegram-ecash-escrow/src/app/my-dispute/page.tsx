'use client';
import DisputeDetailInfo from '@/src/components/DisputeDetailInfo/DisputeDetailInfo';
import { TabPanel } from '@/src/components/Tab/Tab';
import TickerHeader from '@/src/components/TickerHeader/TickerHeader';
import AuthorizationLayout from '@/src/components/layout/AuthorizationLayout';
import MobileLayout from '@/src/components/layout/MobileLayout';
import { TabType } from '@/src/store/constants';
import { DisputeStatus, useInfiniteMyDisputeQuery } from '@bcpros/redux-store';
import { Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import SwipeableViews from 'react-swipeable-views';

const MyDisputePage = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.background.default,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  paddingBottom: '85px',

  '.MuiTab-root': {
    color: theme.palette.common.white,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '16px',

    '&.Mui-selected': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(8px)'
    }
  },

  '.MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main || '#0076c4'
  },

  '.MuiBox-root': {
    padding: '16px'
  },

  '.MuiFab-root': {
    bottom: '10%'
  },

  '.list-item': {
    'div:not(.payment-group-btns)': {
      borderBottom: '2px dashed rgba(255, 255, 255, 0.3)',
      paddingBottom: '16px',
      marginBottom: '16px',

      '&:last-of-type': {
        borderBottom: 0
      }
    }
  }
}));

export default function MyDispute() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  const {
    data: dataDisputeActive,
    hasNext: hasNextDisputeActive,
    isFetching: isFetchingDisputeActive,
    fetchNext: fetchNextDisputeActive
  } = useInfiniteMyDisputeQuery({
    first: 20,
    disputeStatus: DisputeStatus.Active
  });
  const {
    data: dataDisputeResolved,
    hasNext: hasNextDisputeResolved,
    isFetching: isFetchingDisputeResolved,
    fetchNext: fetchNextDisputeResolved
  } = useInfiniteMyDisputeQuery({
    first: 20,
    disputeStatus: DisputeStatus.Resolved
  });

  const loadMoreItemsDisputeActive = () => {
    if (hasNextDisputeActive && !isFetchingDisputeActive) {
      fetchNextDisputeActive();
    } else if (hasNextDisputeActive) {
      fetchNextDisputeActive();
    }
  };
  const loadMoreItemsDisputeResolved = () => {
    if (hasNextDisputeResolved && !isFetchingDisputeResolved) {
      fetchNextDisputeResolved();
    } else if (hasNextDisputeResolved) {
      fetchNextDisputeResolved();
    }
  };

  return (
    <MobileLayout>
      <AuthorizationLayout>
        <MyDisputePage>
          <TickerHeader hideIcon={true} title="My disputes" />

          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
          >
            <Tab
              label={TabType.ACTIVE}
              id={`full-width-tab-${TabType.ACTIVE}`}
              aria-controls={`full-width-tabpanel-${TabType.ACTIVE}`}
            />
            <Tab
              label={TabType.RESOLVED}
              id={`full-width-tab-${TabType.RESOLVED}`}
              aria-controls={`full-width-tabpanel-${TabType.RESOLVED}`}
            />
          </Tabs>
          <SwipeableViews index={value} onChangeIndex={handleChangeIndex}>
            <TabPanel value={value} index={0}>
              <div className="list-item">
                {dataDisputeActive.length > 0 ? (
                  <InfiniteScroll
                    dataLength={dataDisputeActive.length}
                    next={loadMoreItemsDisputeActive}
                    hasMore={hasNextDisputeActive}
                    loader={
                      <>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                      </>
                    }
                    scrollableTarget="scrollableDiv"
                    scrollThreshold={'100px'}
                  >
                    {dataDisputeActive.map(item => {
                      return <DisputeDetailInfo timelineItem={item} key={item.id} />;
                    })}
                  </InfiniteScroll>
                ) : (
                  <Typography style={{ textAlign: 'center', marginTop: '2rem' }}>No dispute yet</Typography>
                )}
              </div>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <div className="list-item">
                {dataDisputeResolved.length > 0 ? (
                  <InfiniteScroll
                    dataLength={dataDisputeResolved.length}
                    next={loadMoreItemsDisputeResolved}
                    hasMore={hasNextDisputeResolved}
                    loader={
                      <>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                      </>
                    }
                    scrollableTarget="scrollableDiv"
                    scrollThreshold={'100px'}
                  >
                    {dataDisputeResolved.map(item => {
                      return <DisputeDetailInfo timelineItem={item} key={item.id} />;
                    })}
                  </InfiniteScroll>
                ) : (
                  <Typography style={{ textAlign: 'center', marginTop: '2rem' }}>No offer here</Typography>
                )}
              </div>
            </TabPanel>
          </SwipeableViews>

          {/* <Fab route="/my-offer/new" icon={<Add />} /> */}
        </MyDisputePage>
      </AuthorizationLayout>
    </MobileLayout>
  );
}
