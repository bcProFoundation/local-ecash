'use client';

import { buyerDepositFee, Escrow, splitUtxos } from '@/src/store/escrow';
import { convertXECToSatoshi, estimatedFee } from '@/src/store/util';
import { COIN, coinInfo, CreateEscrowOrderInput } from '@bcpros/lixi-models';
import {
  convertEscrowScriptHashToEcashAddress,
  convertHashToEcashAddress,
  escrowOrderApi,
  getSelectedWalletPath,
  getWalletUtxosNode,
  parseCashAddressToPrefix,
  PostQueryItem,
  useSliceSelector as useLixiSliceSelector,
  UtxoInNode,
  UtxoInNodeInput,
  WalletContextNode
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { ChevronLeft } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Skeleton,
  Slide,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { fromHex, Script, shaRmd160 } from 'ecash-lib';
import _ from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import QRCode from '../QRcode/QRcode';
import CustomToast from '../Toast/CustomToast';

interface PlaceAnOrderModalProps {
  isOpen: boolean;
  onDissmissModal?: (value: boolean) => void;
  onConfirmClick?: () => void;
  post: any;
}

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    background-image: url('/bg-dialog.svg');
    background-repeat: no-repeat;
    background-size: cover;
    width: 500px;
    height: 100vh;
    max-height: 100%;
    margin: 0;
    @media (max-width: 576px) {
      width: 100%;
    }
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

  .MuiDialogActions-root {
    justify-content: space-evenly;

    button {
      text-transform: math-auto;
      width: 100%;

      &.confirm-btn {
        color: white;
      }
    }
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

  .offer-info {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    padding: 16px;

    &:before {
      position: absolute;
      content: '';
      width: 4px;
      height: 33px;
      background: #2bb6f6;
      border-top-right-radius: 16px;
      border-bottom-right-radius: 16px;
      filter: drop-shadow(0 0 3px #2bb6f6);
    }

    span {
      margin-left: 16px;
    }
  }
`;

const PlaceAnOrderWrap = styled.div`
  padding: 16px;

  .form-input {
    width: 100%;
  }

  .payment-method-wrap {
    display: flex;
    flex-direction: row;
    gap: 16px;
    justify-content: space-between;
    margin: 16px 0;

    .MuiFormControlLabel-root {
      .MuiTypography-root {
        font-size: 14px;
      }
    }
  }

  .disclaim-wrap {
    .lable {
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 12px;
      margin-bottom: 16px;
      color: rgba(255, 255, 255, 0.5);
    }

    .title {
      font-size: 13px;
    }

    .MuiFormControlLabel-label {
      font-size: 14px;
    }
  }

  .deposit-wrap {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin-top: 16px;

    .deposit-info {
      align-self: center;

      p {
        &::first-of-type {
          margin-bottom: 6px;
        }

        &.deposit-status {
          color: #66bb6a;
        }
      }
    }

    .address-code {
      .qr-code {
        padding: 0;
        svg {
          width: 100%;
          height: 100%;
        }
      }
    }

    .address-string {
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 2px 12px;
      text-align: center;
      grid-column-start: 1;
      grid-column-end: 4;

      button {
        svg {
          font-size: 21px;
        }
      }
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

const PlaceAnOrderModal: React.FC<PlaceAnOrderModalProps> = props => {
  const theme = useTheme();
  const router = useRouter();
  const token = sessionStorage.getItem('Authorization');
  const { post, isOpen }: { post: PostQueryItem; isOpen: boolean } = props;
  const { data } = useSession();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const Wallet = useContext(WalletContextNode);
  const { chronik } = Wallet;

  const [arbiDataError, setArbiDataError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>();
  const [totalValidAmount, setTotalValidAmount] = useState<number>(0);
  const [totalValidUtxos, setTotalValidUtxos] = useState<Array<UtxoInNode>>([]);

  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const utxos = useLixiSliceSelector(getWalletUtxosNode);

  const {
    useCreateEscrowOrderMutation,
    useGetModeratorAccountQuery,
    useGetRandomArbitratorAccountQuery,
    useFilterUtxosMutation
  } = escrowOrderApi;
  const [createOrderTrigger] = useCreateEscrowOrderMutation();
  const [filterUtxos] = useFilterUtxosMutation();

  const {
    currentData: moderatorCurrentData,
    isLoading: moderatorIsLoading,
    isError: moderatorIsError
  } = useGetModeratorAccountQuery({}, { skip: !data || !isOpen });
  const {
    currentData: arbitratorCurrentData,
    isLoading: arbitratorIsLoading,
    isError: arbitratorIsError
  } = useGetRandomArbitratorAccountQuery({}, { skip: !data || !isOpen });

  const {
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    control,
    watch
  } = useForm();

  const amountValue = watch('amount');
  const isBuyerDeposit = watch('isDepositFee');

  const handleCreateEscrowOrder = async data => {
    setLoading(true);
    if (moderatorIsError || arbitratorIsError) {
      setArbiDataError(true);
      return;
    }

    if (!paymentMethodId) {
      setError('paymentMethod', { message: 'Payment method is required!' });

      return;
    }

    const { amount, message, isDepositFee }: { amount: string; message: string; isDepositFee: boolean } = data;
    const sellerId = post.accountId;
    const moderatorId = moderatorCurrentData.getModeratorAccount.id;
    const arbitratorId = arbitratorCurrentData.getRandomArbitratorAccount.id;

    const sellerPk = fromHex(post.account.publicKey);
    const buyerPk = fromHex(selectedWalletPath?.publicKey);
    const buyerSk = fromHex(selectedWalletPath?.privateKey);
    const arbitratorPk = fromHex(arbitratorCurrentData.getRandomArbitratorAccount.publicKey);
    const moderatorPk = fromHex(moderatorCurrentData.getModeratorAccount.publicKey);

    const nonce = Math.floor(Date.now() / 1000).toString();

    try {
      const escrowScript = new Escrow({
        sellerPk,
        buyerPk,
        arbiPk: arbitratorPk,
        modPk: moderatorPk,
        nonce
      });
      const scriptSmartContract = escrowScript.script();

      //split utxos is here and broadcast. Then build tx
      let hexTxBuyerDeposit = null;
      let foundUtxo: UtxoInNodeInput;
      const depositFeeSats = convertXECToSatoshi(calDisputeFee);

      let utxosToSplit = [];
      let totalAmount = 0;
      for (let i = 0; i < totalValidUtxos.length; i++) {
        totalAmount += totalValidUtxos[i].value;
        utxosToSplit.push(totalValidUtxos[i]);
        if (totalAmount >= depositFeeSats) break;
      }

      if (isDepositFee) {
        const txBuildSplitUtxo = splitUtxos(utxosToSplit, buyerSk, buyerPk, depositFeeSats);
        const txidSplit = (await chronik.broadcastTx(txBuildSplitUtxo)).txid;

        if (txidSplit) {
          foundUtxo = {
            txid: txidSplit,
            outIdx: 0,
            value: depositFeeSats
          };
        }
        if (!foundUtxo) throw new Error('No suitable UTXO found!');

        const totalAmountEscrow =
          Number(amount) + calDisputeFee * 2 + estimatedFee(Buffer.from(scriptSmartContract.bytecode).toString('hex'));
        const scriptEscrow = new Script(scriptSmartContract.bytecode);
        hexTxBuyerDeposit = buyerDepositFee(foundUtxo, buyerSk, buyerPk, totalAmountEscrow, scriptEscrow);
      }

      const escrowAddress = convertEscrowScriptHashToEcashAddress(shaRmd160(escrowScript.script().bytecode));

      const data: CreateEscrowOrderInput = {
        amount: parseFloat(amount),
        sellerId,
        arbitratorId,
        moderatorId,
        escrowAddress,
        nonce,
        escrowScript: Buffer.from(escrowScript.script().bytecode).toString('hex'),
        price: 1000,
        paymentMethodId: paymentMethodId,
        postId: post.id,
        message: message,
        buyerDepositTx: hexTxBuyerDeposit,
        utxoInProcess: foundUtxo
      };

      const result = await createOrderTrigger({ input: data }).unwrap();
      router.push(`/order-detail?id=${result.createEscrowOrder.id}`);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const calDisputeFee = useMemo(() => {
    const fee1Percent = parseFloat((Number(amountValue || 0) / 100).toFixed(2));
    const dustXEC = coinInfo[COIN.XEC].dustSats / Math.pow(10, coinInfo[COIN.XEC].cashDecimals);
    return Math.max(fee1Percent, dustXEC);
  }, [amountValue]);

  const checkBuyerEnoughFund = () => {
    return totalValidAmount > calDisputeFee;
  };

  const InfoEscrow = () => {
    const fee1Percent = calDisputeFee;
    const totalBalanceFormat = totalValidAmount.toLocaleString('de-DE');
    return (
      <div style={{ color: 'white' }}>
        <p>
          Your wallet: {totalBalanceFormat} {COIN.XEC}
        </p>
        <p>
          Dispute fee (1%): {fee1Percent.toLocaleString('de-DE')} {COIN.XEC}
        </p>
      </div>
    );
  };

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

    token && funcFilterUtxos();
  }, [utxos, token]);

  return (
    <React.Fragment>
      <StyledDialog
        fullScreen={fullScreen}
        open={props.isOpen}
        onClose={() => props.onDissmissModal!(false)}
        TransitionComponent={Transition}
      >
        <IconButton className="back-btn" onClick={() => props.onDissmissModal!(false)}>
          <ChevronLeft />
        </IconButton>
        <DialogTitle>Place an order</DialogTitle>
        <Typography className="offer-info" variant="body2">
          <span>{`Offer Id: ${post.id}`}</span>
          <br />
          <span>{`By: ${post.account.telegramUsername} • posted on: ${new Date(post.createdAt).toLocaleString()}`}</span>
        </Typography>
        {moderatorIsLoading ? (
          <Typography className="offer-info" variant="body2">
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
          </Typography>
        ) : (
          moderatorCurrentData?.getModeratorAccount && (
            <Typography className="offer-info" variant="body2">
              <span>Moderator: {moderatorCurrentData?.getModeratorAccount.telegramUsername}</span>
              <br />
              <span>{convertHashToEcashAddress(moderatorCurrentData?.getModeratorAccount.hash160)}</span>
            </Typography>
          )
        )}

        {arbitratorIsLoading ? (
          <Typography className="offer-info" variant="body2">
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
          </Typography>
        ) : (
          arbitratorCurrentData?.getRandomArbitratorAccount && (
            <Typography className="offer-info" variant="body2">
              <span>Arbitrator: {arbitratorCurrentData?.getRandomArbitratorAccount.telegramUsername}</span>
              <br />
              <span>{convertHashToEcashAddress(arbitratorCurrentData?.getRandomArbitratorAccount.hash160)}</span>
            </Typography>
          )
        )}
        <DialogContent>
          <PlaceAnOrderWrap>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="amount"
                  control={control}
                  defaultValue={''}
                  rules={{
                    required: {
                      value: true,
                      message: 'XEC amount is required!'
                    },
                    pattern: {
                      value: /^-?[0-9]\d*\.?\d*$/,
                      message: 'XEC amount is invalid!'
                    },
                    validate: value => {
                      const numberValue = parseFloat(value);
                      const minValue = post.postOffer.orderLimitMin;
                      const maxValue = post.postOffer.orderLimitMax;
                      if (numberValue < 0) return 'XEC amount must be greater than 0!';
                      if (numberValue < minValue || numberValue > maxValue)
                        return `XEC amount must between ${minValue}-${maxValue}`;

                      return true;
                    }
                  }}
                  render={({ field: { onChange, onBlur, value, name, ref } }) => (
                    <TextField
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      name={name}
                      inputRef={ref}
                      placeholder={post.postOffer.orderLimitMin + ' - ' + post.postOffer.orderLimitMax}
                      className="form-input"
                      id="amount"
                      label="Amount"
                      variant="outlined"
                      error={errors.amount ? true : false}
                      helperText={errors.amount && (errors.amount?.message as string)}
                      InputProps={{
                        endAdornment: <Typography variant="subtitle1">XEC</Typography>
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="message"
                  control={control}
                  defaultValue={''}
                  rules={{
                    validate: value => {
                      return _.isEmpty(value) ? 'Should include a message' : true;
                    }
                  }}
                  render={({ field: { onChange, onBlur, value, name, ref } }) => (
                    <TextField
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      name={name}
                      inputRef={ref}
                      className="form-input"
                      id="message"
                      label="Message"
                      variant="outlined"
                      error={errors.message ? true : false}
                      helperText={
                        errors.message
                          ? (errors.message?.message as string)
                          : `* Escrow's order has message has higher acceptance rate`
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
            <RadioGroup className="payment-method-wrap" name="payment-method-groups" defaultValue="cash-in-person">
              {post.postOffer.paymentMethods.map(item => {
                return (
                  <FormControlLabel
                    onClick={() => {
                      clearErrors('paymentMethod');
                      setPaymentMethodId(item.paymentMethod.id);
                    }}
                    key={item.paymentMethod.name}
                    value={item.paymentMethod.name}
                    checked={paymentMethodId === item.paymentMethod.id}
                    control={<Radio />}
                    label={item.paymentMethod.name}
                  />
                );
              })}
              {errors.paymentMethod && (
                <Typography color="error">{errors?.paymentMethod?.message as string}</Typography>
              )}
            </RadioGroup>
            <div className="disclaim-wrap">
              <Typography className="title" variant="body2">
                *Some seller may require dispute fees to accept your order.
              </Typography>
              <Controller
                name="isDepositFee"
                control={control}
                defaultValue={false}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <FormControlLabel
                    control={<Checkbox onChange={onChange} onBlur={onBlur} checked={value} inputRef={ref} />}
                    label={`I want to deposit dispute fees (1%): ${calDisputeFee} XEC`}
                  />
                )}
              />
              {isBuyerDeposit && (
                <div>
                  {InfoEscrow()}
                  {!checkBuyerEnoughFund() && (
                    <QRCode
                      address={parseCashAddressToPrefix(COIN.XEC, selectedWalletPath?.cashAddress)}
                      amount={calDisputeFee}
                      width="60%"
                    />
                  )}
                </div>
              )}
            </div>
          </PlaceAnOrderWrap>
        </DialogContent>
        <DialogActions>
          <Button
            className="confirm-btn"
            color="info"
            variant="contained"
            onClick={handleSubmit(handleCreateEscrowOrder)}
            autoFocus
            disabled={(isBuyerDeposit && !checkBuyerEnoughFund()) || loading}
          >
            Create
          </Button>
        </DialogActions>
      </StyledDialog>
      <CustomToast
        isOpen={arbiDataError}
        content="Can't get arbi/mod data"
        handleClose={() => setArbiDataError(false)}
        type="error"
        autoHideDuration={3500}
      />
    </React.Fragment>
  );
};

export default PlaceAnOrderModal;
