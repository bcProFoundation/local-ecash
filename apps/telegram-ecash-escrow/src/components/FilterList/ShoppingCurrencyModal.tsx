'use client';

import { LIST_COIN } from '@/src/store/constants';
import { LIST_CURRENCIES_USED } from '@bcpros/lixi-models';
import { ChevronLeft } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import React, { useId, useState } from 'react';
import { FilterCurrencyType } from '../../store/type/types';

interface ShoppingCurrencyModalProps {
  isOpen: boolean;
  onDismissModal?: (value: boolean) => void;
  setSelectedItem?: (value: FilterCurrencyType) => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '.MuiPaper-root': {
    background: theme.palette.background.default,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    width: '500px',
    height: '100vh',
    maxHeight: '100%',
    margin: 0,
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '.back-btn': {
      position: 'absolute',
      left: '10px'
    },

    '.btn-clear': {
      color: '#FFF',
      position: 'absolute',
      right: '10px',
      fontSize: '12px',
      padding: '1px 5px'
    }
  },

  '.MuiDialogContent-root': {
    padding: 0
  },

  button: {
    color: theme.palette.text.secondary
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '.MuiTab-root': {
    color: theme.custom.colorPrimary,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '16px',

    '&.Mui-selected': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(8px)'
    }
  },

  '.MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main || '#0076c4'
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

/**
 * Currency modal for Shopping tab - Shows Fiat and Crypto tabs
 * Similar to P2P trading currency modal but for Goods & Services
 */
const ShoppingCurrencyModal: React.FC<ShoppingCurrencyModalProps> = props => {
  const { isOpen, onDismissModal, setSelectedItem } = props;
  const keyFilterTab = 'shopping-currency-tab';
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const titleId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [value, setValue] = useState(Number(sessionStorage.getItem(keyFilterTab)) || 0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    sessionStorage.setItem(keyFilterTab, newValue.toString());
    setValue(newValue);
    setSearchTerm('');
  };

  const handleSelect = (currency: any) => {
    const filterCurrency: FilterCurrencyType = {
      paymentMethod: 5, // PAYMENT_METHOD.GOODS_SERVICES
      value: currency?.code ?? currency?.ticker ?? currency
    };
    setSelectedItem?.(filterCurrency);
    onDismissModal?.(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedItem?.({ paymentMethod: 5, value: '' });
    onDismissModal?.(false);
    setSearchTerm('');
  };

  const handleClose = () => {
    onDismissModal?.(false);
    setSearchTerm('');
  };

  const searchTextField = (
    <TextField
      label="Search"
      variant="filled"
      fullWidth
      onChange={e => setSearchTerm(e.target.value)}
      value={searchTerm}
      autoFocus
    />
  );

  const contentFiat = () => {
    const filteredFiats = LIST_CURRENCIES_USED.filter(option =>
      `${option?.name} (${option?.code})`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="content-fiat">
        {searchTextField}
        <Box sx={{ mt: 1, maxHeight: 'calc(100vh - 260px)', overflow: 'auto', px: 2 }}>
          {filteredFiats.map(option => (
            <Button
              key={option?.code}
              onClick={() => handleSelect(option)}
              fullWidth
              variant="text"
              style={{ textTransform: 'capitalize', fontSize: '1.1rem' }}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              {option?.name} ({option?.code})
            </Button>
          ))}
          {filteredFiats.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No currencies found</Typography>
          )}
        </Box>
      </div>
    );
  };

  const contentCrypto = () => {
    // Include XEC in the crypto list for Goods & Services (users can pay directly in XEC)
    const filteredCrypto = LIST_COIN.filter(option => {
      return `${option?.name} (${option?.ticker})`.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
      <div className="content-crypto">
        {searchTextField}
        <Box sx={{ mt: 1, maxHeight: 'calc(100vh - 260px)', overflow: 'auto', px: 2 }}>
          {filteredCrypto.map(option => (
            <Button
              key={option?.ticker}
              onClick={() => handleSelect(option)}
              fullWidth
              variant="text"
              style={{ fontSize: '1.1rem', textTransform: 'none' }}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              {option?.name} {option?.isDisplayTicker && `(${option?.ticker})`}
            </Button>
          ))}
          {filteredCrypto.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No crypto found</Typography>
          )}
        </Box>
      </div>
    );
  };

  return (
    <StyledDialog
      fullScreen={fullScreen}
      open={isOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
      aria-labelledby={titleId}
    >
      <DialogTitle id={titleId}>
        <IconButton className="back-btn" onClick={handleClose} aria-label="Close">
          <ChevronLeft />
        </IconButton>
        <Typography style={{ fontSize: '20px', fontWeight: 'bold' }}>Select currency</Typography>
        <Button variant="contained" className="btn-clear" onClick={handleClear}>
          Clear
        </Button>
      </DialogTitle>
      <DialogContent>
        <StyledTabs value={value} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Fiat" />
          <Tab label="Crypto" />
        </StyledTabs>
        <Box sx={{ p: 2 }}>
          {value === 0 && contentFiat()}
          {value === 1 && contentCrypto()}
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default ShoppingCurrencyModal;
