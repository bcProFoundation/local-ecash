import { Button } from '@mui/material';
import stylex from '@stylexjs/stylex';
import React, { ReactNode } from 'react';

import { lixiButtonStyles } from './LixiButton.stylex';

interface LixiButtonProps {
  variant: string;
  icon?: any;
  children?: ReactNode;
}

const LixiButton: React.FC<LixiButtonProps> = ({ variant, children, icon }) => {
  return (
    <Button {...stylex.props(lixiButtonStyles.base, lixiButtonStyles[variant])}>
      {icon && icon} &nbsp;
      {children}
    </Button>
  );
};

export default LixiButton;
