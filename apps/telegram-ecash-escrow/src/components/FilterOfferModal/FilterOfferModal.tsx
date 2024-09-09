'use client';

import {
  OfferFilterInput,
  getAllCountries,
  getAllPaymentMethods,
  getAllStates,
  getPaymenMethods,
  getStates,
  saveOfferFilterConfig,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { CloseOutlined } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface FilterOfferModalProps {
  isOpen: boolean;
  onDissmissModal?: (value: boolean) => void;
  onConfirmClick?: () => void;
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

  .close-btn {
    padding: 6px;
    position: absolute;
    right: 16px;
    top: 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;

    svg {
      font-size: 24px;
    }
  }
`;

const FilterWrap = styled.div`
  .filter-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 20px 16px;

    &::last-of-type {
      border-bottom: 0;
    }

    &::first-of-type {
      padding-top: 0;
    }

    .content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 18px;
    }

    p {
      color: #79869b;
    }

    button {
      text-transform: math-auto;
      border-color: rgba(255, 255, 255, 0.2);

      &.active {
        border-color: rgba(255, 255, 255, 1);
      }
    }
  }
`;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FilterOfferModal: React.FC<FilterOfferModalProps> = props => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      countryId: null,
      stateId: null
    }
  });
  const [selectedOptionsPayment, setSelectedOptionsPayment] = useState<number[]>([]);

  const dispatch = useLixiSliceDispatch();
  const paymenthods = useLixiSliceSelector(getAllPaymentMethods);
  const countries = useLixiSliceSelector(getAllCountries);
  const states = useLixiSliceSelector(getAllStates);

  //auto call paymentMethods
  useEffect(() => {
    if (paymenthods.length === 0) dispatch(getPaymenMethods());
  }, [paymenthods.length]);

  const handleSelect = (id: number) => {
    const isSelected = !!selectedOptionsPayment.includes(id);
    //select before => drop select
    if (isSelected) {
      setSelectedOptionsPayment(pre => pre.filter(item => item !== id));
    } else {
      //select it
      setSelectedOptionsPayment(pre => [...pre, id]);
    }
  };

  const handleFilter = async data => {
    const { countryId, stateId } = data;
    const offerFilterInput: OfferFilterInput = {
      countryId: countryId && countryId,
      stateId: stateId && stateId,
      paymentMethodIds: selectedOptionsPayment
    };

    dispatch(saveOfferFilterConfig(offerFilterInput));
    props.onDissmissModal!(false);
  };

  const handleReset = () => {
    reset();
    setSelectedOptionsPayment([]);
    const offerFilterInput: OfferFilterInput = {
      countryId: null,
      stateId: null,
      paymentMethodIds: []
    };

    dispatch(saveOfferFilterConfig(offerFilterInput));
  };

  return (
    <StyledDialog
      fullScreen={fullScreen}
      open={props.isOpen}
      onClose={() => props.onDissmissModal!(false)}
      TransitionComponent={Transition}
    >
      <IconButton className="close-btn" onClick={() => props.onDissmissModal!(false)}>
        <CloseOutlined />
      </IconButton>
      <DialogTitle>Filter</DialogTitle>
      <DialogContent>
        <FilterWrap>
          <div className="filter-item">
            <Typography variant="body2">Payment method</Typography>
            <div className="content">
              {paymenthods.map(item => {
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={selectedOptionsPayment.includes(item.id) ? 'active' : ''}
                    size="small"
                    color="inherit"
                    variant="outlined"
                  >
                    {item.name}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="filter-item">
            <Typography variant="body2">City/Country</Typography>
            <div className="content">
              <Grid item xs={6}>
                <Controller
                  name="countryId"
                  control={control}
                  render={({ field: { onChange, onBlur, value, name, ref } }) => (
                    <FormControl fullWidth>
                      <InputLabel id="label-country">Country</InputLabel>
                      <Select
                        labelId="label-country"
                        id="label-country"
                        label="Country"
                        value={value}
                        onChange={e => {
                          onChange(e);
                          dispatch(getStates(Number(e.target.value ?? '0')));
                          setValue('stateId', null);
                        }}
                        onBlur={onBlur}
                        name={name}
                      >
                        {countries.map(country => (
                          <MenuItem key={country.id} value={country.id}>
                            {country.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="stateId"
                  control={control}
                  render={({ field: { onChange, onBlur, value, name, ref } }) => (
                    <FormControl fullWidth>
                      <InputLabel id="label-state">State</InputLabel>
                      <Select
                        labelId="label-state"
                        id="label-state"
                        label="State"
                        name={name}
                        onBlur={onBlur}
                        value={value}
                        onChange={onChange}
                        disabled={!getValues('countryId')}
                      >
                        {states.map(state => (
                          <MenuItem key={state.id} value={state.id}>
                            {state.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </div>
          </div>
        </FilterWrap>
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          variant="contained"
          autoFocus
          onClick={() => {
            handleReset();
            props.onDissmissModal!(false);
          }}
        >
          Reset
        </Button>
        <Button className="confirm-btn" color="info" variant="contained" onClick={handleSubmit(handleFilter)} autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default FilterOfferModal;
