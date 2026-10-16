import { brand } from '@bambam/shared';

export const customerTheme = {
  colors: {
    ...brand.colors,
    cardShadow: 'rgba(28, 37, 29, 0.08)',
    overlay: 'rgba(12, 17, 12, 0.5)'
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    pill: 999
  }
} as const;
