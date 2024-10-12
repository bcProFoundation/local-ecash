'use client';

import {
  PostQueryItem,
  TimelineQueryItem,
  openModal,
  useSliceDispatch as useLixiSliceDispatch
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Card, CardContent, Collapse, IconButton, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState } from 'react';
import useAuthorization from '../Auth/use-authorization.hooks';
import PlaceAnOrderModal from '../PlaceAnOrderModal/PlaceAnOrderModal';

const CardWrapper = styled(Card)`
  margin-top: 16px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 16px;

  .prefix {
    font-size: 12px;
    color: #79869b;
  }

  .MuiCardContent-root {
    padding: 16px 16px 0 16px;
  }

  .MuiCollapse-root {
    .MuiCardContent-root {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 16px 0;
    }

    .payment-group-btns {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      button {
        border-radius: 10px;
      }
    }
  }

  .boost-buy {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    align-items: center;

    .place-order-btn {
      display: flex;
      gap: 8px;
      font-weight: 600;
      margin: 0;
      background: #0076c4;
      width: fit-content;
      filter: drop-shadow(0px 0px 3px #0076c4);
      color: white;
      box-shadow: none;
      border-radius: 12px;
      font-size: 13px;
    }
  }
`;

const OfferShowWrapItem = styled.div`
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  .push-offer-wrap,
  .minmax-collapse-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

type OfferItemProps = {
  timelineItem?: TimelineQueryItem;
};

export default function OfferItem({ timelineItem }: OfferItemProps) {
  const dispatch = useLixiSliceDispatch();
  const post = timelineItem?.data as PostQueryItem;
  const offerData = post?.postOffer;
  const countryName = offerData?.country?.name;
  const stateName = offerData?.state?.name;
  const [open, setOpen] = useState<boolean>(false);
  const { status } = useSession();
  const askAuthorization = useAuthorization();

  const handleBuyClick = e => {
    e.stopPropagation();

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      setOpen(true);
    }
  };

  const [expanded, setExpanded] = React.useState(false);

  const handleBoost = async () => {
    if (status === 'unauthenticated') {
      askAuthorization();
      return;
    }

    const amountBoost = 6;
    dispatch(openModal('BoostModal', { amount: amountBoost, post: post }));
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const OfferItem = (
    <OfferShowWrapItem>
      <div className="push-offer-wrap">
        <Typography variant="body2">
          <span className="prefix">By: </span> {post?.account?.telegramUsername ?? ''}
        </Typography>
        <IconButton onClick={handleBoost}>
          <ArrowCircleUpRoundedIcon />
        </IconButton>
      </div>
      <Typography variant="body2">
        <span className="prefix">Price: </span>
        {offerData?.price}
      </Typography>
      <div className="minmax-collapse-wrap">
        <Typography variant="body2">
          <span className="prefix">Min / max: </span>
          {offerData?.orderLimitMin} XEC - {offerData?.orderLimitMax} XEC
        </Typography>
        <ExpandMoreIcon onClick={handleExpandClick} style={{ cursor: 'pointer' }} />
      </div>
    </OfferShowWrapItem>
  );

  return (
    <React.Fragment>
      <CardWrapper>
        <CardContent>{OfferItem}</CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit className="hidden-item-wrap">
          <CardContent>
            <Typography variant="body2">
              <span className="prefix">Message: </span>
              {offerData?.message}
            </Typography>
            <Typography variant="body2">
              <span className="prefix">Location: </span>
              {[stateName, countryName].filter(Boolean).join(', ')}
            </Typography>
            <div className="payment-group-btns">
              {offerData?.paymentMethods &&
                offerData.paymentMethods?.length > 0 &&
                offerData.paymentMethods.map(item => {
                  return (
                    <Button size="small" color="warning" variant="outlined" key={item.paymentMethod.name}>
                      {item.paymentMethod.name}
                    </Button>
                  );
                })}
            </div>
          </CardContent>
        </Collapse>

        <Typography className="boost-buy">
          <Button className="place-order-btn" color="success" variant="contained" onClick={e => handleBuyClick(e)}>
            Buy
            <Image width={25} height={25} src="/eCash.svg" alt="" />
          </Button>
        </Typography>
      </CardWrapper>

      <PlaceAnOrderModal isOpen={open} onDissmissModal={value => setOpen(value)} post={post} />
    </React.Fragment>
  );
}
