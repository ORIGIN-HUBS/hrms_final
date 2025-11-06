import colors, { gradients } from './colors';
import typography from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;

export default theme;

