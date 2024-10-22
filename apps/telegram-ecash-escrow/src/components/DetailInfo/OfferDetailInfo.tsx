'use client';

import { PostQueryItem, TimelineQueryItem } from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const OfferDetailWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;

  .prefix {
    font-size: 14px;
    color: #79869b;
  }

  .payment-group-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    button {
      border-radius: 10px;
      text-transform: capitalize;
    }
  }
`;

type OfferItemProps = {
  timelineItem?: TimelineQueryItem;
};

const OfferDetailInfo = ({ timelineItem }: OfferItemProps) => {
  const router = useRouter();
  const postData = timelineItem?.data as PostQueryItem;
  const offerData = postData?.postOffer;

  return (
    <OfferDetailWrap onClick={() => router.push(`/offer-detail?id=${offerData.postId}`)}>
      <Typography variant="body1">
        <span className="prefix">Message: </span>
        {offerData?.message}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Price: </span>
        Market price +{offerData?.marginPercentage}%
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Min-max: </span>
        {offerData?.orderLimitMin} {offerData?.coinPayment ?? offerData?.localCurrency ?? 'XEC'} -{' '}
        {offerData?.orderLimitMax} {offerData?.coinPayment ?? offerData?.localCurrency ?? 'XEC'}
      </Typography>
      <div className="payment-group-btns">
        {offerData?.paymentMethods &&
          offerData.paymentMethods?.length > 0 &&
          offerData.paymentMethods.map(item => {
            return (
              <Button size="small" color="success" variant="outlined" key={item.paymentMethod.name}>
                {item.paymentMethod.name}
              </Button>
            );
          })}
      </div>
    </OfferDetailWrap>
  );
};

export default OfferDetailInfo;
