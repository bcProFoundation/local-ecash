'use client';

import styled from '@emotion/styled';
import { CloseOutlined } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';

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
              <Button className="active" size="small" color="inherit" variant="outlined">
                Cash in person
              </Button>
              <Button size="small" color="inherit" variant="outlined">
                Bank transfer
              </Button>
            </div>
          </div>
          <div className="filter-item">
            <Typography variant="body2">City/Country</Typography>
            <div className="content">
              <Button className="active" size="small" color="inherit" variant="outlined">
                Vietnam
              </Button>
              <Button size="small" color="inherit" variant="outlined">
                Ho chi minh
              </Button>
              <Button size="small" color="inherit" variant="outlined">
                Hoi an
              </Button>
              <Button size="small" color="inherit" variant="outlined">
                Ha noi
              </Button>
            </div>
          </div>
        </FilterWrap>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="contained" autoFocus onClick={() => props.onDissmissModal!(false)}>
          Reset
        </Button>
        <Button
          className="confirm-btn"
          color="info"
          variant="contained"
          onClick={() => props.onDissmissModal!(false)}
          autoFocus
        >
          Confirm
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default FilterOfferModal;
