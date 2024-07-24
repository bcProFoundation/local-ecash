'use client';

import styled from '@emotion/styled';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { IconButton, Typography } from '@mui/material';

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;

  .greeting {
    margin-bottom: 16px;

    .handle-name {
      font-weight: 600;
    }
  }
`;

export default function Header() {
  return (
    <StyledHeader>
      <div className="greeting">
        <Typography variant="body2">Hala</Typography>
        <Typography className="handle-name" variant="body1">
          Nghiacc 🍃
        </Typography>
      </div>
      <div className="wallet-minimals">
        <IconButton>
          <AccountCircleRoundedIcon fontSize="large" />
        </IconButton>
      </div>
    </StyledHeader>
  );
}
