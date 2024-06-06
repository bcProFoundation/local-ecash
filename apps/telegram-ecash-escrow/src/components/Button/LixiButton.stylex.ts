import { colors } from '../../app/globalTokens.stylex';
import * as stylex from '@stylexjs/stylex';

export const lixiButtonStyles: any = stylex.create({
  base: {
    fontSize: '14px',
    fontWeight: 500,
    textTransform: 'initial',
    padding: '8px 16px'
  },
  primary: {
    color: colors.primary,
    background: {
      default: colors.bgTheme,
      ':hover': 'red'
    }
  },
  secondary: {
    color: colors.secondary,
    background: colors.bgTheme
  },
  linear: {
    color: colors.white,
    background: 'linear-gradient(350deg, rgb(111, 45, 189) 22%, rgb(205, 11, 195) 90%)'
  },
  outlined: {
    color: colors.primary,
    background: colors.bgItem,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderItem
  },
  clear: {
    color: colors.primary,
    background: 'transparent'
  }
});
