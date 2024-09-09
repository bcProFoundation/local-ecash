'use client';

import OrderDetailInfo from '@/src/components/DetailInfo/OrderDetailInfo';
import QRCode from '@/src/components/QRcode/QRcode';
import TelegramButton from '@/src/components/TelegramButton/TelegramButton';
import TickerHeader from '@/src/components/TickerHeader/TickerHeader';
import { BuildReleaseTx, BuyerReturnSignatory, sellerBuildDepositTx, SellerReleaseSignatory } from '@/src/store/escrow';
import { COIN, coinInfo, TX_HISTORY_COUNT } from '@bcpros/lixi-models';
import {
  CreateDisputeInput,
  disputeApi,
  DisputeStatus,
  EscrowOrder,
  escrowOrderApi,
  EscrowOrderStatus,
  getSelectedWalletPath,
  getWalletUtxos,
  useSliceSelector as useLixiSliceSelector,
  WalletContextNode
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Alert, Button, Snackbar, Stack, Typography } from '@mui/material';
import { MsgTxClient, WsEndpoint_InNode, WsMsgClient } from 'chronik-client';
import { fromHex, Script, shaRmd160 } from 'ecash-lib';
import cashaddr from 'ecashaddrjs';
import _ from 'lodash';
import { useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

const OrderDetailPage = styled.div`
  min-height: 100vh;
  background-image: url('/bg-dialog.svg');
  background-repeat: no-repeat;
  background-size: cover;
`;

const OrderDetailContent = styled.div`
  padding: 0 16px;

  .group-button-wrap {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 16px;

    button {
      text-transform: none;
      color: white;
    }
  }
`;
//TODO: Fix tx fee
const OrderDetail = () => {
  const search = useSearchParams();
  const id = search!.get('id');
  const [error, setError] = useState(false);
  const [escrow, setEscrow] = useState(false);
  const [release, setRelease] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copy, setCopy] = useState(false);
  const [ws, setWs] = useState<WsEndpoint_InNode>();
  const { useEscrowOrderQuery, useUpdateEscrowOrderStatusMutation } = escrowOrderApi;
  const { isLoading, currentData, isError, isSuccess } = useEscrowOrderQuery({ id: id! });
  const { useCreateDisputeMutation } = disputeApi;
  const [createDisputeTrigger] = useCreateDisputeMutation();
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const walletUtxos = useLixiSliceSelector(getWalletUtxos);
  const [updateOrderTrigger] = useUpdateEscrowOrderStatusMutation();
  const Wallet = useContext(WalletContextNode);
  const { chronik } = Wallet;

  const updateOrderStatus = async (status: EscrowOrderStatus) => {
    setLoading(true);

    await updateOrderTrigger({ input: { orderId: id!, status } })
      .unwrap()
      .catch(() => setError(true));

    setLoading(false);
  };

  const handleSellerDepositEscrow = async (status: EscrowOrderStatus) => {
    setLoading(true);

    try {
      const { amount } = currentData.escrowOrder;
      const sellerSk = fromHex(selectedWalletPath?.privateKey!);
      const sellerPk = fromHex(selectedWalletPath?.publicKey!);
      const script = Buffer.from(currentData?.escrowOrder.escrowScript as string, 'hex');

      const escrowScript = new Script(script);

      const txBuild = sellerBuildDepositTx(walletUtxos, sellerSk, sellerPk, amount, escrowScript);

      (await chronik.broadcastTx(txBuild)).txid;

      // show snackbar
      setEscrow(true);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  const handleSellerReleaseEscrow = async (status: EscrowOrderStatus) => {
    setLoading(true);

    try {
      const { amount } = currentData.escrowOrder;
      const sellerSk = fromHex(selectedWalletPath?.privateKey!);
      const sellerPk = fromHex(selectedWalletPath?.publicKey!);
      const escrowTxids = currentData?.escrowOrder.escrowTxids;
      const buyerPk = fromHex(currentData?.escrowOrder.buyerAccount.publicKey as string);
      const buyerPkh = shaRmd160(buyerPk);
      const buyerP2pkh = Script.p2pkh(buyerPkh);
      const nonce = currentData?.escrowOrder.nonce as string;
      const script = Buffer.from(currentData?.escrowOrder.escrowScript as string, 'hex');

      const escrowScript = new Script(script);
      const sellerSignatory = SellerReleaseSignatory(sellerSk, sellerPk, buyerPk, nonce);

      const txBuild = BuildReleaseTx(escrowTxids, amount, escrowScript, sellerSignatory, buyerP2pkh);

      const txid = (await chronik.broadcastTx(txBuild)).txid;

      ws && ws.close();

      // update order status to escrow
      await updateOrderTrigger({ input: { orderId: id!, status, txid } })
        .unwrap()
        .catch(() => setError(true));

      // show snackbar
      setRelease(true);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  const handleBuyerReturnEscrow = async (status: EscrowOrderStatus) => {
    setLoading(true);

    try {
      const { amount } = currentData.escrowOrder;
      const buyerSk = fromHex(selectedWalletPath?.privateKey!);
      const buyerPk = fromHex(selectedWalletPath?.publicKey!);
      const escrowTxid = currentData?.escrowOrder.escrowTxids;
      const sellerPk = fromHex(currentData?.escrowOrder.sellerAccount.publicKey as string);
      const sellerPkh = shaRmd160(sellerPk);
      const sellerP2pkh = Script.p2pkh(sellerPkh);
      const nonce = currentData?.escrowOrder.nonce as string;
      const script = Buffer.from(currentData?.escrowOrder.escrowScript as string, 'hex');

      const escrowScript = new Script(script);
      const buyerSignatory = BuyerReturnSignatory(buyerSk, buyerPk, sellerPk, nonce);

      const txBuild = BuildReleaseTx(escrowTxid, amount, escrowScript, buyerSignatory, sellerP2pkh);

      const txid = (await chronik.broadcastTx(txBuild)).txid;

      // update order status to escrow
      await updateOrderTrigger({ input: { orderId: id!, status, txid } })
        .unwrap()
        .catch(() => setError(true));

      // show snackbar
      setRelease(true);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  const createDispute = async () => {
    setLoading(true);

    const data: CreateDisputeInput = {
      createdBy: selectedWalletPath?.publicKey,
      escrowOrderId: id!,
      reason: 'Cuz i like it'
    };

    await createDisputeTrigger({ input: data })
      .unwrap()
      .catch(() => setError(true));

    setLoading(false);
  };

  const escrowStatus = () => {
    const isSeller = selectedWalletPath?.hash160 === currentData?.escrowOrder.sellerAccount.hash160;

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Cancel) {
      return (
        <Typography variant="body1" color="red" align="center">
          Order has been cancelled
        </Typography>
      );
    }

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Pending) {
      return (
        <Typography variant="body1" color="red" align="center">
          Awaiting order to be accepted
        </Typography>
      );
    }

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Active) {
      return isSeller ? (
        <Typography variant="body1" color="red" align="center">
          Please escrow the order
        </Typography>
      ) : (
        <Typography variant="body1" color="red" align="center">
          Pending Escrow. Do not send money or goods until the order is escrowed.
        </Typography>
      );
    }

    if (currentData?.escrowOrder.dispute && currentData.escrowOrder.dispute.status === DisputeStatus.Active) {
      return (
        <Typography variant="body1" color="red" align="center">
          Awating arbitrator/moderator to resolve the dispute
        </Typography>
      );
    }

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Escrow) {
      return isSeller ? (
        <Typography variant="body1" color="red" align="center">
          Only release the escrow when you have received the goods
        </Typography>
      ) : (
        <Typography variant="body1" color="red" align="center">
          Awaiting seller to release escrow
        </Typography>
      );
    }

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Complete) {
      return (
        <Typography variant="body1" color="red" align="center">
          Order has been completed
        </Typography>
      );
    }
  };

  const escrowActionButtons = () => {
    const isSeller = selectedWalletPath?.hash160 === currentData?.escrowOrder.sellerAccount.hash160;

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Pending) {
      return isSeller ? (
        <div className="group-button-wrap">
          <Button
            color="warning"
            variant="contained"
            onClick={() => updateOrderStatus(EscrowOrderStatus.Cancel)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => updateOrderStatus(EscrowOrderStatus.Active)}
            disabled={loading}
          >
            Accept
          </Button>
        </div>
      ) : (
        <Button
          color="warning"
          variant="contained"
          fullWidth
          onClick={() => updateOrderStatus(EscrowOrderStatus.Cancel)}
          disabled={loading}
        >
          Cancel
        </Button>
      );
    }

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Active) {
      return isSeller ? (
        <div className="group-button-wrap">
          <Button
            color="warning"
            variant="contained"
            onClick={() => updateOrderStatus(EscrowOrderStatus.Cancel)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => handleSellerDepositEscrow(EscrowOrderStatus.Escrow)}
          >
            Escrow
          </Button>
        </div>
      ) : (
        <Button
          color="warning"
          variant="contained"
          fullWidth
          onClick={() => updateOrderStatus(EscrowOrderStatus.Cancel)}
          disabled={loading}
        >
          Cancel
        </Button>
      );
    }

    //TODO: Add an modal before create a dispute
    if (currentData?.escrowOrder.status === EscrowOrderStatus.Escrow) {
      if (currentData.escrowOrder.dispute) {
        return;
      }

      return isSeller ? (
        <div className="group-button-wrap">
          <Button color="warning" variant="contained" disabled={loading} onClick={() => createDispute()}>
            Dispute
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => handleSellerReleaseEscrow(EscrowOrderStatus.Complete)}
            disabled={loading}
          >
            Release
          </Button>
        </div>
      ) : (
        <div className="group-button-wrap">
          <Button color="warning" variant="contained" disabled={loading} onClick={() => createDispute()}>
            Dispute
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => handleBuyerReturnEscrow(EscrowOrderStatus.Cancel)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      );
    }
  };

  const chronikHandleWsMessage = async (msg: WsMsgClient) => {
    try {
      // get the message type
      const { type } = msg;

      // For now, only act on "first seen" transactions, as the only logic to happen is first seen notifications
      // Dev note: Other chronik msg types
      // "BlockConnected", arrives as new blocks are found
      // "Confirmed", arrives as subscribed + seen txid is confirmed in a block
      if (type === 'Error') {
        return;
      }

      // get txid info
      const { txid } = msg as MsgTxClient;
      try {
        const escrowOrderAmount = currentData?.escrowOrder.amount * Math.pow(10, coinInfo[COIN.XEC].cashDecimals);
        const escrowOrderTxids = currentData?.escrowOrder.escrowTxids;
        let currentAmount = _.sumBy(escrowOrderTxids, 'value');

        const { outputs, tokenEntries } = await chronik.tx(txid);
        const startIndex: number = tokenEntries.length !== 0 ? 1 : 0;

        // process each tx output
        for (let i = startIndex; i < outputs.length; i++) {
          const scriptHex = outputs[i].outputScript;
          const address = cashaddr.encodeOutputScript(scriptHex, 'ecash');

          if (address === currentData?.escrowOrder.escrowAddress && !_.some(escrowOrderTxids, { txid: txid })) {
            const value = outputs[i].value;

            await updateOrderTrigger({
              input: { orderId: id!, status: EscrowOrderStatus.Active, txid, value }
            })
              .unwrap()
              .catch(() => setError(true));

            currentAmount += value;
          }
        }

        if (escrowOrderAmount <= currentAmount && currentData?.escrowOrder.status === EscrowOrderStatus.Active) {
          return await updateOrderTrigger({ input: { orderId: id!, status: EscrowOrderStatus.Escrow } })
            .unwrap()
            .catch(() => setError(true));
        }
      } catch (err) {
        // In this case, no notification
        return console.log(`Error in chronik.tx(${txid} while processing an incoming websocket tx`, err);
      }

      // parse tx for notification
      // const parsedChronikTx = await parseChronikTx(XPI, chronik, incomingTxDetails, wallet);
    } catch (e) {
      throw new Error(`_chronikHandleWsMessage: ${e.message}`);
    }
  };

  const subcribeToEscrow = async () => {
    const address = currentData?.escrowOrder.escrowAddress;
    const { type, hash } = cashaddr.decode(address, true);
    // Listen to updates on scripts:
    const ws = chronik.ws({
      onMessage: chronikHandleWsMessage,
      onReconnect: e => {
        // Fired before a reconnect attempt is made:
        console.log('Reconnecting websocket, disconnection cause: ', e);
      },
      onConnect: () => {
        console.log('Listening to address: ', address);
      },
      autoReconnect: true
    });
    // Wait for WS to be connected:
    await ws.waitForOpen();
    // Subscribe to scripts (on Lotus, current ABC payout address):
    // Will give a message on avg every 2 minutes
    ws.subscribeToScript(type as any, hash as string);

    setWs(ws);
  };

  const getTxHistory = async () => {
    const { hash } = cashaddr.decode(currentData?.escrowOrder.escrowAddress, true);

    try {
      const txs = await chronik
        .script('p2sh', hash as string)
        .history(/*page=*/ 0, /*page_size=*/ TX_HISTORY_COUNT)
        .then(result => {
          return result.txs;
        });
      const escrowOrderAmount = currentData?.escrowOrder.amount * Math.pow(10, coinInfo[COIN.XEC].cashDecimals);
      const escrowOrderTxids = currentData?.escrowOrder.escrowTxids;
      let currentAmount = _.sumBy(escrowOrderTxids, 'value');

      for (const tx of txs) {
        const { outputs, tokenEntries, txid } = tx;
        const startIndex: number = tokenEntries.length !== 0 ? 1 : 0;

        // process each tx output
        for (let i = startIndex; i < outputs.length; i++) {
          const scriptHex = outputs[i].outputScript;
          const address = cashaddr.encodeOutputScript(scriptHex, 'ecash');

          if (address === currentData?.escrowOrder.escrowAddress && !_.some(escrowOrderTxids, { txid: txid })) {
            const value = outputs[i].value;

            await updateOrderTrigger({
              input: { orderId: id!, status: EscrowOrderStatus.Active, txid, value }
            })
              .unwrap()
              .catch(() => setError(true));

            currentAmount += value;
          }
        }
      }

      if (escrowOrderAmount <= currentAmount && currentData?.escrowOrder.status === EscrowOrderStatus.Active) {
        return await updateOrderTrigger({ input: { orderId: id!, status: EscrowOrderStatus.Escrow } })
          .unwrap()
          .catch(() => setError(true));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const escrowAddress = () => {
    const isActive = currentData?.escrowOrder.status === EscrowOrderStatus.Active;
    const currentAmount =
      _.sumBy(currentData?.escrowOrder.escrowTxids, 'value') / Math.pow(10, coinInfo[COIN.XEC].cashDecimals);

    if (isActive) {
      return (
        <React.Fragment>
          <QRCode
            address={currentData?.escrowOrder.escrowAddress}
            amount={currentData?.escrowOrder.amount - currentAmount}
          />
        </React.Fragment>
      );
    }
  };

  useEffect(() => {
    isSuccess && getTxHistory();
  }, [isSuccess]);

  useEffect(() => {
    !ws && currentData?.escrowOrder.status === EscrowOrderStatus.Active && subcribeToEscrow();
  }, [currentData]);

  if (_.isEmpty(id) || _.isNil(id) || isError) {
    return <div>Invalid order id</div>;
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <OrderDetailPage>
      <TickerHeader title="Order detail" />
      <OrderDetailContent>
        <OrderDetailInfo order={currentData.escrowOrder as EscrowOrder} />
        <br />
        {escrowStatus()}
        <br />
        {escrowActionButtons()}
        <hr />
        <TelegramButton />
        {escrowAddress()}
      </OrderDetailContent>

      <Stack zIndex={999}>
        <Snackbar open={error} autoHideDuration={3500} onClose={() => setError(false)}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Order&apos;s status update failed
          </Alert>
        </Snackbar>

        <Snackbar open={escrow} autoHideDuration={3500} onClose={() => setEscrow(false)}>
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            Order escrowed successfully
            <br />
            {/* Always get the latest txid from array */}
            <a
              href={`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${currentData?.escrowOrder.escrowTxids[currentData?.escrowOrder.escrowTxids.length - 1]?.txid}`}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
          </Alert>
        </Snackbar>

        <Snackbar open={release} autoHideDuration={3500} onClose={() => setRelease(false)}>
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            Order released successfully
            <br />
            <a
              href={`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${currentData?.escrowOrder.releaseTxid}`}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
          </Alert>
        </Snackbar>

        <Snackbar open={cancel} autoHideDuration={3500} onClose={() => setCancel(false)}>
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            Order cancelled successfully. Funds have been returned to the buyer
            <br />
            <a
              href={`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${currentData?.escrowOrder.returnTxid}`}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
          </Alert>
        </Snackbar>

        <Snackbar open={copy} autoHideDuration={3500} onClose={() => setCopy(false)}>
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            Address copied to clipboard
            <br />
          </Alert>
        </Snackbar>
      </Stack>
    </OrderDetailPage>
  );
};

export default OrderDetail;
