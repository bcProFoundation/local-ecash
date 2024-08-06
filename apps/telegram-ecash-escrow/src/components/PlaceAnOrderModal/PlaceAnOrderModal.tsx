'use client';

import styled from '@emotion/styled';
import { ChevronLeft, ContentCopy, QrCode2Outlined } from '@mui/icons-material';
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
  Slide,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useRouter } from 'next/navigation';
import React from 'react';

interface PlaceAnOrderModalProps {
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
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PlaceAnOrderModal: React.FC<PlaceAnOrderModalProps> = (props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

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
        <span>Offer: 123456789, Selling XEC @Hoi An, Vietnam</span>
        <br />
        <span>By: @nghiacc • posted on: 2024-07-24 14:20:39</span>
      </Typography>
      <DialogContent>
        <PlaceAnOrderWrap>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                className="form-input"
                id="amount"
                label="Amount"
                defaultValue="20,000,000"
                // helperText="helper text here."
                variant="standard"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                className="form-input"
                id="message"
                label="Message"
                defaultValue="I want to buy 20M XEC in cash"
                // helperText="helper text here."
                variant="standard"
              />
            </Grid>
          </Grid>
          <RadioGroup className="payment-method-wrap" name="payment-method-groups" defaultValue="cash-in-person">
            <FormControlLabel value="cash-in-person" control={<Radio />} label="Cash in person" />
            <FormControlLabel value="bank-transfer" control={<Radio />} label="Bank transfer" />
          </RadioGroup>
          <div className="disclaim-wrap">
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
          </div>
        </PlaceAnOrderWrap>
      </DialogContent>
      <DialogActions>
        <Button
          className="confirm-btn"
          color="info"
          variant="contained"
          onClick={() => {
            router.push('/order-detail');
            props.onDissmissModal!(false);
          }}
          autoFocus
        >
          Create
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PlaceAnOrderModal;
