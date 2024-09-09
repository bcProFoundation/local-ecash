'use client';

import styled from '@emotion/styled';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import { Badge, Fade, Skeleton, Slide, Typography } from '@mui/material';

import CreateOfferModal from '@/src/components/CreateOfferModal/CreateOfferModal';
import Footer from '@/src/components/Footer/Footer';
import Header from '@/src/components/Header/Header';
import OfferItem from '@/src/components/OfferItem/OfferItem';
import TopSection from '@/src/components/TopSection/TopSection';
import {
  OfferFilterInput,
  TimelineQueryItem,
  accountsApi,
  getNewPostAvailable,
  getOfferFilterConfig,
  getPaymenMethods,
  getSelectedWalletPath,
  offerApi,
  saveOfferFilterConfig,
  setNewPostAvailable,
  useInfiniteOfferFilterQuery,
  useInfiniteOffersByScoreQuery,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAuthorization from '../components/Auth/use-authorization.hooks';

const WrapHome = styled.div`
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

const HomePage = styled.div`
  position: relative;
  background-image: url('/shape-reg.svg');
  background-repeat: no-repeat;
  padding: 1rem;
  padding-bottom: 56px;
  min-height: 100svh;

  .shape-reg-footer {
    position: absolute;
    z-index: -1;
    bottom: 0;
    right: 0;
  }

  .MuiButton-root {
    text-transform: none;
  }

  .MuiIconButton-root {
    padding: 0 !important;

    &:hover {
      background: none;
      opacity: 0.8;
    }
  }
`;

const Section = styled.div`
  .content-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-offer {
      font-weight: 600;
    }
  }
`;

const StyledBadge = styled(Badge)`
  background: #0f98f2;
  position: fixed;
  z-index: 1;
  left: 40%;
  top: 1rem;
  cursor: pointer;
  padding: 8px 13px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  color: white;
  gap: 3px;

  .refresh-text {
    font-size: 14px;
    font-weight: bold;
  }
`;

export default function Home() {
  const prevRef = useRef(0);
  const { data: sessionData } = useSession();
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const { useUpdateAccountTelegramUsernameMutation, useGetAccountByAddressQuery } = accountsApi;
  const { currentData: accountQueryData } = useGetAccountByAddressQuery(
    { address: selectedWalletPath?.xAddress },
    { skip: !selectedWalletPath?.xAddress }
  );
  const [createTriggerUpdateAccountTelegramUsername] = useUpdateAccountTelegramUsernameMutation();
  const dispatch = useLixiSliceDispatch();
  const offerFilterConfig = useLixiSliceSelector(getOfferFilterConfig);
  const newPostAvailable = useLixiSliceSelector(getNewPostAvailable);
  const { status } = useSession();
  const askAuthorization = useAuthorization();

  const { data, hasNext, isFetching, fetchNext, refetch } = useInfiniteOffersByScoreQuery({ first: 20 }, false);
  const {
    data: dataFilter,
    hasNext: hasNextFilter,
    isFetching: isFetchingFilter,
    fetchNext: fetchNextFilter
  } = useInfiniteOfferFilterQuery({ first: 20, offerFilterInput: offerFilterConfig }, false);

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  const loadMoreItemsFilter = () => {
    if (hasNextFilter && !isFetchingFilter) {
      fetchNextFilter();
    } else if (hasNextFilter) {
      fetchNextFilter();
    }
  };
  const handleCreateOfferClick = e => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      setOpen(true);
    }
  };

  const handleRefresh = () => {
    dispatch(offerApi.api.util.resetApiState());
    refetch();
    dispatch(setNewPostAvailable(false));
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

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

  useEffect(() => {
    sessionData &&
      accountQueryData &&
      accountQueryData?.getAccountByAddress.telegramUsername !== sessionData?.user.name &&
      createTriggerUpdateAccountTelegramUsername({
        telegramId: sessionData.user.id,
        telegramUsername: sessionData.user.name
      });
  }, [sessionData]);

  //reset fitler and flag for new-post when reload
  useEffect(() => {
    const offerFilterInput: OfferFilterInput = {
      countryId: null,
      stateId: null,
      paymentMethodIds: []
    };
    dispatch(saveOfferFilterConfig(offerFilterInput));
    dispatch(setNewPostAvailable(false));
  }, []);

  //auto call paymentMethods
  useEffect(() => {
    dispatch(getPaymenMethods());
  }, []);

  return (
    <WrapHome>
      <Slide direction="down" in={newPostAvailable && visible}>
        <StyledBadge className="badge-new-offer" color="info" onClick={handleRefresh}>
          <CachedRoundedIcon color="action" /> <span className="refresh-text">Refresh</span>
        </StyledBadge>
      </Slide>
      <HomePage>
        <Header />
        <TopSection />

        <Section>
          <div className="content-wrap">
            <Typography className="title-offer" variant="body1">
              Offer Watchlist
            </Typography>
          </div>
          <div className="offer-list">
            {offerFilterConfig.countryId ||
            offerFilterConfig.stateId ||
            (offerFilterConfig.paymentMethodIds?.length ?? 0) > 0 ? (
              dataFilter.length > 0 ? (
                <InfiniteScroll
                  dataLength={dataFilter.length}
                  next={loadMoreItemsFilter}
                  hasMore={hasNextFilter}
                  loader={
                    <>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                    </>
                  }
                  scrollableTarget="scrollableDiv"
                  scrollThreshold={'100px'}
                >
                  {dataFilter.map(item => {
                    return <OfferItem key={item.id} timelineItem={item as TimelineQueryItem} />;
                  })}
                </InfiniteScroll>
              ) : (
                <Typography style={{ textAlign: 'center', marginTop: '2rem' }}>No offer in your filter</Typography>
              )
            ) : data.length > 0 ? (
              <InfiniteScroll
                dataLength={data.length}
                next={loadMoreItems}
                hasMore={hasNext}
                loader={
                  <>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </>
                }
                scrollableTarget="scrollableDiv"
                scrollThreshold={'100px'}
              >
                {data.map(item => {
                  return <OfferItem key={item.id} timelineItem={item as TimelineQueryItem} />;
                })}
              </InfiniteScroll>
            ) : (
              <Typography style={{ textAlign: 'center', marginTop: '2rem' }}>No offer here</Typography>
            )}
          </div>
        </Section>
        <Image width={200} height={200} className="shape-reg-footer" src="/shape-reg-footer.svg" alt="" />
      </HomePage>
      <Fade in={visible}>
        <div className="btn-create-offer" onClick={handleCreateOfferClick}>
          <img src="/ico-create-post.svg" />
        </div>
      </Fade>
      <CreateOfferModal
        isOpen={open}
        onDissmissModal={value => {
          setOpen(value);
        }}
      />
      <Footer hidden={visible} />
    </WrapHome>
  );
}
