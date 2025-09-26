'use client';

import { Post } from '@bcpros/redux-store';
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

const OrderDetailInfo = ({ key, post }: { key: string; post: Post }) => {
  // Use split-based parity to avoid issues with stateful global RegExp.test
  const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/i;
  const IMAGE_EXT_REGEX = /\.(png|jpe?g|gif|webp|svg)(?:[?#].*|$)/i;

  const renderTextWithLinks = (text?: string) => {
    if (!text) return null;
    const parts = text.split(URL_SPLIT_REGEX);
    return (
      <>
        {parts.map((part, idx) => {
          if (idx % 2 === 1) {
            const url = part.trim();
            if (IMAGE_EXT_REGEX.test(url)) {
              return (
                <a key={idx} href={url} target="_blank" rel="noreferrer noopener" onClick={e => e.stopPropagation()}>
                  <img src={url} alt="attachment" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, display: 'block', marginTop: 6 }} />
                </a>
              );
            }
            return (
              <a key={idx} href={url} target="_blank" rel="noreferrer noopener" onClick={e => e.stopPropagation()}>
                {url}
              </a>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </>
    );
  };
  return (
    <OrderDetailWrap>
      <Typography variant="body1">
        <span className="prefix">No: </span> {post.id}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Offered At: </span>
        {post.createdAt}
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Price: </span>Market price + 5%
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Amount: </span>20M XEC
      </Typography>
      <Typography variant="body1">
        <span className="prefix">Message: </span>
        {renderTextWithLinks(post.offer?.message)}
      </Typography>
      <div className="payment-group-btns">
        {post.offer?.paymentMethods.map(method => {
          return (
            <Button key={method.id} className="cash-in-btn" size="small" color="success" variant="outlined">
              {method.paymentMethod.name}
            </Button>
          );
        })}
      </div>
    </OrderDetailWrap>
  );
};

export default OrderDetailInfo;
