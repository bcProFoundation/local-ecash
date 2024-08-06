'use client';

import styled from '@emotion/styled';
import { Button } from '@mui/material';
import Image from 'next/image';

const TelegramButtonWrap = styled(Button)`
  width: 100%;
  margin: 16px 0;
  color: white;
  font-weight: 600;
  display: flex;
  gap: 8px;
  text-transform: none;
  padding: 12px;
`;

const TelegramButton = () => {
  return (
    <TelegramButtonWrap color="info" variant="contained">
      Chat on Telegram
      <Image src={'/ico-telegram.svg'} width={32} height={32} alt="" />
    </TelegramButtonWrap>
  );
};

export default TelegramButton;
