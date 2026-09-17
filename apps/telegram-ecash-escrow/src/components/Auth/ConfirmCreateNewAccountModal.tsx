'use client';

import { axiosClient } from '@bcpros/redux-store';
import { styled } from '@mui/material/styles';

import { ChevronLeft } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Slide,
  TextField,
  Typography
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { useEffect, useMemo, useState } from 'react';

export type ReplaceWalletInfo = {
  telegramId: string;
  accountId: number;
  role: string;
  openEscrowCount: number;
  canSelfServiceReplace: boolean;
  roleRequiresAdminRotation: boolean;
};

interface ConfirmCreateNewAccountModalProps {
  isOpen: boolean;
  isLoading: boolean;
  telegramId: string;
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
    padding: '0 16px'
  },

  '.MuiDialogActions-root': {
    justifyContent: 'space-evenly',
    padding: '0 16px 16px',

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
  const [replaceInfo, setReplaceInfo] = useState<ReplaceWalletInfo | null>(null);
  const [typedTelegramId, setTypedTelegramId] = useState('');
  const [acknowledgeLoss, setAcknowledgeLoss] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  useEffect(() => {
    if (!props.isOpen || !props.telegramId) {
      setReplaceInfo(null);
      setTypedTelegramId('');
      setAcknowledgeLoss(false);
      setInfoError(null);
      return;
    }

    (async () => {
      try {
        const { data } = await axiosClient.get<ReplaceWalletInfo>(
          `/api/accounts/telegram/replace-wallet-info/${props.telegramId}`
        );
        setReplaceInfo(data);
      } catch {
        setInfoError('Unable to load wallet replacement details. Please try again.');
      }
    })();
  }, [props.isOpen, props.telegramId]);

  const telegramIdConfirmed = typedTelegramId.trim() === props.telegramId;
  const hasOpenEscrow = (replaceInfo?.openEscrowCount ?? 0) > 0;
  const canConfirmReplace = useMemo(() => {
    if (!replaceInfo?.canSelfServiceReplace || infoError) return false;
    if (!telegramIdConfirmed) return false;
    if (hasOpenEscrow && !acknowledgeLoss) return false;
    return true;
  }, [replaceInfo, infoError, telegramIdConfirmed, hasOpenEscrow, acknowledgeLoss]);

  return (
    <React.Fragment>
      <StyledDialog open={props.isOpen} onClose={() => props.onDismissModal!(false)} TransitionComponent={Transition}>
        <IconButton className="back-btn" onClick={() => props.onDismissModal!(false)}>
          <ChevronLeft />
        </IconButton>
        <DialogTitle paddingTop="0px !important">Create new wallet</DialogTitle>
        <DialogContent>
          {infoError && (
            <Typography variant="body2" color="error" sx={{ marginTop: '10px' }}>
              {infoError}
            </Typography>
          )}

          {replaceInfo?.roleRequiresAdminRotation && (
            <>
              <Typography variant="body1" sx={{ marginTop: '10px' }}>
                This account has a {replaceInfo.role.toLowerCase()} role. Wallet replacement is not available in the
                app.
              </Typography>
              <Typography variant="body2" sx={{ marginTop: '12px', color: 'warning.main' }}>
                If you still have your recovery phrase, use Import instead. If the key is lost or compromised, contact
                an administrator for guided recovery or role rotation. Active escrow contracts stay bound to the
                original key until those orders finish or an admin assists.
              </Typography>
            </>
          )}

          {replaceInfo && !replaceInfo.roleRequiresAdminRotation && (
            <>
              <Typography variant="body1" sx={{ marginTop: '10px' }}>
                This creates a new wallet and disconnects Telegram from your current LocaleCash account (ID{' '}
                {replaceInfo.accountId}).
              </Typography>
              {hasOpenEscrow ? (
                <Typography variant="body2" sx={{ marginTop: '12px', color: 'warning.main' }}>
                  You have {replaceInfo.openEscrowCount} open escrow order(s). A new wallet cannot sign or recover
                  funds locked in those contracts. Only continue if you have lost your seed and accept that pending
                  escrow funds may be unrecoverable.
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ marginTop: '12px' }}>
                  Only use this if you have lost your recovery phrase.
                </Typography>
              )}
              <TextField
                fullWidth
                margin="normal"
                label="Type your Telegram ID to confirm"
                placeholder={props.telegramId}
                value={typedTelegramId}
                onChange={e => setTypedTelegramId(e.target.value)}
                helperText={`Enter ${props.telegramId} exactly`}
              />
              {hasOpenEscrow && (
                <FormControlLabel
                  control={
                    <Checkbox checked={acknowledgeLoss} onChange={e => setAcknowledgeLoss(e.target.checked)} />
                  }
                  label="I understand pending escrow funds may be permanently lost"
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            className="confirm-btn"
            variant="contained"
            color="warning"
            onClick={() => props.createAccount!(false)}
            disabled={props.isLoading}
          >
            Cancel
          </Button>
          {replaceInfo?.canSelfServiceReplace && (
            <Button
              className="confirm-btn"
              variant="contained"
              color="error"
              onClick={() => props.createAccount!(true)}
              disabled={props.isLoading || !canConfirmReplace}
            >
              Create new wallet
            </Button>
          )}
        </DialogActions>
      </StyledDialog>
    </React.Fragment>
  );
};

export default ConfirmCreateNewAccountModal;
