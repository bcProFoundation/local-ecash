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
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Slide,
  Snackbar,
  Stack,
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
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateOfferModal: React.FC<CreateOfferModalProps> = (props) => {
  const { isOpen, onDissmissModal } = props;
  const dispatch = useLixiSliceDispatch();
  const { useCreateOfferMutation } = offerApi;
  const [createOfferTrigger] = useCreateOfferMutation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      price: '',
      message: '',
      min: '',
      max: ''
    }
  });

  const paymenthods = useLixiSliceSelector(getAllPaymentMethods);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([1]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateOffer = async (data) => {
    setLoading(true);

    const minNum = parseFloat(data.min);
    const maxNum = parseFloat(data.max);

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
    const offerCreated = await createOfferTrigger({ input: inputCreateOffer })
      .unwrap()
      .catch(() => {
        setError(true);
      });

    offerCreated && setSuccess(true);

    setLoading(false);
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

  const CheckBoxUI = (id, name) => {
    const numId = Number(id);

    return (
      <FormControlLabel
        key={id}
        label={name}
        control={
          <Checkbox
            key={id}
            value={numId}
            checked={selectedOptions.includes(numId) || (numId === 1 && selectedOptions.length === 0)} //auto check option 1
            onChange={(e) => handleChangeCheckBox(e, numId)}
          />
        }
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
            <Controller
              name="message"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Message is required!'
                }
              }}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <FormControl fullWidth={true}>
                  <TextField
                    className="form-input"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    name={name}
                    inputRef={ref}
                    id="message"
                    label="Message"
                    defaultValue="I want to buy 20M XEC in cash"
                    error={errors.message && true}
                    helperText={errors.message && (errors.message?.message as string)}
                    variant="standard"
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="price"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Price is required!'
                },
                pattern: {
                  value: /^-?[0-9]\d*\.?\d*$/,
                  message: 'Price is invalid!'
                },
                validate: (value) => {
                  if (parseFloat(value) < 0) return 'Price must be greater than 0!';

                  return true;
                }
              }}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <FormControl fullWidth={true}>
                  <TextField
                    id="payment-amount"
                    label="Price"
                    onChange={onChange}
                    color="info"
                    onBlur={onBlur}
                    value={value}
                    name={name}
                    inputRef={ref}
                    error={errors.price ? true : false}
                    helperText={errors.price && (errors.price?.message as string)}
                    variant="standard"
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="min"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Minimum is required!'
                },
                pattern: {
                  value: /^-?[0-9]\d*\.?\d*$/,
                  message: 'Minimum amount is invalid!'
                },
                validate: (value) => {
                  const max = parseFloat(watch('max'));

                  if (parseFloat(value) < 0) return 'Minimum amount must be greater than 0!';
                  if (parseFloat(value) >= max) return 'Minimum amount must be less than maximum amount!';

                  return true;
                }
              }}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <FormControl fullWidth={true}>
                  <TextField
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    type="number"
                    name={name}
                    inputRef={ref}
                    className="form-input"
                    id="min"
                    label="Order limit (USD)"
                    placeholder="Min order limit (USD)"
                    error={errors.min && true}
                    helperText={errors.min && (errors.min?.message as string)}
                    variant="standard"
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={1}>
            <h2 style={{ color: 'white' }}>to</h2>
          </Grid>
          <Grid item xs={5}>
            <Controller
              name="max"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Maximum is required!'
                },
                pattern: {
                  value: /^-?[0-9]\d*\.?\d*$/,
                  message: 'Maximum amount is invalid!'
                },
                validate: (value) => {
                  const min = parseFloat(watch('min'));

                  if (parseFloat(value) < 0) return 'Maximum amount must be greater than 0!';
                  if (parseFloat(value) <= min) return 'Maximum amount must be greater than minimum amount!';

                  return true;
                }
              }}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <FormControl fullWidth={true}>
                  <TextField
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    name={name}
                    type="number"
                    inputRef={ref}
                    className="form-input"
                    id="max"
                    label=" "
                    placeholder="Max order limit (USD)"
                    error={errors.max && true}
                    helperText={errors.max && (errors.max?.message as string)}
                    variant="standard"
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} className="payment-method">
            <p className="title-payment-method">Payment Methods</p>
            <Box sx={{ display: 'flex', margin: '16px 0' }}>
              <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {paymenthods.map((item) => CheckBoxUI(item.id, item.name))}
              </FormGroup>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          className="confirm-btn"
          color="info"
          variant="contained"
          onClick={handleSubmit(handleCreateOffer)}
          disabled={loading || success}
        >
          Create offer
        </Button>
      </DialogActions>

      <Stack zIndex={999}>
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => {
            reset();
            setSuccess(false);
            onDissmissModal(false);
            setSelectedOptions([1]);
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            Offer created successfully
          </Alert>
        </Snackbar>

        <Snackbar open={error} autoHideDuration={4000} onClose={() => setError(false)}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Create offer failed
          </Alert>
        </Snackbar>
      </Stack>
    </StyledDialog>
  );
};

export default CreateOfferModal;
