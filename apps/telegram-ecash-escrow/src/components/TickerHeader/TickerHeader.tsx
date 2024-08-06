'use client';

import styled from '@emotion/styled';
import { ChevronLeft } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

const Header = styled.div`
  position: relative;
  padding: 16px 8px;

  button {
    position: absolute;
    padding: 0;

    svg {
      font-size: 32px;
    }
  }

  h4 {
    text-align: center;
    font-size: 26px;
  }
`;

interface TickerHeaderProps {
  title: string;
  hideIcon?: boolean;
}

const TickerHeader: React.FC<TickerHeaderProps> = ({ title, hideIcon }) => {
  const router = useRouter();

  return (
    <Header>
      {!hideIcon && (
        <IconButton className="back-btn" onClick={() => router.back()}>
          <ChevronLeft />
        </IconButton>
      )}
      <Typography variant="h4">{title}</Typography>
    </Header>
  );
};

export default TickerHeader;
