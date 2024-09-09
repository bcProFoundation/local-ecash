'use client';
import CreateOfferModal from '@/src/components/CreateOfferModal/CreateOfferModal';
import OfferDetailInfo from '@/src/components/DetailInfo/OfferDetailInfo';
import Footer from '@/src/components/Footer/Footer';
import TickerHeader from '@/src/components/TickerHeader/TickerHeader';
import { TabType } from '@/src/store/constants';
import { OfferStatus, useInfiniteMyOffersQuery } from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Box, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import SwipeableViews from 'react-swipeable-views';

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

  .btn-create-offer {
    position: fixed;
    right: 5%;
    bottom: 100px;
    z-index: 1;
    cursor: pointer;
    background-color: rgb(255, 219, 209);
    padding: 10px;
    border-radius: 50%;
    display: flex;
  }
`;

export default function MyOffer() {
  const [value, setValue] = useState(0);
  const [open, setOpen] = useState<boolean>(false);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  const {
    data: dataOfferActive,
    hasNext: hasNextOfferActive,
    isFetching: isFetchingOfferActive,
    fetchNext: fetchNextOfferActive
  } = useInfiniteMyOffersQuery({
    first: 20,
    offerStatus: OfferStatus.Active
  });

  const loadMoreItemsOfferActive = () => {
    if (hasNextOfferActive && !isFetchingOfferActive) {
      fetchNextOfferActive();
    } else if (hasNextOfferActive) {
      fetchNextOfferActive();
    }
  };

  const {
    data: dataOfferArchive,
    hasNext: hasNextOfferArchive,
    isFetching: isFetchingOfferArchive,
    fetchNext: fetchNextOfferArchive
  } = useInfiniteMyOffersQuery({
    first: 20,
    offerStatus: OfferStatus.Archive
  });
  const loadMoreItemsOfferArchive = () => {
    if (hasNextOfferArchive && !isFetchingOfferArchive) {
      fetchNextOfferArchive();
    } else if (hasNextOfferArchive) {
      fetchNextOfferArchive();
    }
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
              {dataOfferActive.length > 0 ? (
                <InfiniteScroll
                  dataLength={dataOfferActive.length}
                  next={loadMoreItemsOfferActive}
                  hasMore={hasNextOfferActive}
                  loader={
                    <>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                    </>
                  }
                  scrollableTarget="scrollableDiv"
                  scrollThreshold={'100px'}
                >
                  {dataOfferActive.map(item => {
                    return <OfferDetailInfo timelineItem={item} key={item.id} />;
                  })}
                </InfiniteScroll>
              ) : (
                <Typography style={{ textAlign: 'center', marginTop: '2rem' }}>No offer here</Typography>
              )}
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <div className="list-item">
              {dataOfferArchive.length > 0 ? (
                <InfiniteScroll
                  dataLength={dataOfferArchive.length}
                  next={loadMoreItemsOfferArchive}
                  hasMore={hasNextOfferArchive}
                  loader={
                    <>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                    </>
                  }
                  scrollableTarget="scrollableDiv"
                  scrollThreshold={'100px'}
                >
                  {dataOfferArchive.map(item => {
                    return <OfferDetailInfo timelineItem={item} key={item.id} />;
                  })}
                </InfiniteScroll>
              ) : (
                <Typography style={{ textAlign: 'center', marginTop: '2rem' }}>No offer archive</Typography>
              )}
            </div>
          </TabPanel>
        </SwipeableViews>

        <div className="btn-create-offer" onClick={() => setOpen(true)}>
          <img src="/ico-create-post.svg" />
        </div>
        <CreateOfferModal
          isOpen={open}
          onDissmissModal={value => {
            setOpen(value);
          }}
        />
      </MyOfferPage>

      <Footer />
    </React.Fragment>
  );
}
