import { brand } from '@bambam/shared';

export const adminTheme = {
  colors: {
    ...brand.colors,
    adminSurface: '#F0F5EF',
    ink: '#16311D'
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
