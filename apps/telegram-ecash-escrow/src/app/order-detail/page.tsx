'use client';

import OrderDetailInfo from '@/src/components/DetailInfo/OrderDetailInfo';
import TelegramButton from '@/src/components/TelegramButton/TelegramButton';
import TickerHeader from '@/src/components/TickerHeader/TickerHeader';
import styled from '@emotion/styled';
import { Button, Typography } from '@mui/material';

const OrderDetailPage = styled.div`
  min-height: 100vh;
  background-image: url('/bg-dialog.svg');
  background-repeat: no-repeat;
  background-size: cover;
`;

const OrderDetailContent = styled.div`
  padding: 0 16px;

  .group-button-wrap {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 16px;

    button {
      text-transform: none;
      color: white;
    }
  }
`;

const OrderDetail = () => {
  return (
    <OrderDetailPage>
      <TickerHeader title="Order detail" />

      <OrderDetailContent>
        <OrderDetailInfo />
        <br />
        <Typography variant="body1" color="red" align="center">
          Pending Escrow. Do not send money or goods until the order is escrowed.
        </Typography>
        <br />
        <div className="group-button-wrap">
          <Button color="inherit" variant="contained">
            Cancel
          </Button>
          <Button color="warning" variant="contained">
            Dispute
          </Button>
        </div>
        <TelegramButton />
      </OrderDetailContent>
    </OrderDetailPage>
  );
};

export default OrderDetail;
