'use client';

import { UtxoContext } from '@/src/store/context/utxoProvider';
import { withdrawFund } from '@/src/store/escrow';
import { COIN } from '@bcpros/lixi-models';
import {
  boostApi,
  BoostForType,
  BoostType,
  closeModal,
  CreateBoostInput,
  getSelectedWalletPath,
  PostQueryItem,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Portal,
  Slide,
  Typography,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { fromHex, toHex } from 'ecash-lib';
import cashaddr from 'ecashaddrjs';
import React, { useContext, useState } from 'react';
import CustomToast from '../Toast/CustomToast';

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    background-image: url('/bg-dialog.svg');
    background-repeat: no-repeat;
    background-size: cover;
    width: 500px;
    box-sizing: border-box;
    padding: 16px;
    margin: 0;
    @media (max-width: 576px) {
      width: 100%;
    }
  }

  .MuiDialogTitle-root {
    padding: 0 16px;
    padding-top: 16px;
    font-size: 26px;
    text-align: center;
  }

  .MuiFormControl-root {
    margin-top: 5px;
  }

  .MuiDialogContent-root {
    padding: 0;
  }

  .create-boost-btn {
    color: #fff;
    text-transform: none;
  }
`;

interface BoostModalProps {
  amount: number;
  post: PostQueryItem;
  classStyle?: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BoostModal: React.FC<BoostModalProps> = ({ amount, post }: BoostModalProps) => {
  const { totalValidAmount, totalValidUtxos } = useContext(UtxoContext);

  const dispatch = useLixiSliceDispatch();
  const selectedWallet = useLixiSliceSelector(getSelectedWalletPath);
  const theme = useTheme();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boostSuccess, setBoostSuccess] = useState(false);

  const { useCreateBoostMutation } = boostApi;
  const [createBoostTrigger] = useCreateBoostMutation();

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleCreateBoost = async () => {
    setLoading(true);
    const myPk = fromHex(selectedWallet?.publicKey);
    const mySk = fromHex(selectedWallet?.privateKey);
    const GNCAddress = process.env.NEXT_PUBLIC_ADDRESS_GNC;
    const { hash: hashXEC } = cashaddr.decode(GNCAddress, false);
    const GNCHash = Buffer.from(hashXEC).toString('hex');

    const txBuild = withdrawFund(totalValidUtxos, mySk, myPk, GNCHash, amount, undefined, 0);

    //create boost
    const createBoostInput: CreateBoostInput = {
      boostedBy: selectedWallet?.hash160,
      boostedValue: amount,
      boostForId: post?.id || '',
      boostForType: BoostForType.Post,
      boostType: BoostType.Up,
      txHex: toHex(txBuild)
    };
    await createBoostTrigger({ data: createBoostInput })
      .then(() => {
        setBoostSuccess(true);
        setLoading(false);
        handleCloseModal();
      })
      .catch(() => setError(true));
  };

  return (
    <StyledDialog open={true} onClose={() => handleCloseModal()} TransitionComponent={Transition}>
      <DialogTitle>Boost Modal</DialogTitle>
      <DialogContent>
        <Typography>
          Total boost of offer: {post.boostScore.boostScore} {COIN.XEC}
        </Typography>
        <Typography>*You will boost {amount} XEC</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          className="create-boost-btn"
          color="info"
          variant="contained"
          onClick={() => handleCreateBoost()}
          disabled={loading}
        >
          Boost
        </Button>
      </DialogActions>
      <Portal>
        <CustomToast
          isOpen={boostSuccess}
          handleClose={() => setBoostSuccess(false)}
          content="Boost offer successful"
          type="success"
        />
        <CustomToast isOpen={error} handleClose={() => setError(false)} content="Boost offer failed!" type="error" />
      </Portal>
    </StyledDialog>
  );
};

export default BoostModal;
