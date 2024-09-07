'use client';

import Footer from '@/src/components/Footer/Footer';
import Header from '@/src/components/Header/Header';
import QRCode from '@/src/components/QRcode/QRcode';
import SendComponent from '@/src/components/Send/send';
import CustomToast from '@/src/components/Toast/CustomToast';
import { COIN } from '@bcpros/lixi-models';
import {
  getSelectedWalletPath,
  getWalletStatusNode,
  parseCashAddressToPrefix,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Button, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const WrapWallet = styled.div`
  position: relative;
  background-image: url('/shape-reg.svg');
  background-repeat: no-repeat;
  padding: 1rem;
  padding-bottom: 56px;
  min-height: 100svh;

  .shape-reg-footer {
    position: absolute;
    z-index: -1;
    bottom: 0;
    right: 0;
  }
`;

const WrapContentWallet = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .balance-amount {
    h5 {
      font-weight: bold;
    }
    .amount {
      background-color: rgba(255, 255, 255, 0.08);
      padding: 25px 10px;
      border-radius: 15px;
      display: flex;
      justify-content: center;

      .coin-ticker {
        font-size: 13px;
      }
    }
  }

  .group-btn {
    display: flex;
    gap: 10px;

    button {
      background: #0076c4;
      width: 100%;
      color: #fff;
      font-weight: bold;
      border-radius: 12px;
      text-transform: capitalize;
    }
  }
`;

const ReceiveWrap = styled.div`
  display: flex;
  text-align: center;
  margin-top: 10px;
`;

const SendWrap = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 15px;
  margin-top: 10px;
`;

export default function Wallet() {
  const walletStatusNode = useLixiSliceSelector(getWalletStatusNode);
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);

  const [address, setAddress] = useState(parseCashAddressToPrefix(COIN.XEC, selectedWalletPath.cashAddress));
  const [openReceive, setOpenReceive] = useState(true);
  const [openToastCopySuccess, setOpenToastCopySuccess] = useState(false);

  const handleOnCopy = () => {
    setOpenToastCopySuccess(true);
  };

  return (
    <>
      <WrapWallet>
        <Header />

        <WrapContentWallet>
          <div className="balance-amount">
            <Typography variant="h5">Balance</Typography>
            <div className="amount">
              <Typography variant="h5">
                {walletStatusNode.balances.totalBalance} <span className="coin-ticker">XEC</span>
              </Typography>
            </div>
          </div>
          <div className="group-btn">
            <Button color="success" variant="contained" className="btn-send" onClick={() => setOpenReceive(false)}>
              Send
            </Button>
            <Button color="success" variant="contained" className="btn-receive" onClick={() => setOpenReceive(true)}>
              Receive
            </Button>
          </div>
          {openReceive ? (
            <ReceiveWrap>
              <CopyToClipboard
                style={{
                  display: 'inline-block',
                  width: '100%',
                  position: 'relative'
                }}
                text={address}
                onCopy={handleOnCopy}
              >
                <div>
                  <QRCode address={address} />
                </div>
              </CopyToClipboard>
            </ReceiveWrap>
          ) : (
            <SendWrap>
              <SendComponent />
            </SendWrap>
          )}
        </WrapContentWallet>
        <Image width={200} height={200} className="shape-reg-footer" src="/shape-reg-footer.svg" alt="" />

        <CustomToast
          isOpen={openToastCopySuccess}
          handleClose={() => setOpenToastCopySuccess(false)}
          content="Copy address to clipboard"
          type="info"
        />
      </WrapWallet>
      <Footer />
    </>
  );
}
