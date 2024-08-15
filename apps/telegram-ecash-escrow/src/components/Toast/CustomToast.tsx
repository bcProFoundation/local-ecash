'use client';

import { Alert, AlertColor, Snackbar } from '@mui/material';
import React from 'react';

interface CustomToastProps {
  isOpen: boolean;
  content: string;
  type: AlertColor;
  isLink?: boolean;
  linkDescription?: string;
  handleClose: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({
  handleClose,
  isOpen,
  isLink = false,
  content,
  linkDescription,
  type
}) => {
  return (
    <>
      <Snackbar
        open={isOpen}
        autoHideDuration={1200}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} variant="filled" severity={type} sx={{ width: '100%' }}>
          {isLink ? (
            <a href={linkDescription} target="_blank">
              {content}
            </a>
          ) : (
            content
          )}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomToast;
