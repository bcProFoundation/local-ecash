'use client';

import OfferDetailInfo from '@/src/components/DetailInfo/OfferDetailInfo';
import Header from '@/src/components/Header/Header';
import MobileLayout from '@/src/components/layout/MobileLayout';
import { accountsApi, PostQueryItem, useInfiniteActiveOfferByAccountIdQuery } from '@bcpros/redux-store';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as _ from 'lodash';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';

const ProfileDetaillPage = styled('div')(({ theme }) => ({
  padding: '1rem',

  '.profile-info': {
    background: theme.custom.bgItem6,
    borderRadius: '10px',
    padding: '10px',

    '.basic-info': {
      display: 'flex',
      gap: '10px'
    },

    '.info-detail': {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '10px'
    }
  },

  '.account-avatar-default': {
    width: '50px',
    height: '50px',
    color: theme.palette.text.primary
  }
}));

const StyledAvatar = styled('div')(({ theme }) => ({
  width: '2em',
  height: '2em',
  borderRadius: 50,
  overflow: 'hidden',
  display: 'inline-block',
  border: '2px solid #0076c4',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  '& img': {
    width: '100%',
    objectFit: 'cover'
  }
}));

const ProfileDetail = () => {
  const search = useSearchParams();
  const addressAccount = search!.get('address');
  const { useGetAccountByAddressQuery } = accountsApi;
  const { currentData: accountQueryData, isError } = useGetAccountByAddressQuery(
    { address: addressAccount },
    { skip: !addressAccount }
  );
  const { data } = useSession();

  const {
    data: dataOfferActive,
    hasNext: hasNextOfferActive,
    isFetching: isFetchingOfferActive,
    fetchNext: fetchNextOfferActive
  } = useInfiniteActiveOfferByAccountIdQuery({
    first: 20,
    accountId: accountQueryData?.getAccountByAddress?.id
  });

  const loadMoreItemsOfferActive = () => {
    if (hasNextOfferActive && !isFetchingOfferActive) {
      fetchNextOfferActive();
    } else if (hasNextOfferActive) {
      fetchNextOfferActive();
    }
  };

  const ListActiveOffer = () => {
    return (
      <InfiniteScroll
        dataLength={dataOfferActive.length}
        next={loadMoreItemsOfferActive}
        hasMore={hasNextOfferActive}
        endMessage={<p>hello</p>}
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
          const data = item?.data as PostQueryItem;
          if (data?.postOffer?.hideFromHome) return <div></div>;
          return <OfferDetailInfo timelineItem={item} key={item.id} isItemTimeline={false} />;
        })}
      </InfiniteScroll>
    );
  };

  if (_.isEmpty(addressAccount) || _.isNil(addressAccount) || isError) {
    return <Typography>Invalid address account</Typography>;
  }

  return (
    <MobileLayout>
      <ProfileDetaillPage>
        <Header />
        <div className="profile-info">
          <div className="basic-info">
            {data && data?.user?.image ? (
              <StyledAvatar>
                <picture>
                  <img src={data.user.image} alt="" />
                </picture>
              </StyledAvatar>
            ) : (
              <AccountCircleRoundedIcon className="account-avatar-default" fontSize="large" />
            )}
            <div>
              <Typography>{accountQueryData?.getAccountByAddress?.telegramUsername}</Typography>
              <Typography>
                Joined: {moment(accountQueryData?.getAccountByAddress?.createdAt).format('DD/MM/YYYY')}
              </Typography>
            </div>
          </div>
          <div className="info-detail">
            <div>
              <Typography>
                Total trade: {accountQueryData?.getAccountByAddress?.accountStatsOrder?.totalOrder}
              </Typography>
              <Typography>
                Donation: {accountQueryData?.getAccountByAddress?.accountStatsOrder?.donationAmount} XEC
              </Typography>
            </div>
            <div>
              <Typography>
                Completed order: {accountQueryData?.getAccountByAddress?.accountStatsOrder?.completedOrder}
              </Typography>
              <Typography>Rate: {accountQueryData?.getAccountByAddress?.accountStatsOrder?.completionRate}%</Typography>
            </div>
          </div>
        </div>

        <Typography variant="h5" style={{ marginTop: '20px', marginBottom: '5px' }}>
          Active offers
        </Typography>
        <div className="list-active-offer">{ListActiveOffer()}</div>
      </ProfileDetaillPage>
    </MobileLayout>
  );
};

export default ProfileDetail;
