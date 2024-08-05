'use client';

import styled from '@emotion/styled';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import ResolveDisputeModal from '../ResolveDisputeModal/ResolveDisputeModal';

const DisputeDetailInfoWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .prefix {
    font-size: 14px;
    color: #79869b;
  }

  .cash-in-btn {
    margin-right: 8px;
    border-radius: 16px;
    font-size: 12px;
    text-transform: none;
  }

  .bank-transfer-btn {
    border-radius: 16px;
    font-size: 12px;
    text-transform: none;
  }

  .amount-escrowed {
    color: #66bb6a;
  }

  .amount-seller {
    color: #29b6f6;
  }

  .amount-buyer {
    color: #f44336;
  }
`;

const DisputeDetailInfo = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  return (
    <>
      <DisputeDetailInfoWrap onClick={() => setIsOpenModal(true)}>
        <Typography variant="body1">
          <span className="prefix">Dispute by seller: </span>No show
        </Typography>
        <Typography variant="body1">
          <span className="prefix">Offer: </span>Selling XEC
        </Typography>
        <Typography variant="body1">
          <span className="prefix">Price: </span>USD 50/ 1M XEC
        </Typography>
        <div className="payment-group-btns">
          <Button className="cash-in-btn" size="small" color="success" variant="outlined">
            Cash in person
          </Button>
          <Button className="bank-transfer-btn" size="small" color="warning" variant="outlined">
            Bank transfer
          </Button>
        </div>
        <Typography variant="body1">
          <span className="prefix">Location: </span>Hoi An, Vietnam 🍃
        </Typography>
        <Typography variant="body1">
          <span className="prefix">Posted: </span>2024-03-18 12:42:39
        </Typography>
        <Typography variant="body1" className="amount-escrowed">
          20.4M XEC escrowed!
        </Typography>
        <Typography variant="body1" className="amount-seller">
          200k XEC dispute fees by seller
        </Typography>
        <Typography variant="body1" className="amount-buyer">
          200k XEC dispute fees by buyer
        </Typography>
        <Typography variant="body1">
          <span className="prefix">Seller: </span>Seller 1 🍃
        </Typography>
        <Typography variant="body1">
          <span className="prefix">Buyer: </span>Buyer 1 🍃
        </Typography>
      </DisputeDetailInfoWrap>

      <ResolveDisputeModal isOpen={isOpenModal} onDissmissModal={(value) => setIsOpenModal(value)} />
    </>
  );
};

export default DisputeDetailInfo;
