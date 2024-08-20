'use client';

import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import RawQRCode from 'qrcode.react';
import React from 'react';

export const StyledRawQRCode = styled(RawQRCode)`
  cursor: pointer;
  border-radius: 26px;
`;

interface QRCodeProps {
  address: string;
}

const QRCode: React.FC<QRCodeProps> = ({ address }) => {
  const formatAddress = (address: string) => {
    if (!address) return;

    return address.slice(0, 5) + '...' + address.slice(-8);
  };
  return (
    <>
      <StyledRawQRCode
        width={'100%'}
        height={'75%'}
        includeMargin
        value={address}
        renderAs={'svg'}
        imageSettings={{ src: '/xec.svg', height: 40, width: 40, excavate: true }}
      />
      <Typography>{formatAddress(address)}</Typography>
    </>
  );
};

export default QRCode;
