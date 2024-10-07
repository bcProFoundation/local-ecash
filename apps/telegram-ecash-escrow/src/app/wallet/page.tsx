'use client';

import Header from '@/src/components/Header/Header';
import AuthorizationLayout from '@/src/components/layout/AuthorizationLayout';
import MobileLayout from '@/src/components/layout/MobileLayout';
import QRCode from '@/src/components/QRcode/QRcode';
import SendComponent from '@/src/components/Send/send';
import { COIN, coinInfo } from '@bcpros/lixi-models';
import {
  escrowOrderApi,
  getSelectedWalletPath,
  getWalletUtxosNode,
  parseCashAddressToPrefix,
  useSliceSelector as useLixiSliceSelector,
  UtxoInNodeInput
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Backdrop, Button, Stack, Typography } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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
  const { data: sessionData } = useSession();
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const utxos = useLixiSliceSelector(getWalletUtxosNode);

  const [address, setAddress] = useState(parseCashAddressToPrefix(COIN.XEC, selectedWalletPath?.cashAddress));
  const [openReceive, setOpenReceive] = useState(true);

  const [totalValidAmount, setTotalValidAmount] = useState<number>(0);
  const [totalValidUtxos, setTotalValidUtxos] = useState([]);

  const { useFilterUtxosMutation } = escrowOrderApi;
  const [filterUtxos] = useFilterUtxosMutation();

  if (selectedWalletPath === null && sessionData) {
    return (
      <Backdrop sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={true}>
        <Stack>
          <Typography variant="h5" align="center">
            No wallet detected
          </Typography>
          <Typography variant="body1" align="center">
            Please sign out and try again!
          </Typography>
          <Button
            variant="contained"
            style={{ marginTop: '15px' }}
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
          >
            Sign Out
          </Button>
        </Stack>
      </Backdrop>
    );
  }

  //call to validate utxos
  useEffect(() => {
    if (utxos.length === 0) return;
    const listUtxos: UtxoInNodeInput[] = utxos.map(item => {
      return {
        txid: item.outpoint.txid,
        outIdx: item.outpoint.outIdx,
        value: item.value
      };
    });

    const funcFilterUtxos = async () => {
      try {
        const listFilterUtxos = await filterUtxos({ input: listUtxos }).unwrap();
        const totalValueUtxos = listFilterUtxos.filterUtxos.reduce((acc, item) => acc + item.value, 0);
        setTotalValidUtxos(listFilterUtxos.filterUtxos);
        setTotalValidAmount(totalValueUtxos / Math.pow(10, coinInfo[COIN.XEC].cashDecimals));
      } catch (error) {
        console.error('Error filtering UTXOs:', error);
      }
    };

    funcFilterUtxos();
  }, [utxos]);

  return (
    <MobileLayout>
      <AuthorizationLayout>
        <WrapWallet>
          <Header />

          <WrapContentWallet>
            <div className="balance-amount">
              <Typography variant="h5">Balance</Typography>
              <div className="amount">
                <Typography variant="h5">
                  {totalValidAmount ?? 0} <span className="coin-ticker">XEC</span>
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
                <QRCode address={address} />
              </ReceiveWrap>
            ) : (
              <SendWrap>
                <SendComponent totalValidAmount={totalValidAmount} totalValidUtxos={totalValidUtxos} />
              </SendWrap>
            )}
          </WrapContentWallet>
          <Image width={200} height={200} className="shape-reg-footer" src="/shape-reg-footer.svg" alt="" />
        </WrapWallet>
      </AuthorizationLayout>
    </MobileLayout>
  );
}
