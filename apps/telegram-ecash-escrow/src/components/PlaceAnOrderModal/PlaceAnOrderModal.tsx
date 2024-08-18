'use client';

import { Escrow } from '@/src/store/escrow';
import { CreateEscrowOrderInput } from '@bcpros/lixi-models';
import {
  convertEscrowScriptHashToEcashAddress,
  convertHashToEcashAddress,
  escrowOrderApi,
  getSelectedWalletPath,
  Post,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { ChevronLeft } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Slide,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { fromHex, shaRmd160 } from 'ecash-lib';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

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
  const { post }: { post: Post } = props;
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const { useCreateEscrowOrderMutation, useGetModeratorAccountQuery, useGetRandomArbitratorAccountQuery } =
    escrowOrderApi;
  const [createOrderTrigger] = useCreateEscrowOrderMutation();
  const { currentData: moderatorCurrentData } = useGetModeratorAccountQuery();
  const { currentData: arbitratorCurrentData } = useGetRandomArbitratorAccountQuery();
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>();
  const {
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    control
  } = useForm();

  const handleCreateEscrowOrder = async data => {
    if (!paymentMethodId) {
      setError('paymentMethod', { message: 'Payment method is required!' });

      return;
    }

    const { amount, message }: { amount: string; message: string } = data;
    const sellerId = post.accountId;
    const moderatorId = moderatorCurrentData.getModeratorAccount.id;
    const arbitratorId = arbitratorCurrentData.getRandomArbitratorAccount.id;

    const sellerPk = fromHex(post.account.publicKey);
    const buyerPk = fromHex(selectedWalletPath.publicKey);
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
        message: message
      };

      const result = await createOrderTrigger({ input: data }).unwrap();
      router.push(`/order-detail?id=${result.createEscrowOrder.id}`);
    } catch (e) {
      console.log(e);
    }
  };

  return (
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
        <span>{`By: ${post.account.name} • posted on: ${new Date(post.createdAt).toLocaleString()}`}</span>
      </Typography>
      {moderatorCurrentData?.getModeratorAccount && arbitratorCurrentData?.getRandomArbitratorAccount && (
        <Typography className="offer-info" variant="body2">
          <span>Moderator: {moderatorCurrentData?.getModeratorAccount.name}</span>
          <br />
          <span>{convertHashToEcashAddress(moderatorCurrentData?.getModeratorAccount.hash160)}</span>
        </Typography>
      )}
      {arbitratorCurrentData?.getRandomArbitratorAccount && (
        <Typography className="offer-info" variant="body2">
          <span>Arbitrator: {arbitratorCurrentData?.getRandomArbitratorAccount.name}</span>
          <br />
          <span>{convertHashToEcashAddress(arbitratorCurrentData?.getRandomArbitratorAccount.hash160)}</span>
        </Typography>
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
                    if (parseFloat(value) < 0) return 'XEC amount must be greater than 0!';

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
                    placeholder={post.offer.orderLimitMin + ' - ' + post.offer.orderLimitMax}
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
            {post.offer.paymentMethods.map(item => {
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
            {errors.paymentMethod && <Typography color="error">{errors?.paymentMethod?.message as string}</Typography>}
          </RadioGroup>
          {/* <div className="disclaim-wrap">
            <Typography className="lable" variant="body2">
              Disclaim
            </Typography>

            <Typography className="title" variant="body2">
              Some seller may require dispute fees to accept your order.
            </Typography>
            <FormControlLabel control={<Checkbox defaultChecked />} label="I want to deposit dispute fees (1%)." />

            <div className="deposit-wrap">
              <div className="deposit-info">
                <Typography variant="body2">Deposit address</Typography>
                <Typography className="deposit-status" variant="body2">
                  200k XEC deposited
                </Typography>
              </div>

              <div className="address-code">
                <IconButton className="qr-code">
                  <QrCode2Outlined />
                </IconButton>
              </div>

              <div className="address-string">
                <span>c7c9pm2d3ktwzct....</span>
                <IconButton>
                  <ContentCopy />
                </IconButton>
              </div>
            </div>
          </div> */}
        </PlaceAnOrderWrap>
      </DialogContent>
      <DialogActions>
        <Button
          className="confirm-btn"
          color="info"
          variant="contained"
          onClick={handleSubmit(handleCreateEscrowOrder)}
          autoFocus
        >
          Create
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PlaceAnOrderModal;
