import { CategorySlug } from './types';

export const brand = {
  appName: 'Bam Bam Cake Shop',
  tagline: '100% Pure Veg Bakery & Fast Food',
  trustMessage: 'No egg, no meat, no non-veg ingredients. Every bite is purely vegetarian.',
  colors: {
    primary: '#1E8E3E',
    primaryDark: '#0D5E25',
    secondary: '#F6B93B',
    accent: '#E67E22',
    background: '#FCFAF6',
    surface: '#FFFFFF',
    mutedSurface: '#F3F6EF',
    text: '#1C251D',
    textMuted: '#68746A',
    border: '#DDE6D8',
    error: '#C0392B',
    success: '#2E7D32',
    pureVeg: '#0F9D58'
  },
  gradients: {
    hero: ['#1E8E3E', '#56AB2F'],
    warm: ['#FFF5DE', '#FCE8B2']
  },
  pureVegBadgeText: '100% Pure Veg',
  categoryLabels: {
    cakes: 'Cakes',
    pizza: 'Pizza',
    burger: 'Burger'
  } as Record<CategorySlug, string>
} as const;
