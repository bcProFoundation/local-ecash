'use client';

import { escrowOrderApi } from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Alert, Button, Snackbar } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';

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

type TelegramButtonProps = {
  escrowOrderId: string;
  username?: string | null;
  telegramId?: string | null;
  content?: string;
  disabled?: boolean;
};

const NO_TELEGRAM_ACCOUNT =
  'This person has no Telegram account linked, so a chat request cannot be delivered. You can still open a dispute.';

const TelegramButton: React.FC<TelegramButtonProps> = ({ escrowOrderId, username, telegramId, content, disabled }) => {
  const { useLazyUserRequestTelegramChatQuery } = escrowOrderApi;
  const [trigger, { isFetching, isLoading }] = useLazyUserRequestTelegramChatQuery();
  const [request, setRequest] = useState(false);
  const [tooManyRequest, setTooManyRequest] = useState(false);
  const [fail, setFail] = useState(false);
  const [failMessage, setFailMessage] = useState('Failed to request chat...');

  const handleTelegramClick = async () => {
    if (username && username.startsWith('@')) {
      const url = `https://t.me/${username.substring(1)}`;
      window.open(url, '_blank');
      return;
    }

    if (!telegramId) {
      setFailMessage(NO_TELEGRAM_ACCOUNT);
      setFail(true);
      return;
    }

    await trigger({ id: escrowOrderId })
      .unwrap()
      .then(() => setRequest(true))
      .catch(e => {
        const message = typeof e?.message === 'string' ? e.message.replace(/^Error:\s*/i, '') : '';
        if (message.includes('Too many requests')) {
          setTooManyRequest(true);
        } else {
          setFailMessage(message || 'Failed to request chat...');
          setFail(true);
        }
      });
  };

  return (
    <React.Fragment>
      <TelegramButtonWrap
        color="info"
        variant="contained"
        onClick={() => handleTelegramClick()}
        disabled={isFetching || isLoading || disabled}
      >
        {content}
        <Image src={'/ico-telegram.svg'} width={32} height={32} alt="" />
      </TelegramButtonWrap>

      <Snackbar open={request} autoHideDuration={3500} onClose={() => setRequest(false)}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Chat requested!
        </Alert>
      </Snackbar>

      <Snackbar open={fail} autoHideDuration={6000} onClose={() => setFail(false)}>
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          {failMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={tooManyRequest} autoHideDuration={3500} onClose={() => setTooManyRequest(false)}>
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          Slow down! You have sent too many requests recently. Please wait an hour and try again.
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default TelegramButton;
