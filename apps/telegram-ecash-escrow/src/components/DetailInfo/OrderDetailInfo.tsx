'use client';

import { EscrowOrder } from '@bcpros/redux-store';
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

const OrderDetailInfo = props => {
  const { order }: { order: EscrowOrder } = props;

  return (
    <OrderDetailWrap>
      <Typography variant="body1">
        <span className="prefix">No: </span>
        {order.id}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Offer: </span>
        {order.offer.message}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Ordered by: </span>
        {order.buyerAccount.telegramId}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Ordered at: </span>
        {order.createdAt.toLocaleString()}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Price: </span>
        {order.price}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Amount: </span>
        {order.amount}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Message: </span>
        {order.message}
      </Typography>
      <div className="payment-group-btns">
        <Button className="cash-in-btn" size="small" color="success" variant="outlined">
          {order.paymentMethod.name}
        </Button>
      </div>
    </OrderDetailWrap>
  );
};

export default OrderDetailInfo;
