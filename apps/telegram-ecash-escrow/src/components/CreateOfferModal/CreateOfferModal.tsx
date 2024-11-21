'use client';

import { LIST_COIN } from '@/src/store/constants';
import { Country, LIST_CURRENCIES_USED, State } from '@bcpros/lixi-models';
import {
  Coin,
  CreateOfferInput,
  OfferQueryItem,
  OfferType,
  UpdateOfferInput,
  closeModal,
  getAllCountries,
  getAllPaymentMethods,
  getAllStates,
  getStates,
  offerApi,
  useSliceDispatch as useLixiSliceDispatch,
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
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  NativeSelect,
  Portal,
  Radio,
  RadioGroup,
  Slide,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import FilterListModal from '../FilterList/FilterListModal';
import CustomToast from '../Toast/CustomToast';

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

  .heading {
    font-size: 18px;
    font-weight: bold;
  }

  .bold {
    font-weight: bold;
  }

  .prefix {
    font-size: 15px;
    color: #79869b;
  }

  .label {
    color: #79869b;
  }

  .container-step2 {
    .margin-component {
      .example-value {
        margin-top: 5px;
      }
      .MuiInputBase-root {
        border-radius: 0px !important;
        .MuiInputBase-input {
          text-align: center;
        }
      }
    }
  }

  .container-step3 {
    .payment-wrap {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .payment-method,
      .payment-currency {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        button {
          text-transform: none;
          color: white;
        }
      }
    }
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

  .MuiDialogActions-root {
    justify-content: space-evenly;
    padding: 16px;
    padding-bottom: 32px;

    button {
      text-transform: math-auto;
      width: 100%;

      &.confirm-btn {
        color: white;
      }
    }
  }
`;

const PercentInputWrap = styled.div`
  margin: 16px 0;
  display: grid;
  grid-template-columns: max-content 1fr max-content;
  border-radius: 9px;
  border: 1px solid gray;
  min-height: 48px;

  .btn-minus,
  .btn-plus {
    width: 15%;
    border-radius: 0;
    boder: 0;
  }

  .btn-minus {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  .btn-plus {
    border-bottom-right-radius: 8px;
    border-top-right-radius: 8px;
  }

  input {
    height: 36px;
  }

  fieldset {
    border: 0 !important;
  }
`;

interface CreateOfferModalProps {
  offer?: OfferQueryItem;
  isEdit?: boolean;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateOfferModal: React.FC<CreateOfferModalProps> = props => {
  const { isEdit = false, offer } = props;

  const dispatch = useLixiSliceDispatch();
  const { useCreateOfferMutation, useUpdateOfferMutation } = offerApi;
  const [createOfferTrigger] = useCreateOfferMutation();
  const [updateOfferTrigger] = useUpdateOfferMutation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const paymentMethods = useLixiSliceSelector(getAllPaymentMethods);
  const countries = useLixiSliceSelector(getAllCountries);
  const states = useLixiSliceSelector(getAllStates);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = React.useState(isEdit ? 2 : 1);
  const [coinCurrency, setCoinCurrency] = useState('XEC');
  const [locationData, setLocationData] = useState(null);
  const [country, setCountry] = useState<Country | null | undefined>(null);
  const [state, setState] = useState<State | null | undefined>(null);
  const [currencyState, setCurrencyState] = useState(null);
  const [coinState, setCoinState] = useState(null);

  const [openCountryList, setOpenCountryList] = useState(false);
  const [openStateList, setOpenStateList] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      message: offer?.message ?? '',
      min: `${offer?.orderLimitMin ?? ''}`,
      max: `${offer?.orderLimitMax ?? ''}`,
      option: offer?.paymentMethods[0]?.paymentMethod.id ?? '',
      currency: null,
      coin: null,
      percentage: offer?.marginPercentage ?? 0,
      note: offer?.noteOffer ?? ''
    }
  });

  const option = Number(watch('option'));
  const percentageValue = watch('percentage');
  const currencyValue = watch('currency');
  const coinValue = watch('coin');

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleCreateOffer = async data => {
    setLoading(true);

    const minNum = parseFloat(data.min);
    const maxNum = parseFloat(data.max);
    const input = {
      message: data.message,
      noteOffer: data.note,
      paymentMethodIds: [option],
      coinPayment: data?.coin ? data.coin : null,
      localCurrency: data?.currency ? data.currency : null,
      marginPercentage: Number(data.percentage),
      orderLimitMin: minNum,
      orderLimitMax: maxNum,
      countryId: country?.id ?? null,
      stateId: state?.id ?? null
    };

    //Just have location when paymentmethods is 1 or 2
    if (option !== 1 && option !== 2) {
      input.countryId = null;
      input.stateId = null;
    }

    if (isEdit) {
      let inputUpdateOffer: UpdateOfferInput;
      //we dont choose anything, it use old value
      if (!data?.coin && !data?.currency) {
        inputUpdateOffer = {
          ...input,
          coinPayment: coinState?.ticker,
          localCurrency: currencyState?.code,
          id: offer?.postId
        };
      } else {
        inputUpdateOffer = {
          ...input,
          coinPayment: data?.coin ? data.coin : null,
          localCurrency: data?.currency?.code ? data.currency : null,
          id: offer?.postId
        };
      }
      await updateOfferTrigger({ input: inputUpdateOffer })
        .unwrap()
        .then(() => setSuccess(true))
        .catch(err => {
          setError(true);
        });
    } else {
      const inputCreateOffer: CreateOfferInput = {
        ...input,
        price: '',
        coin: Coin.Xec,
        type: OfferType.Sell
      };
      await createOfferTrigger({ input: inputCreateOffer })
        .unwrap()
        .then(() => setSuccess(true))
        .catch(err => {
          setError(true);
        });
    }
  };

  const handleIncrease = value => {
    setValue('percentage', Math.min(30, value + 1));
  };

  const handleDecrease = value => {
    setValue('percentage', Math.max(0, value - 1));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const marginComponent = (
    <Grid item xs={12}>
      <div className="margin-component">
        <Typography variant="body2" className="label">
          Offer Margin
        </Typography>
        <Controller
          name="percentage"
          control={control}
          rules={{
            validate: value => {
              if (value >= 30) return 'Margin is between 0 - 30%';
              return true;
            }
          }}
          render={({ field }) => (
            <PercentInputWrap>
              <Button variant="contained" className="btn-minus" onClick={() => handleDecrease(field.value)}>
                -
              </Button>

              <TextField
                {...field}
                type="number"
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0 }
                }}
              />
              <Button variant="contained" className="btn-plus" onClick={() => handleIncrease(field.value)}>
                +
              </Button>
            </PercentInputWrap>
          )}
        />
        {errors && errors?.percentage && (
          <FormHelperText error={true}>{errors.percentage.message as string}</FormHelperText>
        )}
        <Typography className="example-value">
          <b>Example</b>: If you sell <span className="bold">XEC</span> worth{' '}
          <span className="bold">1,000.00 {coinCurrency}</span>, you will receive{' '}
          <span className="bold">
            {(1000 * (percentageValue / 100 + 1)).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}{' '}
            {coinCurrency}{' '}
          </span>
          in return
        </Typography>
      </div>
    </Grid>
  );

  const stepContent1 = (
    <div className="container-step1">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography className="heading" variant="body2">
            *You are selling XEC
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" className="label">
            Payment method
          </Typography>
          <Controller
            name="option"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Need to choose payment-method!'
              }
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <RadioGroup value={value} onChange={onChange} onBlur={onBlur} ref={ref}>
                {paymentMethods.map(item => {
                  return (
                    <div key={item.id}>
                      <FormControlLabel
                        checked={option === item.id}
                        value={item.id}
                        control={<Radio />}
                        label={item.name}
                      />
                      {option < 4 && item.id === option && (
                        <Controller
                          name="currency"
                          control={control}
                          rules={{
                            validate: value => {
                              if (!value && !currencyState) return 'Currency is required';

                              return true;
                            }
                          }}
                          render={({ field: { onChange, onBlur, value, ref } }) => (
                            <FormControl fullWidth>
                              <InputLabel variant="outlined" htmlFor="select-currency">
                                Currency
                              </InputLabel>
                              <NativeSelect
                                id="select-currency"
                                value={value ?? ''}
                                onBlur={onBlur}
                                ref={ref}
                                onChange={e => {
                                  onChange(e);
                                  setValue('coin', null);
                                }}
                              >
                                <option aria-label="None" value="" />
                                {LIST_CURRENCIES_USED.map(item => {
                                  return (
                                    <option key={item.code} value={item.code}>
                                      {item.name} ({item.code})
                                    </option>
                                  );
                                })}
                              </NativeSelect>
                              {errors && errors?.currency && (
                                <FormHelperText error={true}>{errors.currency.message as string}</FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      )}

                      {option === 4 && item.id === option && (
                        <Controller
                          name="coin"
                          control={control}
                          rules={{
                            validate: value => {
                              if (!value && !coinState) return 'Coin is required';

                              return true;
                            }
                          }}
                          render={({ field: { onChange, onBlur, value, ref } }) => (
                            <FormControl fullWidth>
                              <InputLabel variant="outlined" htmlFor="select-coin">
                                Coin
                              </InputLabel>
                              <NativeSelect
                                id="select-coin"
                                value={value ?? ''}
                                onBlur={onBlur}
                                ref={ref}
                                onChange={e => {
                                  onChange(e);
                                  setValue('currency', null);
                                }}
                              >
                                <option aria-label="None" value="" />
                                {LIST_COIN.map(item => {
                                  return (
                                    <option key={item.ticker} value={item.ticker}>
                                      {item.name} ({item.ticker})
                                    </option>
                                  );
                                })}
                              </NativeSelect>
                              {errors && errors?.coin && (
                                <FormHelperText error={true}>{errors.coin.message as string}</FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            )}
          />
          {errors && errors?.option && <FormHelperText error={true}>{errors.option.message as string}</FormHelperText>}
        </Grid>
        {(option === 1 || option === 2) && (
          <>
            <Grid item xs={12}>
              <Typography variant="body2" className="label">
                Location
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <TextField
                  label="Country"
                  variant="outlined"
                  fullWidth
                  value={country?.name ?? ''}
                  onClick={() => setOpenCountryList(true)}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <TextField
                  label="State"
                  variant="outlined"
                  fullWidth
                  value={state?.name ?? ''}
                  onClick={() => setOpenStateList(true)}
                  disabled={!country}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );

  const stepContent2 = (
    <div className="container-step2">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="message"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Headline is required!'
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
                  label="Headline"
                  error={errors.message && true}
                  helperText={errors.message && (errors.message?.message as string)}
                  variant="standard"
                />
              </FormControl>
            )}
          />
        </Grid>
        {marginComponent}
        <Grid item xs={6}>
          <Typography variant="body2" className="label">
            {`Order limit (${coinCurrency})`}
          </Typography>

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
              validate: value => {
                const max = parseFloat(watch('max'));
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
                  placeholder={`Min (${coinCurrency})`}
                  error={errors.min && true}
                  helperText={errors.min && (errors.min?.message as string)}
                  variant="standard"
                />
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={1}>
          <Typography variant="h6" style={{ color: 'white' }}>
            to
          </Typography>
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
              validate: value => {
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
                  placeholder={`Max (${coinCurrency})`}
                  error={errors.max && true}
                  helperText={errors.max && (errors.max?.message as string)}
                  variant="standard"
                />
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="note"
            control={control}
            render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <FormControl fullWidth={true}>
                <TextField
                  className="form-input"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  name={name}
                  inputRef={ref}
                  id="note"
                  label="Offer note"
                  variant="filled"
                  multiline
                  rows={4}
                  maxRows={10}
                />
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </div>
  );

  const stepContent3 = (
    <div className="container-step3">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography className="heading" variant="body1">
            *You are selling XEC
          </Typography>
        </Grid>
        {(option === 1 || option === 2) && (
          <Grid item xs={12}>
            <Typography variant="body1">
              <span className="prefix">Location: </span>
              {[state?.name, country?.name].filter(Boolean).join(', ')}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <div className="payment-wrap">
            <div className="payment-method">
              <Typography>Payment method</Typography>
              <Button variant="contained" color="success">
                {paymentMethods[Number(option ?? '1') - 1]?.name}
              </Button>
            </div>
            <div className="payment-currency">
              <Typography>Payment currency</Typography>
              <Button variant="contained" color="warning">
                {coinCurrency}
              </Button>
            </div>
          </div>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <span className="prefix">Headline: </span> {getValues('message')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <span className="prefix">Price: </span> {percentageValue}% on top of market price
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <span className="prefix">Order limit ({coinCurrency}): </span> {getValues('min')} {coinCurrency} -{' '}
            {getValues('max')} {coinCurrency}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <span className="prefix">Offer note: </span> {getValues('note')}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );

  const stepContents = {
    stepContent1: stepContent1,
    stepContent2: stepContent2,
    stepContent3: stepContent3
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Pass the latitude and longitude to Nominatim for geocoding
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

          fetch(url)
            .then(response => response.json())
            .then(data => {
              setLocationData(data);
            })
            .catch(error => console.error('Error fetching location data:', error));
        },
        error => {
          console.error('Geolocation error:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  function cleanString(str: string): string {
    if (!str) return;
    const noPunctuation = str.replace(/[-]/g, ' ');

    const lowerStr = noPunctuation.toLowerCase();

    const cleanedStr = lowerStr.replace(/thanh pho|thành phố |city/gi, '').trim();

    return cleanedStr;
  }

  //get coin and currency from data exist
  useEffect(() => {
    if (!isEdit) return;
    const coinDetected = LIST_COIN.find(item => item.ticker === offer?.coinPayment);
    const currencyDetected = LIST_CURRENCIES_USED.find(item => item.code === offer?.localCurrency);

    setCoinState(coinDetected);
    setCurrencyState(currencyDetected);
  }, []);

  //set state when have states
  useEffect(() => {
    if (isEdit && !offer?.stateId) return;
    let nameOfState = cleanString(locationData?.address?.state ?? locationData?.address?.city);
    //process for saigon
    if (nameOfState === 'sài gòn') nameOfState = 'hồ chí minh';
    const stateIdDetected = states.findIndex(state => cleanString(state?.name) === nameOfState);
    const stateDetected = states[stateIdDetected ?? 0];
    setState(stateDetected);
  }, [states]);

  //from location set country
  useEffect(() => {
    if (isEdit && !offer?.countryId) return;
    const countryCodeDetected = locationData?.address?.country_code;
    const countryIdDetected = countries.findIndex(
      country => country?.iso2?.toLowerCase() === countryCodeDetected?.toLowerCase()
    );
    const countryDetected = countries[countryIdDetected ?? 0];
    setCountry(countryDetected);
    dispatch(getStates(countryDetected?.id ?? 0));
  }, [locationData]);

  useEffect(() => {
    if (isEdit && !offer?.countryId) return;
    getLocation();
  }, []);

  useEffect(() => {
    setCoinCurrency(currencyValue?.code ?? coinValue?.ticker ?? 'XEC');
  }, [currencyValue?.code, coinValue?.ticker]);

  return (
    <StyledDialog
      fullScreen={fullScreen}
      open={true}
      onClose={() => {
        reset();
        handleCloseModal();
      }}
      TransitionComponent={Transition}
    >
      <IconButton className="back-btn" onClick={() => handleCloseModal()}>
        <ChevronLeft />
      </IconButton>
      <DialogTitle textAlign={'center'}>
        <b>{isEdit ? 'Edit offer' : 'Create a new sell offer'}</b>
      </DialogTitle>
      <DialogContent>{stepContents[`stepContent${activeStep}`]}</DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="info"
          onClick={() => handleBack()}
          disabled={isEdit ? activeStep === 2 : activeStep === 1}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={activeStep !== 3 ? handleSubmit(handleNext) : handleSubmit(handleCreateOffer)}
          disabled={loading}
        >
          {activeStep === 1 && 'Next'}
          {activeStep === 2 && 'Preview'}
          {activeStep === 3 && `${isEdit ? 'Update' : 'Create'} offer`}
        </Button>
      </DialogActions>

      <Portal>
        <CustomToast
          isOpen={success}
          handleClose={() => {
            reset();
            setLoading(false);
            setActiveStep(1);
            setSuccess(false);
            handleCloseModal();
          }}
          content={`Offer ${isEdit ? 'updated' : 'created'} successfully`}
          type="success"
          autoHideDuration={3000}
        />
        <CustomToast
          isOpen={error}
          handleClose={() => {
            setError(false);
          }}
          content={`${isEdit ? 'Update' : 'Create'} offer failed!`}
          type="error"
          autoHideDuration={3000}
        />
      </Portal>
      <FilterListModal
        isOpen={openCountryList}
        onDissmissModal={value => setOpenCountryList(value)}
        setSelectedItem={value => {
          setCountry(value as Country);
          dispatch(getStates(value?.id));
        }}
        listItems={countries}
      />
      <FilterListModal
        isOpen={openStateList}
        onDissmissModal={value => setOpenStateList(value)}
        setSelectedItem={value => {
          setState(value as State);
        }}
        listItems={states}
      />
    </StyledDialog>
  );
};

export default CreateOfferModal;
