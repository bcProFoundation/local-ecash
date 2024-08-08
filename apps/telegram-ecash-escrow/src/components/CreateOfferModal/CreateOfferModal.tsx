'use client';

import {
  Coin,
  CreateOfferInput,
  OfferType,
  getAllPaymentMethods,
  getPaymenMethods,
  offerApi,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
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
  Grid,
  IconButton,
  Slide,
  TextField,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    background-image: url('/bg-dialog.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }

  .back-btn {
    padding: 0;
    position: absolute;
    left: 8px;
    top: 20px;
    border-radius: 12px;

    svg {
      font-size: 32px;
    }
  }

  .MuiTypography-root {
    text-align: center;
  }

  .order-limit-label {
    margin: 15px 0 -20px 0;
  }

  .payment-method {
    .title-payment-method {
      margin: 10px 0 0;
      font-size: 20px;
    }
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
`;

interface CreateOfferModalProps {
  isOpen: boolean;
  onDissmissModal: (value: boolean) => void;
  onConfirmClick?: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateOfferModal: React.FC<CreateOfferModalProps> = (props) => {
  const { isOpen, onConfirmClick, onDissmissModal } = props;
  const dispatch = useLixiSliceDispatch();
  const { useCreateOfferMutation } = offerApi;
  const [createOfferTrigger] = useCreateOfferMutation();
  const {
    handleSubmit,
    getValues,
    control,
    clearErrors,
    setError,
    reset,
    formState: { errors }
  } = useForm();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const paymenthods = useLixiSliceSelector(getAllPaymentMethods);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([1]);

  const handleCreateOffer = async (data) => {
    const minNum = parseFloat(data.orderLimitMin);
    const maxNum = parseFloat(data.orderLimitMax);
    if (minNum >= maxNum) return;

    const inputCreateOffer: CreateOfferInput = {
      message: data.message,
      price: data.price,
      orderLimitMin: minNum,
      orderLimitMax: maxNum,
      paymentMethodIds: selectedOptions,
      publicKey: 'public key',
      coin: Coin.Xec,
      type: OfferType.Sell
    };
    const offerCreated = await createOfferTrigger({ input: inputCreateOffer }).unwrap();
    //reset field
    if (offerCreated) {
      reset();
      setSelectedOptions([1]);
      onDissmissModal(false);
    }
  };

  const handleChangeCheckBox = (e, value) => {
    const checked = e?.target?.checked;
    // if choose goods/service (5), drop all other options
    if (checked) {
      if (value === 5) {
        setSelectedOptions([value]);
      } else {
        let currentSelected = selectedOptions;
        // if choose other option, drop option 5
        if (currentSelected.includes(5)) currentSelected = currentSelected.filter((item) => item !== 5);
        setSelectedOptions([...currentSelected, value]);
      }
    } else {
      setSelectedOptions((pre) => (pre.length === 1 ? [1] : pre.filter((item) => item !== value))); //default choose 1
    }
  };

  const validateLimits = () => {
    const minValue = parseFloat(getValues('orderLimitMin'));
    const maxValue = parseFloat(getValues('orderLimitMax'));
    if (minValue >= maxValue) {
      setError('orderLimitMax', {
        type: 'manual',
        message: 'Max need to greater min'
      });
    } else {
      clearErrors('orderLimitMax');
    }
  };
  console.log(errors);

  const TextFieldController = (name, control, label, type = 'text', placeholder = '', checkValidLimit = false) => {
    return (
      <Controller
        name={name}
        control={control}
        rules={{
          required: { message: 'This field not empty', value: true }
        }}
        render={({ field: { onChange, value }, fieldState: { error }, formState }) => (
          <TextField
            key={name}
            helperText={error ? error.message : null}
            size="small"
            error={!!error}
            onChange={(e) => {
              onChange(e);
              console.log('on change');
              checkValidLimit && validateLimits();
            }}
            value={value}
            fullWidth
            label={label}
            type={type}
            placeholder={placeholder}
            variant="standard"
          />
        )}
      />
    );
  };

  const CheckBoxUI = (id, name) => {
    const numId = Number(id);
    return (
      <Controller
        name={`checkbox${numId}`}
        key={id}
        control={control}
        render={({ field }) => {
          return (
            <div className="checkbox-money">
              <Checkbox
                key={id}
                value={numId}
                checked={selectedOptions.includes(numId) || (numId === 1 && selectedOptions.length === 0)} //auto check option 1
                onChange={(e) => handleChangeCheckBox(e, numId)}
              />
              {name}
            </div>
          );
        }}
      />
    );
  };

  //auto call paymentMethods
  useEffect(() => {
    if (paymenthods.length === 0) dispatch(getPaymenMethods());
  }, [paymenthods.length]);

  return (
    <StyledDialog
      fullScreen={fullScreen}
      open={isOpen}
      onClose={() => onDissmissModal(false)}
      TransitionComponent={Transition}
    >
      <IconButton className="back-btn" onClick={() => onDissmissModal(false)}>
        <ChevronLeft />
      </IconButton>
      <DialogTitle>Create an offer</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {TextFieldController('message', control, 'Message')}
          </Grid>
          <Grid item xs={12}>
            {TextFieldController('price', control, 'Price')}
          </Grid>
          <Grid item xs={6}>
            {TextFieldController('orderLimitMin', control, 'Order Min', 'number', 'Order limit min', true)}
          </Grid>
          <Grid item xs={6}>
            {TextFieldController('orderLimitMax', control, 'Order Max', 'number', 'Order limit max', true)}
          </Grid>
          <Grid item xs={12} className="payment-method">
            <p className="title-payment-method">Payment Method</p>
            {paymenthods.map((item) => CheckBoxUI(item.id, item.name))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          className="confirm-btn"
          color="info"
          variant="contained"
          onClick={() => {
            if (!errors) handleSubmit(handleCreateOffer);
          }}
          autoFocus
        >
          Create
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default CreateOfferModal;
