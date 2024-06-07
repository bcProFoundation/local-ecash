import React, { useEffect, useState } from 'react';
import { useInitData, usePostEvent } from '@tma.js/sdk-react';
import styled from '@emotion/styled';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  Stack,
  ThemeProvider,
  Typography,
  useMediaQuery
} from '@mui/material';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import ElectricMeterOutlinedIcon from '@mui/icons-material/ElectricMeterOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Diversity2OutlinedIcon from '@mui/icons-material/Diversity2Outlined';
import { TransitionProps } from '@mui/material/transitions';
import { CheckCircleOutline } from '@mui/icons-material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { ConfirmationData } from '@models/lib/qpay';
import axiosClient from '@utils/axiosClient';
import { Controller, useForm } from 'react-hook-form';
import axios from 'axios';
import _ from 'lodash';
import { createFileRoute } from '@tanstack/react-router';
import { darkTheme, lightTheme } from '../theme/theme';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const MIN_PAYMENT_AMOUNT = 20000;
const BWS_URL = process.env.REACT_PUBLIC_BWS_URL;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const defaultPayee = [
  {
    code: 'CA',
    name: 'Community Artists DEV',
    walletAddress: 'ecash:qp99c749msrx53hk9kn4dqqrwc0vy23prqpz6enzk2',
    merchantAddress: '',
    email: '',
    isElpsAccepted: true
  },
  {
    code: 'CHEM',
    name: 'Morazan Electric and Hydro DEV',
    walletAddress: 'ecash:qp99c749msrx53hk9kn4dqqrwc0vy23prqpz6enzk2',
    merchantAddress: '',
    email: '',
    isElpsAccepted: true
  },
  {
    code: 'MZEDE',
    name: 'Morazán ZEDE (Taxes/Fees) DEV',
    walletAddress: 'ecash:qp99c749msrx53hk9kn4dqqrwc0vy23prqpz6enzk2',
    merchantAddress: '',
    email: '',
    isElpsAccepted: false
  },
  {
    code: 'MGYM',
    name: 'Forever Young Gym - Morazán',
    walletAddress: 'ecash:qp99c749msrx53hk9kn4dqqrwc0vy23prqpz6enzk2',
    merchantAddress: null,
    email: '',
    isElpsAccepted: true
  }
];

export type Merchant = {
  code: string;
  email: string;
  isElpsAccepted: boolean;
  merchantAddress: string | null;
  name: string;
  walletAddress: string;
};

enum PaymentCurrency {
  eLPS = 'eLPS',
  XEC = 'XEC'
}

const ContainerSend = styled.div`
  padding: 1rem;
  .send-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    img {
      align-self: center;
      filter: drop-shadow(2px 4px 6px black);
    }
    .header-send {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      .title {
        margin-top: 1rem;
      }
      .subtitle {
        span {
          font-size: 12px;
          color: #d5d5d5;
        }
      }
      .prefix {
        color: #01abe8;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
  .send-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1rem 0;
    .prefix-coin {
      color: #01abe8;
      font-size: 14px;
      font-weight: 600;
    }
  }
  .send-group-action {
    button {
      width: 100%;
    }
  }
`;

const ConfirmContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  .currency-info {
    text-align: center;
    .curency-image {
      margin: 1rem 0;
      width: 96px;
      height: 96px;
    }
    .coin-symbol {
      font-size: 18px;
      font-weight: bold;
    }
    .amount {
      font-size: 18px;
      line-height: 36px;
    }
    .fees {
      color: gray;
      line-height: 22px;
      font-size: 14px;
    }
  }
  .invoice-information {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    .invoice-item {
      .title {
        font-size: 14px;
        color: gray;
        margin-bottom: 4px;
      }
      .desc {
        font-weight: 500;
      }
    }
  }
`;

const StyledDialogContent = styled(DialogContent)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 15px;
`;

const qpayQueryOptions = queryOptions({
  queryKey: ['qpayInfo'],
  staleTime: Infinity,
  queryFn: async () => {
    try {
      const req = await axios.get(`${BWS_URL}v3/merchant/qpayinfo`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const { merchantList, streets, message, raipayFeeList, unit } = await req.data;
      const xecFee = raipayFeeList.find(item => item.coin === 'xec');
      if (req.status !== 200) {
        throw new Error(message);
      }

      return {
        merchantList,
        streets,
        xecFee,
        unit
      };
    } catch (e) {
      console.log(e);
    }
  }
});

export const Route = createFileRoute('/qpay')({
  //@ts-ignore
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(qpayQueryOptions),
  component: Qpay,
  errorComponent: ({ error }) => {
    //@ts-ignore
    return <h3 style={{ textAlign: 'center' }}>Can't get Qpay's merchant</h3>;
  }
});

export const IconPayeeItem = (code: string) => {
  switch (code) {
    case 'CA':
      return <Diversity2OutlinedIcon style={{ marginRight: '8px' }} />;
    case 'CHEM':
      return <ElectricMeterOutlinedIcon style={{ marginRight: '8px' }} />;
    case 'MZEDE':
      return <ReceiptLongOutlinedIcon style={{ marginRight: '8px' }} />;
    case 'MGYM':
      return <FitnessCenterOutlinedIcon style={{ marginRight: '8px' }} />;
    default:
      return <Diversity2OutlinedIcon style={{ marginRight: '8px' }} />;
  }
};

function Qpay() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  //@ts-ignore
  const { merchantCode }: { merchantCode: string } = useSearch({ from: '/qpay' });
  const { merchantList, streets, unit, xecFee } = useSuspenseQuery(qpayQueryOptions).data;
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const accountNumberRegExpString = `^${lastYear}\\d{4}$|^${currentYear}\\d{4}$`;
  const accountNumberRegExp = new RegExp(accountNumberRegExpString);
  const {
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setError,
    clearErrors,
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      street: '',
      paymentReason: 3,
      payee: merchantCode,
      unitNumber: '',
      email: '',
      taxId: '',
      idNumber: '',
      paymentDescription: '',
      invoiceOrAccountNumber: '',
      paymentAmount: '',
      paymentCurrency: PaymentCurrency.eLPS,
      paymentAmountRate: 0,
      paymentAmountELPS: 0,
      paymentFee: null
    },
    mode: 'all'
  });
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [failure, setFailure] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [copySnackbar, setCopySnackbar] = useState<boolean>(false);
  const [selectedPopularPayee, setSelectedPopularPayee] = useState<{
    merchantCode?: string;
    merchantName: string;
    isElpsAccepted?: boolean;
    merchantWalletAddress?: string;
    merchantAddress?: string;
  } | null>(null);
  const [xecRateInUSD, setXecRateInUSD] = useState(0);
  const [elpsRateInUSD, setELPSRateInUSD] = useState(0);
  const { data, isFetching: isFetchingBalance } = useQuery({
    queryKey: ['userBalance'],
    placeholderData: {
      eLPSBalance: 0,
      xecBalance: 0
    },
    staleTime: Infinity,
    queryFn: async () => {
      const result = await axiosClient('/telegram-bot/balance', {
        params: {
          username: initData.user.username,
          userId: initData.user.id
        }
      }).then(res => res.data);

      return result;
    }
  });
  const { eLPSBalance, xecBalance }: { eLPSBalance: number; xecBalance: number } = data;
  const xecRaipayFee = {
    feePercentage: parseFloat(xecFee?.feePercentage ?? 0),
    feeQuantity: parseFloat(xecFee?.feeQuantity ?? 0)
  };
  const initData = useInitData();
  const postEvent = usePostEvent();
  // const initData = {
  //   user: {
  //     username: 'kennguyendev',
  //     id: 5051096342
  //   }
  // };

  useEffect(() => {
    fetchRate();
    postEvent('web_app_setup_closing_behavior', { need_confirmation: true });
    handlePopularPayeeChange(merchantCode);
  }, []);

  const fetchRate = async () => {
    try {
      const prices = (await axios.get(`${BWS_URL}v3/fiatrates`)).data;
      setXecRateInUSD(prices.xec[0].rate);
      setELPSRateInUSD(prices.eLPS[0].rate);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const formatAmountWithLimitDecimal = (amount: number, maxDecimals: number): number => {
    const amountToString = amount.toString();
    if (amountToString.split('.').length > 1) {
      if (amountToString.split('.')[1].length > maxDecimals) {
        return Number(amountToString.split('.')[0] + '.' + amount.toString().split('.')[1].substring(0, maxDecimals));
      }
      return amount;
    } else {
      return amount;
    }
  };

  const handlePopularPayeeChange = value => {
    const merchant =
      process.env.DEPLOY_ENVIROMENT === 'development'
        ? defaultPayee.find(({ code }) => code === value)
        : merchantList.find(({ code }) => code === value);

    setSelectedPopularPayee({
      merchantName: merchant.name,
      merchantCode: merchant.code,
      isElpsAccepted: merchant.isElpsAccepted,
      merchantWalletAddress: merchant.walletAddress,
      merchantAddress: merchant.merchantAddress
    });

    clearErrors('unitNumber');
    clearErrors('taxId');
    clearErrors('idNumber');
    clearErrors('invoiceOrAccountNumber');
    clearErrors('paymentDescription');
    clearErrors('paymentReason');
  };

  const validateForm = async data => {
    const {
      payee,
      idNumber,
      invoiceOrAccountNumber,
      paymentDescription,
      paymentReason,
      taxId,
      unitNumber,
      street,
      paymentAmount,
      paymentCurrency,
      paymentFee
    } = data;

    if (paymentAmount <= 0) {
      setError('paymentAmount', { type: 'required', message: 'Amount cannot be less than 0!' });
      return;
    }

    //Check for payment reason
    if (payee === 'CA' || payee === 'CHEM' || payee === 'MZEDE') {
      if (_.isNil(paymentReason)) {
        setError('paymentReason', { type: 'required', message: 'Payment Reason is required' });
        return;
      }

      if (paymentReason === 1 && _.isEmpty(invoiceOrAccountNumber)) {
        setError('invoiceOrAccountNumber', { type: 'required', message: 'Invoice or account number is required' });
        return;
      }

      if (_.isEmpty(paymentDescription)) {
        setError('paymentDescription', { type: 'required', message: 'Payment description is required' });
        return;
      }
    }

    //Check for Unit number and Street
    if (payee === 'CA' || payee === 'CHEM') {
      if (!_.isNumber(unitNumber)) {
        setError('unitNumber', { type: 'required', message: 'Unit number is required' });
        return;
      }

      if (_.isEmpty(street)) {
        setError('street', { type: 'required', message: 'Street is required' });
        return;
      }
    }

    //Check for tax Id
    if (payee === 'MZEDE' && _.isEmpty(taxId)) {
      setError('taxId', { type: 'required', message: 'Tax ID is required' });
      return;
    }

    //Check of Id number
    if (payee === 'MGYM' && _.isEmpty(idNumber)) {
      setError('idNumber', { type: 'required', message: 'ID number is required' });
      return;
    }

    if (paymentCurrency === PaymentCurrency.eLPS) {
      setLoading(true);
      const paymentFee: number = await queryClient.ensureQueryData({
        queryKey: [
          'postageFee',
          initData.user.username,
          initData.user.id,
          selectedPopularPayee.merchantWalletAddress,
          parseFloat(paymentAmount)
        ],
        queryFn: async () => {
          try {
            const req = await axiosClient('/telegram-bot/get-postage-fee', {
              params: {
                username: initData.user.username,
                userId: initData.user.id.toString(),
                merchantAddress: selectedPopularPayee.merchantWalletAddress,
                amountToPay: parseFloat(paymentAmount)
              }
            });

            const { postageFee } = req.data;

            return postageFee;
          } catch (e) {
            console.error(e);
          }
        }
      });
      setLoading(false);

      if (paymentFee <= 0 || paymentFee === null) {
        setError('paymentAmount', { type: 'required', message: 'Not enough balance for fees.' });
        return;
      } else {
        setValue('paymentFee', paymentFee);
      }
    }

    setOpenDialog(true);
  };

  const calculateElps = (amount: number) => {
    const amountToPayValueAfterFee = amount - (amount * xecRaipayFee.feePercentage) / 100 - xecRaipayFee.feeQuantity;

    if (amountToPayValueAfterFee > 0) {
      const result = (xecRateInUSD / elpsRateInUSD) * amountToPayValueAfterFee;
      setValue('paymentAmountELPS', formatAmountWithLimitDecimal(result, 2));
    } else {
      setValue('paymentAmountELPS', 0);
    }
  };

  const onPayClick = async data => {
    const {
      email,
      idNumber,
      invoiceOrAccountNumber,
      paymentAmount,
      paymentAmountELPS,
      paymentDescription,
      paymentCurrency,
      unitNumber,
      paymentReason,
      street,
      taxId
    } = data;

    setLoading(true);
    try {
      const confirmationData: ConfirmationData = {
        username: initData.user.username,
        userId: initData.user.id.toString(),
        merchant: selectedPopularPayee,
        dataBill: {
          paymentCurrency: paymentCurrency.toLowerCase(),
          amountToPay: parseFloat(paymentAmount),
          amountTokenElps: parseFloat(paymentAmountELPS),
          email: email,
          idNumber: idNumber,
          payee: selectedPopularPayee.merchantName,
          paymentAccountNumber: invoiceOrAccountNumber,
          paymentDescription: paymentDescription,
          paymentReason: paymentReason,
          street: street,
          taxId: taxId,
          unitNumber: unitNumber
        }
      };

      const { txId } = (await axiosClient.post('/telegram-bot/qpay-confirmation', confirmationData)).data;
      setTransactionId(txId);

      await queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      setSuccess(true);
      reset();
    } catch (e) {
      console.log(e);
      setFailure(true);
    }

    setOpenDialog(false);
    setLoading(false);
  };

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <ContainerSend>
        <div className="send-info">
          <h2 style={{ textAlign: 'center' }}>QPay</h2>
          <IconButton
            aria-label="close"
            onClick={() => navigate({ to: '/' })}
            sx={{
              position: 'absolute',
              left: 8,
              top: 8
            }}
            style={{
              paddingBottom: 0
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <div className="header-send">
            <h3 className="title">Balance</h3>
            {!isFetchingBalance ? (
              {
                eLPS: (
                  <Typography>
                    {`${eLPSBalance}`} <span className="prefix">eLPS</span>
                  </Typography>
                ),
                XEC: (
                  <Typography>
                    {`${xecBalance}`} <span className="prefix">XEC</span>
                  </Typography>
                )
              }[watch('paymentCurrency')]
            ) : (
              <CircularProgress size={20} />
            )}
          </div>
        </div>
        <form className="send-form">
          {/* Payee */}
          <FormControl fullWidth={true}>
            <TextField
              placeholder="Payee"
              id="payee"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{IconPayeeItem(selectedPopularPayee?.merchantCode)}</InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: prefersDarkMode ? 'white' : 'black'
                }
              }}
              value={selectedPopularPayee?.merchantName}
              error={errors.payee ? true : false}
              helperText={errors.payee ? (errors.payee.message as string) : null}
              color="info"
              label="Payee"
              disabled
              variant="outlined"
            />
          </FormControl>

          {/* Street and Unit */}
          {(selectedPopularPayee?.merchantCode === 'CA' ||
            selectedPopularPayee?.merchantCode === 'CHEM' ||
            selectedPopularPayee === null) && (
            <React.Fragment>
              <Controller
                name="street"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <FormControl fullWidth={true}>
                    <InputLabel id="street-label">Street</InputLabel>
                    <Select
                      labelId="street-label"
                      id="street"
                      value={value}
                      onChange={onChange}
                      label="Street"
                      error={errors.street ? true : false}
                      onBlur={onBlur}
                      ref={ref}
                    >
                      {streets?.map(value => {
                        return (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText error>{errors.street ? (errors.street?.message as string) : null}</FormHelperText>
                  </FormControl>
                )}
              />
              <Controller
                name="unitNumber"
                control={control}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl fullWidth={true}>
                    <InputLabel id="unit-label">Unit Number</InputLabel>
                    <Select
                      labelId="unit-label"
                      id="unit"
                      value={value}
                      label="Unit Number"
                      error={errors.unitNumber ? true : false}
                      onBlur={onBlur}
                      ref={ref}
                      onChange={onChange}
                      name={name}
                      onSelect={onChange}
                      MenuProps={{
                        MenuListProps: {
                          style: {
                            display: 'grid',
                            gridTemplateColumns: 'auto auto auto auto'
                          }
                        }
                      }}
                    >
                      {(() => {
                        let unitNumber = [];
                        for (let i = 1; i <= unit; i++) {
                          unitNumber.push(
                            <MenuItem key={i} value={i} style={{ width: '100%', justifyContent: 'center' }}>
                              {i}
                            </MenuItem>
                          );
                        }
                        return unitNumber;
                      })()}
                    </Select>
                    <FormHelperText error>
                      {errors.unitNumber ? (errors.unitNumber?.message as string) : null}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </React.Fragment>
          )}

          {/* Tax Id */}
          {selectedPopularPayee?.merchantCode === 'MZEDE' && (
            <Controller
              name="taxId"
              control={control}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <FormControl fullWidth={true}>
                  <TextField
                    id="taxId"
                    placeholder="Please enter your Tax Id"
                    label="Tax Id"
                    value={value}
                    name={name}
                    ref={ref}
                    error={errors.taxId ? true : false}
                    helperText={errors.taxId ? (errors.taxId.message as string) : null}
                    color="info"
                    onBlur={onBlur}
                    onChange={onChange}
                    variant="outlined"
                  />
                </FormControl>
              )}
            />
          )}

          {/*Id Number*/}
          {selectedPopularPayee?.merchantCode === 'MGYM' && (
            <Controller
              name="idNumber"
              control={control}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <FormControl fullWidth={true}>
                  <TextField
                    id="idNumber"
                    label="ID Number"
                    value={value}
                    name={name}
                    ref={ref}
                    error={errors.idNumber ? true : false}
                    helperText={errors.idNumber ? (errors.idNumber.message as string) : null}
                    color="info"
                    onBlur={onBlur}
                    onChange={onChange}
                    variant="outlined"
                  />
                </FormControl>
              )}
            />
          )}

          {/* Payment Reason and Desc*/}
          {selectedPopularPayee?.merchantCode !== 'MGYM' && (
            <React.Fragment>
              <Controller
                name="paymentReason"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <FormControl fullWidth={true}>
                    <InputLabel id="payment-reason-label">Payment reason</InputLabel>
                    <Select
                      labelId="payment-reason-label"
                      id="payment-reason"
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      ref={ref}
                      error={errors.paymentReason ? true : false}
                      label="Payment reason"
                    >
                      <MenuItem value={1}>Current Invoice</MenuItem>
                      <MenuItem value={2}>Advance Payment</MenuItem>
                      <MenuItem value={3}>Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              {watch('paymentReason') === 1 && (
                <Controller
                  name="invoiceOrAccountNumber"
                  control={control}
                  rules={{
                    pattern: {
                      value: accountNumberRegExp,
                      message: 'Wrong format'
                    }
                  }}
                  render={({ field: { onChange, onBlur, value, name, ref } }) => (
                    <FormControl fullWidth={true}>
                      <TextField
                        id="invoiceOrAccountNumber"
                        label="Invoice or AccountNumber"
                        placeholder={`e.g ${currentYear}xxxx`}
                        value={value}
                        name={name}
                        ref={ref}
                        color="info"
                        error={errors.invoiceOrAccountNumber ? true : false}
                        helperText={
                          errors.invoiceOrAccountNumber ? (errors.invoiceOrAccountNumber?.message as string) : null
                        }
                        onBlur={onBlur}
                        onChange={onChange}
                        variant="outlined"
                      />
                    </FormControl>
                  )}
                />
              )}

              <Controller
                name="paymentDescription"
                control={control}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl fullWidth={true}>
                    <TextField
                      id="idNumber"
                      label="Payment description"
                      placeholder="Enter what you are paying for"
                      value={value}
                      name={name}
                      ref={ref}
                      error={errors.paymentDescription ? true : false}
                      helperText={errors.paymentDescription ? (errors.paymentDescription.message as string) : null}
                      color="info"
                      onBlur={onBlur}
                      onChange={onChange}
                      variant="outlined"
                    />
                  </FormControl>
                )}
              />
            </React.Fragment>
          )}
          <Grid container spacing={2}>
            <Grid item xs={xecBalance > 0 && eLPSBalance > 0 ? 8 : 12}>
              {/* Payment amount */}
              <Controller
                name="paymentAmount"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Payment amount is required!'
                  },
                  pattern: {
                    value: /^-?[0-9]\d*\.?\d*$/,
                    message: 'Payment amount is invalid!'
                  },
                  max: {
                    value: getValues('paymentCurrency') === 'XEC' ? xecBalance : eLPSBalance,
                    message: 'Insufficent balance!'
                  }
                }}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl fullWidth={true}>
                    <TextField
                      id="payment-amount"
                      label="Payment amount"
                      placeholder="Input amount"
                      color="info"
                      onChange={e => {
                        const amountToPay = parseFloat(e.target.value);

                        //Set rate
                        if (getValues('paymentCurrency') === PaymentCurrency.XEC) {
                          setValue('paymentAmountRate', parseFloat((amountToPay * xecRateInUSD).toFixed(3)));
                        } else {
                          setValue('paymentAmountRate', parseFloat((amountToPay * elpsRateInUSD).toFixed(3)));
                        }
                        //Set elps
                        calculateElps(amountToPay);

                        onChange(e.target.value);
                      }}
                      onBlur={onBlur}
                      value={value}
                      name={name}
                      ref={ref}
                      error={errors.paymentAmount ? true : false}
                      helperText={
                        errors.paymentAmount
                          ? (errors.paymentAmount?.message as string)
                          : `$ ${getValues('paymentAmountRate')}`
                      }
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <p className="prefix-coin">{watch('paymentCurrency')}</p>
                          </InputAdornment>
                        )
                      }}
                      //   error={paymentAmount < MIN_PAYMENT_AMOUNT}
                    />
                  </FormControl>
                )}
              />
            </Grid>
            {xecBalance > 0 && eLPSBalance > 0 && (
              <Grid item xs={4}>
                <Controller
                  name="paymentCurrency"
                  control={control}
                  rules={{
                    required: true
                  }}
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <FormControl fullWidth={true}>
                      <InputLabel id="paymentCurrency-label">Currency:</InputLabel>
                      <Select
                        labelId="paymentCurrency-label"
                        id="paymentCurrency"
                        value={value}
                        onChange={e => {
                          const paymentCurrency = e.target.value;
                          const amountToPay = parseFloat(getValues('paymentAmount'));

                          if (_.isNaN(amountToPay)) {
                            onChange(e.target.value);
                            return;
                          }

                          //Set rate
                          if (paymentCurrency === PaymentCurrency.XEC) {
                            setValue('paymentAmountRate', parseFloat((amountToPay * xecRateInUSD).toFixed(3)));
                          } else {
                            setValue('paymentAmountRate', parseFloat((amountToPay * elpsRateInUSD).toFixed(3)));
                          }
                          //Set elps
                          calculateElps(amountToPay);

                          onChange(e.target.value);
                        }}
                        label="Payment Currency"
                        error={errors.paymentCurrency ? true : false}
                        onBlur={onBlur}
                        ref={ref}
                      >
                        {Object.keys(PaymentCurrency).map(value => {
                          return (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            )}
          </Grid>

          {/* Payment amount eLPS */}
          {watch('paymentCurrency') === PaymentCurrency.XEC && (
            <Controller
              name="paymentAmountELPS"
              control={control}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <FormControl fullWidth={true}>
                  <TextField
                    disabled
                    id="payment-unit"
                    placeholder="0"
                    value={value}
                    color="info"
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
                    onKeyDown={event => {
                      //This prevent any char expect number
                      if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete') {
                        event.preventDefault();
                      }
                    }}
                    onChange={onChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <p className="prefix-coin">eLPS</p>
                        </InputAdornment>
                      )
                    }}
                  />
                </FormControl>
              )}
            />
          )}

          {/* Email */}
          <Controller
            name="email"
            control={control}
            rules={{
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Wrong email format'
              },
              required: {
                value: true,
                message: 'Email is required!'
              }
            }}
            render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <FormControl fullWidth={true}>
                <TextField
                  type="email"
                  id="email-send-receipt"
                  label="Email to send receipt"
                  placeholder="Enter your email"
                  value={value}
                  name={name}
                  ref={ref}
                  color="info"
                  onBlur={onBlur}
                  error={errors.email ? true : false}
                  helperText={errors.email ? (errors.email?.message as string) : null}
                  onChange={onChange}
                  variant="outlined"
                />
              </FormControl>
            )}
          />

          <FormControl fullWidth={true}>
            <Button variant="contained" size="large" onClick={handleSubmit(validateForm)}>
              Review
            </Button>
          </FormControl>
        </form>
      </ContainerSend>
      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullScreen={true}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>{'Bill Confirm'}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            left: 8,
            top: 8
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <DialogContent>
          <ConfirmContainer>
            <div className="currency-info">
              {
                {
                  eLPS: (
                    <React.Fragment>
                      <div className="curency-info">
                        <p className="coin-symbol">eLPS</p>
                      </div>
                      <img className="curency-image" src="/elps.png" alt="" />
                    </React.Fragment>
                  ),
                  XEC: (
                    <React.Fragment>
                      <div className="curency-info">
                        <p className="coin-symbol">eCash (XEC)</p>
                      </div>
                      <img className="curency-image" src="/xec.svg" alt="" />
                    </React.Fragment>
                  )
                }[getValues('paymentCurrency')]
              }
              <div className="balance">
                <p style={{ color: 'gray' }}>Payment Amount</p>
                {
                  {
                    eLPS: <h4 className="amount">{getValues('paymentAmount')} eLPS</h4>,
                    XEC: (
                      <React.Fragment>
                        <h4 className="amount">{getValues('paymentAmount')} XEC</h4>
                      </React.Fragment>
                    )
                  }[getValues('paymentCurrency')]
                }
                <p className="rate">≈ ${getValues('paymentAmountRate')}</p>
                {getValues('paymentCurrency') === PaymentCurrency.eLPS && (
                  <p className="fees">
                    <span>Fees:</span> {`${getValues('paymentFee')} eLPS`}
                  </p>
                )}
              </div>
            </div>

            <div className="invoice-information">
              <div className="invoice-item">
                <p className="title">Payee name</p>
                <p className="desc">{selectedPopularPayee?.merchantName}</p>
              </div>

              {/* Payee CA and CHEM */}
              {(getValues('payee') === 'CA' || getValues('payee') === 'CHEM') && (
                <React.Fragment>
                  {getValues('street') && (
                    <div className="invoice-item">
                      <p className="title">Street</p>
                      <p className="desc">{getValues('street')}</p>
                    </div>
                  )}
                  <div className="invoice-item">
                    <p className="title">Unit number</p>
                    <p className="desc">{getValues('unitNumber')}</p>
                  </div>
                  {getValues('invoiceOrAccountNumber') && (
                    <div className="invoice-item">
                      <p className="title">Invoice ID (Account number)</p>
                      <p className="desc">{getValues('invoiceOrAccountNumber')}</p>
                    </div>
                  )}
                  <div className="invoice-item">
                    <p className="title">Payment description</p>
                    <p className="desc">{getValues('paymentDescription')}</p>
                  </div>
                </React.Fragment>
              )}

              {/* Payee MZEDE */}
              {getValues('payee') === 'MZEDE' && (
                <React.Fragment>
                  <div className="invoice-item">
                    <p className="title">Tax Id</p>
                    <p className="desc">{getValues('taxId')}</p>
                  </div>
                  {getValues('invoiceOrAccountNumber') && (
                    <div className="invoice-item">
                      <p className="title">Invoice ID (Account number)</p>
                      <p className="desc">{getValues('invoiceOrAccountNumber')}</p>
                    </div>
                  )}
                  <div className="invoice-item">
                    <p className="title">Payment description</p>
                    <p className="desc">{getValues('paymentDescription')}</p>
                  </div>
                </React.Fragment>
              )}

              {/* Payee MGYM */}
              {getValues('payee') === 'MGYM' && (
                <div className="invoice-item">
                  <p className="title">Id Number</p>
                  <p className="desc">{getValues('idNumber')}</p>
                </div>
              )}

              {getValues('email') && (
                <div className="invoice-item">
                  <p className="title">Email to send receipt</p>
                  <p className="desc">{getValues('email')}</p>
                </div>
              )}
            </div>
            <FormControl fullWidth={true}>
              <Button variant="contained" size="large" onClick={handleSubmit(onPayClick)}>
                Pay
              </Button>
            </FormControl>
          </ConfirmContainer>
        </DialogContent>
        {/* <DialogActions sx={{ display: 'flex' }}>
          <LixiButton title="Pay" onClickItem={handleConfirm} />
        </DialogActions> */}
      </Dialog>
      <Dialog
        open={success}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        fullScreen={true}
      >
        <DialogTitle sx={{ textAlign: 'center', paddingBottom: 0 }}>Success!</DialogTitle>
        <DialogTitle sx={{ textAlign: 'center' }}>Payment sent to merchant</DialogTitle>
        <StyledDialogContent>
          <CheckCircleOutline className="ico-alert" style={{ fontSize: '80px' }} />
          <h3>Transaction Id</h3>
          <CopyToClipboard text={transactionId} onCopy={() => setCopySnackbar(true)}>
            <Typography
              variant="caption"
              display="block"
              style={{ wordBreak: 'break-all', textDecoration: 'underline' }}
              textAlign={'center'}
              fontSize={'15px'}
            >
              {transactionId}
            </Typography>
          </CopyToClipboard>
        </StyledDialogContent>
        <DialogActions sx={{ display: 'flex' }}>
          <FormControl fullWidth={true}>
            <Button variant="contained" size="large" onClick={() => navigate({ to: '/' })}>
              Back to home
            </Button>
          </FormControl>
        </DialogActions>
      </Dialog>
      <Backdrop sx={{ zIndex: '9999' }} open={loading} onClick={handleClose}>
        <CircularProgress color={'inherit'} />
      </Backdrop>
      <Stack>
        <Snackbar
          open={failure}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          onClose={() => setFailure(false)}
        >
          <Alert
            style={{ width: '100%' }}
            icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />}
            severity="error"
          >
            {`Payment failed...`}
          </Alert>
        </Snackbar>
      </Stack>
      <Stack>
        <Snackbar
          open={copySnackbar}
          autoHideDuration={1000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          onClose={() => setCopySnackbar(false)}
        >
          <Alert
            style={{ width: '100%' }}
            icon={<CheckCircleOutline className="ico-alert" fontSize="inherit" />}
            severity="info"
          >
            Copied to clipboard
          </Alert>
        </Snackbar>
      </Stack>
    </ThemeProvider>
  );
}
