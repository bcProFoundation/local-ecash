'use client';

import styled from '@emotion/styled';
import { Button, Typography } from '@mui/material';

const OrderDetailWrap = styled.div`
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
`;

const OrderDetailInfo = () => {
  return (
    <OrderDetailWrap>
      <Typography variant="body1">
        <span className="prefix">No: </span>123456789
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Offer: </span>12345678, Selling XEC @ Hoi An, Vietnam
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Ordered by: </span>Nghiacc 🍃
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Ordered: </span>2024-03-18 12:42:39
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Price: </span>Market price + 5%
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Amount: </span>20M XEC
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Message: </span>I want to buy XEC by Cash. Can we meet? Contact me on TG for details
      </Typography>
      <div className="payment-group-btns">
        <Button className="cash-in-btn" size="small" color="success" variant="outlined">
          Cash in person
        </Button>
      </div>
    </OrderDetailWrap>
  );
};

export default OrderDetailInfo;
