'use client';

import styled from '@emotion/styled';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { IconButton, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import useAuthorization from '../Auth/use-authorization.hooks';

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
  const { data, status } = useSession();
  const askAuthorization = useAuthorization();

  const handleIconClick = () => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      //router.push here
      console.log('user data', data);
    }
  };

  return (
    <StyledHeader>
      <div className="greeting">
        <Typography variant="body2">Hala</Typography>
        <Typography className="handle-name" variant="body1">
          @{data?.user.name ?? 'Anonymous'}
        </Typography>
      </div>
      <div className="wallet-minimals">
        <IconButton onClick={() => handleIconClick()}>
          <AccountCircleRoundedIcon fontSize="large" />
        </IconButton>
      </div>
    </StyledHeader>
  );
}
