'use client';

import { ChevronLeft } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Slide,
  TextField,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import React, { useState } from 'react';

interface FilterListModalProps {
  isOpen: boolean;
  listItems: any;
  onDismissModal?: (value: boolean) => void;
  setSelectedItem?: (value: any) => void;
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
    padding: '0 16px',
    paddingTop: '16px',
    fontSize: '26px',
    textAlign: 'center'
  },

  '.MuiDialogContent-root': {
    padding: 0
  },

  button: {
    color: theme.palette.text.secondary
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

const FilterListModal: React.FC<FilterListModalProps> = props => {
  const { isOpen, listItems, onDismissModal, setSelectedItem } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = value => {
    setSelectedItem(value);
    onDismissModal(false);
  };

  const filteredOptions = listItems.filter(option => option?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <React.Fragment>
      <StyledDialog
        fullScreen={fullScreen}
        open={isOpen}
        onClose={() => props.onDismissModal!(false)}
        TransitionComponent={Transition}
      >
        <IconButton className="back-btn" onClick={() => props.onDismissModal!(false)}>
          <ChevronLeft />
        </IconButton>
        <DialogContent>
          <Box sx={{ p: 2, width: '90%' }}>
            <TextField
              label="Search"
              variant="filled"
              fullWidth
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
              autoFocus
            />
            <Box sx={{ mt: 1 }}>
              {filteredOptions.map(option => (
                <Button
                  key={option?.id}
                  onClick={() => handleSelect(option)}
                  fullWidth
                  variant="text"
                  style={{ textTransform: 'capitalize', fontSize: '1.1rem' }}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {option?.name}
                </Button>
              ))}
              {filteredOptions.length === 0 && (
                <Button
                  variant="text"
                  style={{ textTransform: 'capitalize', fontSize: '1.1rem' }}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  Nothing here
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </StyledDialog>
    </React.Fragment>
  );
};

export default FilterListModal;
