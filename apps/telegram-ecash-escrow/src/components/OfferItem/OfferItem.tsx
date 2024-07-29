'use client';

import styled from '@emotion/styled';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import { Button, IconButton, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState } from 'react';
import useAuthorization from '../Auth/use-authorization.hooks';
import PlaceAnOrderModal from '../PlaceAnOrderModal/PlaceAnOrderModal';

const OfferItemWrap = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .push-offer-wrap {
    display: flex;
    justify-content: space-between;
  }

  .prefix {
    font-size: 12px;
    color: #79869b;
  }

  .payment-group-btns {
    .cash-in-btn {
      margin-right: 8px;
      border-radius: 16px;
      font-size: 12px;
    }
    .bank-transfer-btn {
      border-radius: 16px;
      font-size: 12px;
    }
  }

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
`;

export default function OfferItem() {
  const [open, setOpen] = useState<boolean>(false);
  const { status } = useSession();
  const askAuthorization = useAuthorization();

  const handleBuyClick = () => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      setOpen(true);
    }
  };

  return (
    <React.Fragment>
      <OfferItemWrap>
        <div className="push-offer-wrap">
          <Typography variant="body2">
            <span className="prefix">By: </span>Nghiacc 🍃
          </Typography>
          <IconButton>
            <ArrowCircleUpRoundedIcon />
          </IconButton>
        </div>
        <Typography variant="body2">
          <span className="prefix">Offer: </span>Selling XEC
        </Typography>
        <Typography variant="body2">
          {' '}
          <span className="prefix">Min / max: </span>1M XEC - 100M XEC
        </Typography>
        <div className="payment-group-btns">
          <Button className="cash-in-btn" size="small" color="success" variant="outlined">
            Cash in person
          </Button>
          <Button className="bank-transfer-btn" size="small" color="warning" variant="outlined">
            Bank transfer
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            <span className="prefix">Price: </span>USD 50/ 1M XEC
          </Typography>
          <Button className="place-order-btn" color="success" variant="contained" onClick={() => handleBuyClick()}>
            Buy
            <Image width={25} height={25} src="/eCash.svg" alt="" />
          </Button>
        </div>
      </OfferItemWrap>

      <PlaceAnOrderModal isOpen={open} onDissmissModal={(value) => setOpen(value)} />
    </React.Fragment>
  );
}
