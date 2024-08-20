'use client';

import { COIN, coinInfo } from '@bcpros/lixi-models';
import {
  WalletContext,
  getSelectedWalletPath,
  getWalletStatus,
  isValidCoinAddress,
  parseCashAddressToPrefix,
  useSliceSelector as useLixiSliceSelector,
  useXEC
} from '@bcpros/redux-store';
import styled from '@emotion/styled';
import { QrCodeScanner } from '@mui/icons-material';
import { Button, FormControl, IconButton, TextField } from '@mui/material';
import cashaddr from 'ecashaddrjs';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ScanQRcode from '../QRcode/ScanQRcode';
import CustomToast from '../Toast/CustomToast';

const WrapComponent = styled.div`
  .address-input {
    display: flex;
    button {
      border-radius: 0;
      border: 1px solid rgba(255, 255, 255, 0.09);
      background-color: rgba(255, 255, 255, 0.09);
    }
  }
  .amount-input {
    margin-top: 10px;
  }
  .btn-send {
    width: 100%;
    margin-top: 10px;
    color: #fff;
  }
`;
interface SendComponentProps {}

const SendComponent: React.FC<SendComponentProps> = ({}) => {
  const selectedWallet = useLixiSliceSelector(getSelectedWalletPath);
  const walletStatus = useLixiSliceSelector(getWalletStatus);
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { sendXec } = useXEC();

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      address: '',
      amount: 0
    }
  });
  const [myAddress, setMyAddress] = useState(parseCashAddressToPrefix(COIN.XEC, selectedWallet.cashAddress));

  const [openScan, setOpenScan] = useState(false);
  const [openToastSendSuccess, setOpenToastSendSuccess] = useState(false);
  const [linkSend, setLinkSend] = useState('');

  const handleSendCoin = async (data) => {
    const { address, amount } = data;
    const { type: typeXEC, hash: hashXEC } = cashaddr.decode(address, false);
    const recipientHash = Buffer.from(hashXEC).toString('hex');

    const link = await sendXec(
      chronik,
      selectedWallet?.fundingWif,
      walletStatus?.slpBalancesAndUtxos?.nonSlpUtxos,
      coinInfo[COIN.XEC].defaultFee,
      '', //message
      false, //indicate send mode is one to one
      null,
      recipientHash,
      parseFloat(amount), //amount
      coinInfo[COIN.XEC].etokenSats,
      false // return hex
    );
    if (link) {
      setLinkSend(link);
      setOpenToastSendSuccess(true);
      reset();
    }
  };

  return (
    <WrapComponent>
      <div className="address-input">
        <Controller
          name="address"
          control={control}
          rules={{
            required: {
              value: true,
              message: 'Address is required!'
            },
            validate: {
              addressValid: (addr) => {
                if (!isValidCoinAddress(COIN.XEC, addr)) return 'Invalid address!';
              },
              notSendMySelf: (addr) => {
                if (addr === myAddress) return 'Cannot send to yourself!';
              }
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
                id="address"
                label="Address"
                error={errors.address && true}
                helperText={errors.address && (errors.address?.message as string)}
                variant="filled"
              />
            </FormControl>
          )}
        />
        <IconButton onClick={() => setOpenScan(true)}>
          <QrCodeScanner width={50} />
        </IconButton>
      </div>

      <div className="amount-input">
        <Controller
          name="amount"
          control={control}
          rules={{
            required: {
              value: true,
              message: 'Amount is required!'
            },
            pattern: {
              value: /^-?[0-9]\d*\.?\d*$/,
              message: 'Amount is invalid!'
            },
            validate: (value) => {
              if (value < 5.46) return 'Amount must be greater than 5.46';
            }
          }}
          render={({ field: { onChange, onBlur, value, name, ref } }) => (
            <FormControl fullWidth={true}>
              <TextField
                id="amount"
                label="Amount"
                onChange={onChange}
                color="info"
                onBlur={onBlur}
                value={value}
                name={name}
                inputRef={ref}
                error={errors.amount ? true : false}
                helperText={errors.amount && (errors.amount?.message as string)}
                variant="filled"
              />
            </FormControl>
          )}
        />
      </div>
      <Button className="btn-send" variant="outlined" onClick={handleSubmit(handleSendCoin)}>
        Send
      </Button>
      <ScanQRcode
        isOpen={openScan}
        onDissmissModal={(value) => {
          setOpenScan(value);
        }}
        setAddress={(value) => {
          setValue('address', value);
        }}
      />

      <CustomToast
        isOpen={openToastSendSuccess}
        handleClose={() => setOpenToastSendSuccess(false)}
        content="Transaction successful. Click to view in block explorer."
        isLink={true}
        linkDescription={linkSend}
        type="success"
      />
    </WrapComponent>
  );
};

export default SendComponent;
