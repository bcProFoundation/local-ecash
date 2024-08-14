'use client';

import OrderDetailInfo from '@/src/components/OrderDetailInfo/OrderDetailInfo';
import TelegramButton from '@/src/components/TelegramButton/TelegramButton';
import TickerHeader from '@/src/components/TickerHeader/TickerHeader';
import { BuildReleaseTx, BuyerReturnSignatory, sellerBuildDepositTx, SellerReleaseSignatory } from '@/src/store/escrow';
import { COIN, coinInfo } from '@bcpros/lixi-models';
import {
  escrowOrderApi,
  EscrowOrderStatus,
  getSelectedWalletPath,
  getWalletUtxos,
  useSliceSelector as useLixiSliceSelector,
  WalletContext
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { Alert, Button, Snackbar, Stack, Typography } from '@mui/material';
import { fromHex, Script, shaRmd160 } from 'ecash-lib';
import _ from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useContext, useState } from 'react';

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

const OrderDetail = () => {
  const search = useSearchParams();
  const id = search!.get('id');
  const [error, setError] = useState(false);
  const [escrow, setEscrow] = useState(false);
  const [release, setRelease] = useState(false);
  const [cancel, setCancel] = useState(false);
  const { useEscrowOrderQuery, useUpdateEscrowOrderStatusMutation } = escrowOrderApi;
  const { isLoading, currentData, isError } = useEscrowOrderQuery({ id: id! });
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const walletUtxos = useLixiSliceSelector(getWalletUtxos);
  const [updateOrderTrigger] = useUpdateEscrowOrderStatusMutation();
  const Wallet = useContext(WalletContext);
  const { chronik } = Wallet;

  const updateOrderStatus = async (status: EscrowOrderStatus) => {
    await updateOrderTrigger({ orderId: id!, status })
      .unwrap()
      .catch(() => setError(true));
  };

  const handleSellerDepositEscrow = async (status: EscrowOrderStatus) => {
    try {
      const sellerSk = fromHex(selectedWalletPath.privateKey!);
      const sellerPk = fromHex(selectedWalletPath.publicKey!);
      const script = Buffer.from(currentData?.escrowOrder.escrowScript as string, 'hex');

      const escrowScript = new Script(script);

      const txBuild = sellerBuildDepositTx(walletUtxos, sellerSk, sellerPk, 2000, escrowScript);

      const txid = (await chronik.broadcastTx(txBuild)).txid;

      // update order status to escrow
      await updateOrderTrigger({ orderId: id!, status, txid })
        .unwrap()
        .catch(() => setError(true));

      // show snackbar
      setEscrow(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSellerReleaseEscrow = async (status: EscrowOrderStatus) => {
    try {
      const sellerSk = fromHex(selectedWalletPath.privateKey!);
      const sellerPk = fromHex(selectedWalletPath.publicKey!);
      const escrowTxid = currentData?.escrowOrder.escrowTxid as string;
      const buyerPk = fromHex(currentData?.escrowOrder.buyerAccount.publicKey as string);
      const buyerPkh = shaRmd160(buyerPk);
      const buyerP2pkh = Script.p2pkh(buyerPkh);
      const nonce = currentData?.escrowOrder.nonce as string;
      const script = Buffer.from(currentData?.escrowOrder.escrowScript as string, 'hex');

      const escrowScript = new Script(script);
      const sellerSignatory = SellerReleaseSignatory(sellerSk, sellerPk, buyerPk, nonce);

      const txBuild = BuildReleaseTx(escrowTxid, 2000, escrowScript, sellerSignatory, buyerP2pkh);

      const txid = (await chronik.broadcastTx(txBuild)).txid;
      console.log(`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${txid}`);

      // update order status to escrow
      await updateOrderTrigger({ orderId: id!, status, txid })
        .unwrap()
        .catch(() => setError(true));

      // show snackbar
      setRelease(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleBuyerReturnEscrow = async (status: EscrowOrderStatus) => {
    try {
      const buyerSk = fromHex(selectedWalletPath.privateKey!);
      const buyerPk = fromHex(selectedWalletPath.publicKey!);
      const escrowTxid = currentData?.escrowOrder.escrowTxid as string;
      const sellerPk = fromHex(currentData?.escrowOrder.sellerAccount.publicKey as string);
      const sellerPkh = shaRmd160(sellerPk);
      const sellerP2pkh = Script.p2pkh(sellerPkh);
      const nonce = currentData?.escrowOrder.nonce as string;
      const script = Buffer.from(currentData?.escrowOrder.escrowScript as string, 'hex');

      const escrowScript = new Script(script);
      const buyerSignatory = BuyerReturnSignatory(buyerSk, buyerPk, sellerPk, nonce);

      const txBuild = BuildReleaseTx(escrowTxid, 2000, escrowScript, buyerSignatory, sellerP2pkh);

      const txid = (await chronik.broadcastTx(txBuild)).txid;
      console.log(`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${txid}`);

      // update order status to escrow
      await updateOrderTrigger({ orderId: id!, status, txid })
        .unwrap()
        .catch(() => setError(true));

      // show snackbar
      setRelease(true);
    } catch (e) {
      console.log(e);
    }
  };

  const escrowStatus = () => {
    const isSeller = selectedWalletPath.hash160 === currentData?.escrowOrder.sellerAccount.hash160;

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
    const isSeller = selectedWalletPath.hash160 === currentData?.escrowOrder.sellerAccount.hash160;
    const isArbiOrMod =
      selectedWalletPath.hash160 === currentData?.escrowOrder.arbitratorAccount.hash160 ||
      selectedWalletPath.hash160 === currentData?.escrowOrder.moderatorAccount.hash160;

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Pending) {
      return isSeller ? (
        <div className="group-button-wrap">
          <Button color="warning" variant="contained" onClick={() => updateOrderStatus(EscrowOrderStatus.Cancel)}>
            Cancel
          </Button>
          <Button color="primary" variant="contained" onClick={() => updateOrderStatus(EscrowOrderStatus.Active)}>
            Accept
          </Button>
        </div>
      ) : (
        <Button
          color="warning"
          variant="contained"
          fullWidth
          onClick={() => updateOrderStatus(EscrowOrderStatus.Cancel)}
        >
          Cancel
        </Button>
      );
    }

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Active) {
      return isSeller ? (
        <div className="group-button-wrap">
          <Button color="warning" variant="contained" onClick={() => updateOrderStatus(EscrowOrderStatus.Cancel)}>
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
        >
          Cancel
        </Button>
      );
    }

    if (currentData?.escrowOrder.status === EscrowOrderStatus.Escrow) {
      return isSeller ? (
        <div className="group-button-wrap">
          <Button color="warning" variant="contained">
            Dispute
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => handleSellerReleaseEscrow(EscrowOrderStatus.Complete)}
          >
            Release
          </Button>
        </div>
      ) : (
        <div className="group-button-wrap">
          <Button color="warning" variant="contained">
            Dispute
          </Button>
          <Button color="success" variant="contained" onClick={() => handleBuyerReturnEscrow(EscrowOrderStatus.Cancel)}>
            Cancel
          </Button>
        </div>
      );
    }
  };

  if (_.isEmpty(id) || _.isNil(id) || isError) {
    return <div>Invalid order id</div>;
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <OrderDetailPage>
      <TickerHeader title="Order detail" />

      <OrderDetailContent>
        <OrderDetailInfo />
        <br />
        {escrowStatus()}
        <br />
        {escrowActionButtons()}
        <hr />
        <TelegramButton />
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
            <a
              href={`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${currentData?.escrowOrder.escrowTxid}`}
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
            Order cancelled successfully
            <br />
            <a
              href={`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${currentData?.escrowOrder.cancelTxid}`}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
          </Alert>
        </Snackbar>
      </Stack>
    </OrderDetailPage>
  );
};

export default OrderDetail;
