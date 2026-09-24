'use client';

import { LIST_COIN } from '@/src/store/constants';
import { UtxoContext } from '@/src/store/context/utxoProvider';
import { FilterCurrencyType } from '@/src/store/type/types';
import { COIN, LIST_CURRENCIES_USED } from '@bcpros/lixi-models';
import {
  accountsApi,
  getSelectedAccount,
  getSelectedWalletPath,
  parseCashAddressToPrefix,
  showToast,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import { CopyAllOutlined, SettingsOutlined, Wallet } from '@mui/icons-material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import FilterListIcon from '@mui/icons-material/FilterList';
import Person2Icon from '@mui/icons-material/Person2';
import { Button, IconButton, Popover, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useContext, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import useAuthorization from '../Auth/use-authorization.hooks';
import ShoppingCurrencyModal from '../FilterList/ShoppingCurrencyModal';

const StyledHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  '.greeting': {
    '.handle-name': {
      fontWeight: 600
    }
  },

  '.right-section': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  '.currency-filter-btn': {
    width: '40px',
    height: '40px',
    padding: '8px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&:hover': {
      backgroundColor: 'rgba(0, 118, 196, 0.08)'
    },

    '.flag-icon': {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      objectFit: 'cover'
    },

    '.crypto-icon': {
      width: '24px',
      height: '24px',
      objectFit: 'contain'
    },

    '.ecash-icon': {
      width: '24px',
      height: '24px',
      objectFit: 'contain'
    }
  }
}));

const PopoverStyled = styled('div')(({ theme }) => ({
  padding: '8px 10px',
  background: theme.palette.background.paper,

  '.heading-profile': {
    fontWeight: 600,
    fontSize: 20,
    marginBottom: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  '.item-address, .item-amount': {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 7
  },
  '.address-amount': {
    fontSize: 14,
    color: theme.palette.text.secondary
  },
  '.no-border-btn': {
    padding: 0,
    minWidth: 0
  },

  button: {
    color: theme.palette.text.secondary
  }
}));

const StyledAvatar = styled('div')(({ theme }) => ({
  width: '1.55em',
  height: '1.55em',
  borderRadius: 50,
  overflow: 'hidden',
  display: 'inline-block',
  border: '2px solid #0076c4',
  backgroundImage: 'url("./eCash.svg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  '& img': {
    width: '100%',
    objectFit: 'cover'
  }
}));

interface ShoppingHeaderProps {
  selectedCurrency: string | null;
  onCurrencyChange: (currency: FilterCurrencyType) => void;
}

export default function ShoppingHeader({ selectedCurrency, onCurrencyChange }: ShoppingHeaderProps) {
  const dispatch = useLixiSliceDispatch();
  const router = useRouter();
  const { data, status } = useSession();
  const askAuthorization = useAuthorization();
  const { totalValidAmount } = useContext(UtxoContext);
  const selectedWalletPath = useLixiSliceSelector(getSelectedWalletPath);
  const selectedAccount = useLixiSliceSelector(getSelectedAccount);

  const { useGetLocaleCashAvatarQuery } = accountsApi;
  const { data: avatarPath } = useGetLocaleCashAvatarQuery(
    { accountId: selectedAccount?.id },
    { skip: !selectedAccount }
  );

  // Use useMemo to derive address from selectedWalletPath to handle wallet changes
  const address = useMemo(
    () => parseCashAddressToPrefix(COIN.XEC, selectedWalletPath?.cashAddress),
    [selectedWalletPath?.cashAddress]
  );
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [openCurrencyModal, setOpenCurrencyModal] = useState(false);
  const [flagLoadError, setFlagLoadError] = useState<Record<string, boolean>>({});
  const open = Boolean(anchorEl);

  // Get currency info for displaying flag or crypto icon
  const currencyInfo = useMemo(() => {
    if (!selectedCurrency) return null;

    // Check if it's a fiat currency
    const fiatCurrency = LIST_CURRENCIES_USED.find(c => c.code === selectedCurrency);
    if (fiatCurrency) {
      return {
        type: 'fiat',
        countryCode: fiatCurrency.country,
        code: fiatCurrency.code
      };
    }

    // Check if it's a crypto currency
    const cryptoCurrency = LIST_COIN.find(c => c.ticker === selectedCurrency);
    if (cryptoCurrency) {
      return {
        type: 'crypto',
        ticker: cryptoCurrency.ticker,
        name: cryptoCurrency.name
      };
    }

    return null;
  }, [selectedCurrency]);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      askAuthorization();
    } else {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return;

    return address.slice(0, 5) + '...' + address.slice(-8);
  };

  const handleCurrencySelect = (currency: FilterCurrencyType) => {
    onCurrencyChange(currency);
    setOpenCurrencyModal(false);
  };

  const contentMoreAction = (
    <PopoverStyled>
      <Typography
        onClick={() => router.push(`/profile?address=${selectedAccount?.address}`)}
        className="heading-profile"
      >
        <span>Profile</span>
        <Button className="no-border-btn" endIcon={<Person2Icon />} />
      </Typography>
      <Typography onClick={() => router.push('/wallet')} className="heading-profile">
        <span>Wallet</span>
        <Button className="no-border-btn" endIcon={<Wallet />} />
      </Typography>
      <Typography variant="body1" align="center" className="item-address">
        <span className="address-amount"> {formatAddress(address)}</span>
        <CopyToClipboard
          text={address}
          onCopy={() => {
            dispatch(
              showToast('info', {
                message: 'info',
                description: 'Address copied to clipboard'
              })
            );
          }}
        >
          <Button className="no-border-btn" endIcon={<CopyAllOutlined />} />
        </CopyToClipboard>
      </Typography>
      <Typography className="item-amount">
        <span className="address-amount">
          {totalValidAmount} {COIN.XEC}
        </span>
      </Typography>
      <Typography onClick={() => router.push('/settings')} className="heading-profile">
        <span>Settings</span>
        <Button className="no-border-btn" endIcon={<SettingsOutlined />} />
      </Typography>
    </PopoverStyled>
  );

  return (
    <>
      <StyledHeader>
        <div className="greeting">
          <Typography variant="body2">Hello</Typography>
          <Typography className="handle-name" variant="body1">
            {data?.user.name ?? 'Anonymous'}
          </Typography>
        </div>
        <div className="right-section">
          <IconButton className="currency-filter-btn" onClick={() => setOpenCurrencyModal(true)}>
            {!currencyInfo ? (
              // No currency selected - show filter icon
              <FilterListIcon color="primary" />
            ) : currencyInfo.type === 'fiat' ? (
              // Fiat currency - show country flag or fallback to filter icon
              flagLoadError[currencyInfo.code] ? (
                <FilterListIcon color="primary" />
              ) : (
                <img
                  className="flag-icon"
                  src={`https://flagcdn.com/w40/${currencyInfo.countryCode.toLowerCase()}.png`}
                  alt={currencyInfo.code}
                  onError={() => setFlagLoadError(prev => ({ ...prev, [currencyInfo.code]: true }))}
                />
              )
            ) : // Crypto currency - show eCash logo for XEC, otherwise ticker text
            currencyInfo.ticker === 'XEC' ? (
              <img className="ecash-icon" src="./eCash.svg" alt="eCash" />
            ) : (
              <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', fontSize: '11px' }}>
                {currencyInfo.ticker}
              </Typography>
            )}
          </IconButton>
          <IconButton onClick={e => handlePopoverOpen(e)}>
            {avatarPath?.getLocaleCashAvatar ? (
              <StyledAvatar>
                <picture>
                  <img src={avatarPath.getLocaleCashAvatar} alt="" />
                </picture>
              </StyledAvatar>
            ) : (
              <AccountCircleRoundedIcon className="account-avatar-default" fontSize="large" />
            )}
          </IconButton>
        </div>
        <Popover
          id="mouse-over-popover"
          onClose={() => setAnchorEl(null)}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          {contentMoreAction}
        </Popover>
      </StyledHeader>
      <ShoppingCurrencyModal
        isOpen={openCurrencyModal}
        setSelectedItem={handleCurrencySelect}
        onDismissModal={value => setOpenCurrencyModal(value)}
      />
    </>
  );
}
