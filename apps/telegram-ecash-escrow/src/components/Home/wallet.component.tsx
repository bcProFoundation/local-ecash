import Header from '@components/Common/Header';
import LixiButton from '@components/Common/LixiButton';
import styled from '@emotion/styled';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';

export interface TxHistory {
  type: string;
  amount: string;
  username?: string;
  dateTime: string;
  coin: string;
}

const ContainerWallet = styled.div``;

const WalletInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  .currency-info {
    text-align: center;
    .curency-image {
      width: 96px;
      height: 96px;
    }
  }
  .balance {
    width: 100%;
    margin-top: 1rem;
    align-self: flex-start;
    .balance-header {
      display: flex;
      justify-content: space-between;
      .title-balance {
        font-size: 18px;
        font-weight: 500;
      }
      .hidden-balance {
        height: 24px;
      }
    }
    .balance-content {
      text-align: center;
      padding: 2rem;
      background: #2c2c2c;
      margin: 1rem 0;
      border-radius: 0.5rem;
      .amount {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 26px;
        font-weight: 500;
        span {
          font-weight: 400;
          font-size: 16px;
          letter-spacing: 0.25px;
          opacity: 0.6;
        }
        svg {
          opacity: 0.6;
        }
      }
      .fiat-rate {
        font-weight: 400;
        font-size: 16px;
        letter-spacing: 0.25px;
        opacity: 0.6;
      }
    }
  }
  .group-action-wallet {
    width: 100%;
    display: flex;
    gap: 8px;
    a {
      width: 100%;
    }
    button {
      min-width: auto !important;
      width: 100% !important;
    }
  }
  .transaction-history {
    width: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    margin-top: 1rem;
    background: #2c2c2c;
    border-radius: 1rem;
    .title {
      font-size: 12px;
      font-weight: 400;
      text-transform: uppercase;
      padding: 1rem;
      padding-bottom: 0;
    }
    .transaction-detail {
      padding: 0.5rem 0;
    }
    .ghost-town {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 2rem;
      img {
        max-width: 20%;
      }
      .blank-title {
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 0.25px;
      }
      .blank-subtitle {
        text-align: center;
        font-size: 14px;
        letter-spacing: 0.25px;
      }
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #383838;
      border-left: 0;
      border-right: 0;
      padding: 1rem;
      background: #333;
      margin: 0.5rem 0;
      .tx-history {
        .amount {
          font-size: 16px;
          font-weight: 500;
          color: #73daa5;
          letter-spacing: 0.25px;
          &.sent {
            color: #ffb4a9;
          }
        }
        .username {
          font-size: 14px;
          color: #e0e4e7;
          letter-spacing: 0.25px;
          margin-top: 4px;
        }
      }
      .date-time {
        font-size: 10px;
        color: #d5d5d5;
      }
      &:last-child {
        // border-bottom: 1px solid gray;
      }
    }
  }
`;

export const Wallet: React.FC = () => {
  const [hideBalance, setHideBalance] = useState<boolean>(false);

  const handleHideBalance = () => {
    setHideBalance(!hideBalance);
  };

  return (
    <ContainerWallet>
      <Header />
      <WalletInfoContainer>
        <div className="currency-info">
          <img className="curency-image" src="/xec.svg" alt="" />
          <div className="curency-info">
            <p className="coin-symbol">eCash</p>
            <h3 className="coin-name">XEC</h3>
          </div>
        </div>
        <div className="balance">
          <div className="balance-header">
            <h2 className="title-balance">Total balance:</h2>
            <div className="hidden-balance" onClick={handleHideBalance}>
              {hideBalance ? <RemoveRedEyeOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
            </div>
          </div>
          <div className="balance-content">
            {hideBalance ? (
              <>
                <p className="amount">******</p>
                <p className="fiat-rate">******</p>
              </>
            ) : (
              <>
                <p className="amount">
                  33,542 <span>XEC</span>
                </p>
                <p className="fiat-rate">~ 2.20 USD</p>
              </>
            )}
          </div>
        </div>
        <div className="group-action-wallet">
          <Link href="/send">
            <LixiButton icon={<img src="/send.svg" />} title="Send" />
          </Link>
          <Link href="/receive">
            <LixiButton icon={<img src="/request.svg" />} title="Receive" />
          </Link>
        </div>
      </WalletInfoContainer>
    </ContainerWallet>
  );
};
