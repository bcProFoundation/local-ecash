'use client';
import TickerHeader from '@/src/components/TickerHeader/TickerHeader';
import {
  ArbiReleaseSignatory,
  ArbiReturnSignatory,
  BuildReleaseTx,
  ModReleaseSignatory,
  ModReturnSignatory
} from '@/src/store/escrow';
import { COIN, coinInfo } from '@bcpros/lixi-models';
import {
  DisputeStatus,
  EscrowOrderStatus,
  WalletContextNode,
  convertHashToEcashAddress,
  disputeApi,
  escrowOrderApi,
  getSelectedWalletPath,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { ChevronLeft } from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { Script, fromHex, shaRmd160 } from 'ecash-lib';
import _ from 'lodash';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useContext, useState } from 'react';

const DisputeDetailInfoWrap = styled.div`
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

  .amount-escrowed {
    color: #66bb6a;
  }

  .amount-seller {
    color: #29b6f6;
  }

  .amount-buyer {
    color: #f44336;
  }
`;

const ResolveDisputeWrap = styled.div`
  padding: 16px;

  .group-btn-chat {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    border-top: 1px dashed gray;
    padding-top: 8px;
    margin-top: 16px;

    .chat-btn {
      width: fit-content;
      justify-content: flex-start;
      text-transform: none;
      gap: 8px;
      padding: 8px 0;
      font-weight: 600;
    }
  }
`;

const StyledReleaseDialog = styled(Dialog)`
  .MuiPaper-root {
    background-image: url('/bg-dialog.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }

  .MuiIconButton-root {
    width: fit-content;
    svg {
      font-size: 32px;
    }
  }

  .MuiDialogTitle-root {
    padding: 0 16px;
    padding-top: 16px;
    font-size: 26px;
    text-align: center;
  }

  .MuiDialogContent-root {
    padding: 0;
  }

  .back-btn {
    padding: 0;
    position: absolute;
    left: 8px;
    top: 20px;
    // border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;

    svg {
      font-size: 32px;
    }
  }
`;

const ReleaseDisputeWrap = styled.div`
  padding: 16px;

  .seller-release,
  .buyer-release {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;

    button {
      color: white;
      text-transform: none;
    }

    .disclaim-buyer {
      color: #29b6f6;
    }

    .disclaim-seller {
      color: #f44336;
    }
  }
`;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MyOffer() {
  const search = useSearchParams();
  const id = search!.get('id');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [release, setRelease] = useState(false);
  const [cancel, setCancel] = useState(false);
  const { useDisputeQuery } = disputeApi;
  const { useEscrowOrderQuery, useUpdateEscrowOrderStatusMutation } = escrowOrderApi;
  const { isLoading, currentData: disputeQueryData, isError } = useDisputeQuery({ id: id! });
  const { currentData: escrowOrderQueryData } = useEscrowOrderQuery(
    { id: disputeQueryData?.dispute.escrowOrder.id },
    { skip: !disputeQueryData?.dispute.escrowOrder.id }
  );
  const { escrowOrder } = { ...escrowOrderQueryData };
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const [openReleaseModal, setOpenReleaseModal] = useState<boolean>(false);
  const Wallet = useContext(WalletContextNode);
  const [updateOrderTrigger] = useUpdateEscrowOrderStatusMutation();
  const { chronik } = Wallet;

  const handleArbiModReleaseEscrow = async () => {
    setLoading(true);

    const id = disputeQueryData?.dispute.escrowOrder.id;
    const status = EscrowOrderStatus.Complete;
    const isArbi = selectedWalletPath.hash160 === escrowOrder.arbitratorAccount.hash160;
    const escrowTxids = escrowOrder?.escrowTxids;
    const buyerPk = fromHex(escrowOrder.buyerAccount.publicKey as string);
    const buyerPkh = shaRmd160(buyerPk);
    const buyerP2pkh = Script.p2pkh(buyerPkh);
    const nonce = escrowOrder.nonce as string;
    const script = Buffer.from(escrowOrder.escrowScript as string, 'hex');
    const escrowScript = new Script(script);

    if (isArbi) {
      try {
        const { amount } = escrowOrder;
        const arbiSK = fromHex(selectedWalletPath.privateKey!);
        const arbiPk = fromHex(selectedWalletPath.publicKey!);

        const arbiSignatory = ArbiReleaseSignatory(arbiSK, arbiPk, buyerPk, nonce);

        const txBuild = BuildReleaseTx(escrowTxids, amount, escrowScript, arbiSignatory, buyerP2pkh);

        const txid = (await chronik.broadcastTx(txBuild)).txid;

        // update order status to escrow
        await updateOrderTrigger({ input: { orderId: id, status, txid } })
          .unwrap()
          .catch(() => setError(true));

        // show snackbar
        setRelease(true);
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const { amount } = escrowOrder;
        const modSk = fromHex(selectedWalletPath.privateKey!);
        const modPk = fromHex(selectedWalletPath.publicKey!);

        const escrowScript = new Script(script);
        const modSignatory = ModReleaseSignatory(modSk, modPk, buyerPk, nonce);

        const txBuild = BuildReleaseTx(escrowTxids, amount, escrowScript, modSignatory, buyerP2pkh);

        const txid = (await chronik.broadcastTx(txBuild)).txid;

        // update order status to escrow
        await updateOrderTrigger({ input: { orderId: id, status, txid } })
          .unwrap()
          .catch(() => setError(true));

        // show snackbar
        setRelease(true);
      } catch (e) {
        console.log(e);
      }
    }

    setLoading(false);
  };

  const handleArbiModReturnEscrow = async () => {
    setLoading(true);

    const id = disputeQueryData?.dispute.escrowOrder.id;
    const status = EscrowOrderStatus.Complete;
    const isArbi = selectedWalletPath.hash160 === escrowOrder.arbitratorAccount.hash160;
    const escrowTxids = escrowOrder?.escrowTxids;
    const sellerPk = fromHex(escrowOrder.sellerAccount.publicKey as string);
    const sellerPkh = shaRmd160(sellerPk);
    const sellerP2pkh = Script.p2pkh(sellerPkh);
    const nonce = escrowOrder.nonce as string;
    const script = Buffer.from(escrowOrder.escrowScript as string, 'hex');
    const escrowScript = new Script(script);

    if (isArbi) {
      try {
        const { amount } = escrowOrder;
        const arbiSK = fromHex(selectedWalletPath.privateKey!);
        const arbiPk = fromHex(selectedWalletPath.publicKey!);

        const arbiSignatory = ArbiReturnSignatory(arbiSK, arbiPk, sellerPk, nonce);

        const txBuild = BuildReleaseTx(escrowTxids, amount, escrowScript, arbiSignatory, sellerP2pkh);

        const txid = (await chronik.broadcastTx(txBuild)).txid;

        // update order status to escrow
        await updateOrderTrigger({ input: { orderId: id, status, txid } })
          .unwrap()
          .catch(() => setError(true));

        // show snackbar
        setCancel(true);
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const { amount } = escrowOrder;
        const modSk = fromHex(selectedWalletPath.privateKey!);
        const modPk = fromHex(selectedWalletPath.publicKey!);

        const escrowScript = new Script(script);
        const modSignatory = ModReturnSignatory(modSk, modPk, sellerPk, nonce);

        const txBuild = BuildReleaseTx(escrowTxids, amount, escrowScript, modSignatory, sellerP2pkh);

        const txid = (await chronik.broadcastTx(txBuild)).txid;

        // update order status to escrow
        await updateOrderTrigger({ input: { orderId: id, status, txid } })
          .unwrap()
          .catch(() => setError(true));

        // show snackbar
        setCancel(true);
      } catch (e) {
        console.log(e);
      }
    }

    setOpenReleaseModal(false);
    setLoading(false);
  };

  if (
    escrowOrder?.arbitratorAccount.hash160 !== selectedWalletPath.hash160 &&
    escrowOrder?.moderatorAccount.hash160 !== selectedWalletPath.hash160
  ) {
    return <div>Not allowed to view this dispute</div>;
  }

  if (_.isEmpty(id) || _.isNil(id) || isError) {
    return <div>Invalid dispute id</div>;
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <React.Fragment>
      <TickerHeader title="Order detail" />
      <ResolveDisputeWrap>
        <DisputeDetailInfoWrap>
          <Typography variant="body1">
            <span className="prefix">Dispute by: </span>
            {disputeQueryData?.dispute.createdBy === escrowOrder.sellerAccount.publicKey ? 'Seller' : 'Buyer'}
          </Typography>
          <Typography variant="body1">
            <span className="prefix">Order Id: </span>
            {escrowOrder?.id}
          </Typography>
          <Typography variant="body1">
            <span className="prefix">Created At: </span>
            {new Date(escrowOrder?.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            <span className="prefix">Seller: </span>
            {convertHashToEcashAddress(escrowOrder.sellerAccount.hash160)}
          </Typography>
          <Typography variant="body1">
            <span className="prefix">Buyer: </span>
            {convertHashToEcashAddress(escrowOrder.buyerAccount.hash160)}
          </Typography>
          <Typography>
            <span className="prefix">Escrow Address: </span>
            <a href={`${coinInfo[COIN.XEC].blockExplorerUrl}/address/${escrowOrder.escrowAddress}`} target="_blank">
              {escrowOrder.escrowAddress}
            </a>
          </Typography>
          <Typography variant="body1" className="amount-escrowed">
            {escrowOrder.amount} XEC escrowed!
          </Typography>
        </DisputeDetailInfoWrap>
        <div className="group-btn-chat">
          <Button className="chat-btn" color="inherit" variant="text" style={{ color: 'white' }}>
            Chat with seller
            <Image width={32} height={32} alt="" src={'/ico-telegram.svg'} />
          </Button>
          <Button className="chat-btn" color="inherit" variant="text" style={{ color: 'white' }}>
            Chat with buyer
            <Image width={32} height={32} alt="" src={'/ico-telegram.svg'} />
          </Button>
        </div>
      </ResolveDisputeWrap>
      <Button
        className="resolve-btn"
        color="info"
        variant="contained"
        fullWidth
        onClick={() => setOpenReleaseModal(true)}
        disabled={escrowOrder?.dispute.status === DisputeStatus.Resolved}
      >
        {escrowOrder?.dispute.status === DisputeStatus.Resolved ? 'The dispute has been resolved' : 'Resolve'}
      </Button>

      <StyledReleaseDialog
        fullScreen={fullScreen}
        open={openReleaseModal}
        onClose={() => setOpenReleaseModal(false)}
        TransitionComponent={Transition}
      >
        <IconButton className="back-btn" onClick={() => setOpenReleaseModal(false)}>
          <ChevronLeft />
        </IconButton>
        <DialogTitle>Release Dispute</DialogTitle>
        <DialogContent>
          <ReleaseDisputeWrap>
            <div className="seller-release">
              <Typography textAlign="center" variant="body1">
                Are you sure you want to release {escrowOrder?.amount} XEC to Seller
              </Typography>
              {/* <TextField
                className="form-input"
                id="input-seller"
                label="Type seller Telegram username to release 20M XEC to @seller1"
                defaultValue="ericson"
                // helperText="helper text here."
                variant="standard"
              /> */}
              <Button
                variant="contained"
                color="info"
                onClick={() => handleArbiModReturnEscrow()}
                autoFocus
                disabled={loading}
              >
                Return to Seller
              </Button>
              {/* <Typography className="disclaim-seller" textAlign="center" variant="body2">
                Collect 200k XEC dispute fees from buyer
              </Typography> */}
            </div>
            <hr />
            <div className="buyer-release">
              <Typography textAlign="center" variant="body1">
                Are you sure you want to release {escrowOrder?.amount} XEC to Buyer
              </Typography>
              {/* <TextField
                className="form-input"
                id="input-buyer"
                label="Type buyer Telegram username to release 20M XEC to @buyer1"
                defaultValue="nghiacc"
                // helperText="helper text here."
                variant="standard"
              /> */}
              <Button
                variant="contained"
                color="error"
                onClick={() => handleArbiModReleaseEscrow()}
                autoFocus
                disabled={loading}
              >
                Release to Buyer
              </Button>
              {/* <Typography className="disclaim-buyer" textAlign="center" variant="body2">
                Collect 200k XEC dispute fees from seller
              </Typography> */}
            </div>
          </ReleaseDisputeWrap>
        </DialogContent>
      </StyledReleaseDialog>

      <Stack zIndex={999}>
        <Snackbar open={error} autoHideDuration={3500} onClose={() => setError(false)}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Order&apos;s status update failed
          </Alert>
        </Snackbar>

        <Snackbar open={release} autoHideDuration={3500} onClose={() => setRelease(false)}>
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            Order released successfully
            <br />
            <a
              href={`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${escrowOrder?.releaseTxid}`}
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
              href={`${coinInfo[COIN.XEC].blockExplorerUrl}/tx/${escrowOrder?.returnTxid}`}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
          </Alert>
        </Snackbar>
      </Stack>
    </React.Fragment>
  );
}
