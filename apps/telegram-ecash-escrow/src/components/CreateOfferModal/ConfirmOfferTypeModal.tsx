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

interface ConfirmOfferTypeModalProps {
  isOpen: boolean;
  onDissmissModal?: (value: boolean) => void;
  createOffer?: (isHidden: boolean) => void;
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

const ConfirmOfferTypeModal: React.FC<ConfirmOfferTypeModalProps> = props => {
  return (
    <React.Fragment>
      <StyledDialog open={props.isOpen} onClose={() => props.onDissmissModal!(false)} TransitionComponent={Transition}>
        <IconButton className="back-btn" onClick={() => props.onDissmissModal!(false)}>
          <ChevronLeft />
        </IconButton>
        <DialogTitle paddingTop="0px !important">Confirmation</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '16px', marginTop: '10px' }}>
            Would you like to list your offer on the Marketplace?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            className="confirm-btn"
            variant="contained"
            color="warning"
            onClick={() => {
              props.createOffer!(false);
            }}
            autoFocus
          >
            Listed
          </Button>
          <Button
            className="confirm-btn"
            variant="contained"
            color="success"
            onClick={() => {
              props.createOffer!(true);
            }}
            autoFocus
          >
            Unlisted
          </Button>
        </DialogActions>
      </StyledDialog>
    </React.Fragment>
  );
};

export default ConfirmOfferTypeModal;
