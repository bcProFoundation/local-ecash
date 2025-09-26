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

  const sanitizeUrl = (raw?: string): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:') || lower.startsWith('file:') || lower.startsWith('blob:')) return null;
    try {
      const url = new URL(trimmed);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      const path = encodeURI(url.pathname + url.search + url.hash);
      return `${url.protocol}//${url.host}${path}`;
    } catch (e) {
      return null;
    }
  };

  const parseSafeHttpUrl = (urlStr: string): URL | null => {
    try {
      const url = new URL(urlStr);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      if (urlStr.startsWith('data:')) return null;
      return url;
    } catch (e) {
      return null;
    }
  };

  const isSafeImageUrl = (url: URL): boolean => {
    if (/\.svg(\?|$)/i.test(url.pathname)) return false;
    return /\.(png|jpe?g|gif|bmp|webp)$/i.test(url.pathname);
  };

  const renderTextWithLinks = (text?: string) => {
    if (!text) return null;
    const parts = text.split(URL_SPLIT_REGEX);
    return (
      <>
        {parts.map((part, idx) => {
          if (idx % 2 === 1) {
            const url = part.trim();
            const parsed = parseSafeHttpUrl(url);
            const safe = sanitizeUrl(url);
            if (parsed && isSafeImageUrl(parsed) && safe && IMAGE_EXT_REGEX.test(safe)) {
              return (
                <a key={idx} href={safe} target="_blank" rel="noreferrer noopener" onClick={e => e.stopPropagation()}>
                  <img src={safe} alt="attachment" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, display: 'block', marginTop: 6 }} />
                </a>
              );
            }
            if (parsed && safe) {
              return (
                <a key={idx} href={safe} target="_blank" rel="noreferrer noopener" onClick={e => e.stopPropagation()}>
                  {safe}
                </a>
              );
            }
            return <span key={idx}>{url}</span>;
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
