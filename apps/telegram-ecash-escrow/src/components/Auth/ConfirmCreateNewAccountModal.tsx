'use client';

import { styled } from '@mui/material/styles';

import { ChevronLeft } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Typography
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';

interface ConfirmCreateNewAccountModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onDismissModal?: (value: boolean) => void;
  createAccount?: (isCreateAccount: boolean) => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '.MuiPaper-root': {
    background: theme.palette.background.default,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    width: '500px',
    maxHeight: '100%',
    padding: '16px',
    margin: '0',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },

  '.MuiIconButton-root': {
    width: 'fit-content',
    svg: {
      fontSize: '32px'
    }
  },

  '.MuiDialogTitle-root': {
    padding: '0 16px',
    paddingTop: '16px',
    fontSize: '26px',
    textAlign: 'center'
  },

  '.MuiDialogContent-root': {
    padding: '0'
  },

  '.MuiDialogActions-root': {
    justifyContent: 'space-evenly',

    button: {
      textTransform: 'none',
      width: '100%',
      '&.confirm-btn': {
        color: theme.palette.common.white
      }
    }
  },

  '.back-btn': {
    padding: '0',
    position: 'absolute',
    left: '8px',
    top: '20px',
    borderRadius: '12px',
    svg: {
      fontSize: '32px'
    }
  }
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmCreateNewAccountModal: React.FC<ConfirmCreateNewAccountModalProps> = props => {
  return (
    <React.Fragment>
      <StyledDialog open={props.isOpen} onClose={() => props.onDismissModal!(false)} TransitionComponent={Transition}>
        <IconButton className="back-btn" onClick={() => props.onDismissModal!(false)}>
          <ChevronLeft />
        </IconButton>
        <DialogTitle paddingTop="0px !important">Confirm create new account</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ marginTop: '10px' }}>
            Create a new wallet with a new seed phrase. This disconnects your Telegram login from your current LocaleCash
            account.
          </Typography>
          <Typography variant="body2" sx={{ marginTop: '12px', color: 'warning.main' }}>
            If you have open escrow orders or funds in escrow, you must keep using your current recovery phrase. A new
            wallet cannot access those contracts. Only create a new wallet if you have lost your seed and accept that
            any pending escrow funds may be unrecoverable.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            className="confirm-btn"
            variant="contained"
            color="warning"
            onClick={() => {
              props.createAccount!(false);
            }}
            disabled={props.isLoading}
            autoFocus
          >
            Not create
          </Button>
          <Button
            className="confirm-btn"
            variant="contained"
            color="success"
            onClick={() => {
              props.createAccount!(true);
            }}
            disabled={props.isLoading}
            autoFocus
          >
            Create with new seed
          </Button>
        </DialogActions>
      </StyledDialog>
    </React.Fragment>
  );
};

export default ConfirmCreateNewAccountModal;
