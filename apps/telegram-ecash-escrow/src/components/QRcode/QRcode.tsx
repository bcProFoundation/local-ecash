'use client';

import styled from '@emotion/styled';
import { CopyAllOutlined } from '@mui/icons-material';
import { Alert, Button, Snackbar, Stack, Typography } from '@mui/material';
import RawQRCode from 'qrcode.react';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

export const StyledRawQRCode = styled(RawQRCode)`
  cursor: pointer;
  border-radius: 26px;
`;

interface QRCodeProps {
  address: string;
  amount?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ address, amount }) => {
  const [copy, setCopy] = useState(false);
  const formatAddress = (address: string) => {
    if (!address) return;

    return address.slice(0, 5) + '...' + address.slice(-8);
  };

  return (
    <React.Fragment>
      <StyledRawQRCode
        width={'100%'}
        height={'75%'}
        includeMargin
        value={amount ? `${address}?amount=${amount}` : address}
        renderAs={'svg'}
      />
      <Typography variant="body1" align="center">
        {formatAddress(address)}
        <CopyToClipboard text={address} onCopy={() => setCopy(true)}>
          <Button className="no-border-btn" endIcon={<CopyAllOutlined />} />
        </CopyToClipboard>
      </Typography>

      <Stack>
        <Snackbar open={copy} autoHideDuration={3500} onClose={() => setCopy(false)}>
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            Address copied to clipboard
            <br />
          </Alert>
        </Snackbar>
      </Stack>
    </React.Fragment>
  );
};

export default QRCode;
