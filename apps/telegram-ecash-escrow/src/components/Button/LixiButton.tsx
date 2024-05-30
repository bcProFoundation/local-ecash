import { Button } from '@mui/material';
import stylex from '@stylexjs/stylex';
import React, { ReactNode } from 'react';

import { lixiButtonStyles } from './LixiButton.stylex';

interface LixiButtonProps {
  variant: string;
  children?: ReactNode;
}

const LixiButton: React.FC<LixiButtonProps> = ({ variant, children }) => {
  return (
    <Button {...stylex.props(lixiButtonStyles.base, lixiButtonStyles[variant])}>
      {children}
    </Button>
  );
};

export default LixiButton;
