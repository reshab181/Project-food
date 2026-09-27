// ── Bam Bam Customer Theme ────────────────────────────────────────────────────
// Design direction: minimal, bakery-inspired, editorial.
// Warm off-white background · muted sage green accent · terracotta secondary
// Charcoal text · no gradients, no heavy rounded boxes, no bold weights.

export const fonts = {
  light:    'BricolageGrotesque_300Light',
  regular:  'BricolageGrotesque_400Regular',
  medium:   'BricolageGrotesque_500Medium',
  semiBold: 'BricolageGrotesque_600SemiBold'
} as const;

// Type scale: hierarchy through size + spacing, NOT weight.
// Max weight used anywhere = semiBold (600). No bold/ExtraBold.
export const type = {
  // Wordmark / page-level hero — larger but calm
  display: { fontFamily: fonts.medium,   fontSize: 28, lineHeight: 34, letterSpacing: 0.6 },
  // Screen & card headings
  heading: { fontFamily: fonts.medium,   fontSize: 20, lineHeight: 26, letterSpacing: 0.2 },
  // Section labels, product names
  title:   { fontFamily: fonts.regular,  fontSize: 16, lineHeight: 22, letterSpacing: 0.1 },
  // Body copy
  body:    { fontFamily: fonts.regular,  fontSize: 14, lineHeight: 21 },
  // Subtitles, captions, metadata
  caption: { fontFamily: fonts.light,    fontSize: 12, lineHeight: 17, letterSpacing: 0.2 },
  // Button / chip labels
  label:   { fontFamily: fonts.medium,   fontSize: 14, lineHeight: 20, letterSpacing: 0.3 },
  // Prices
  price:   { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20, letterSpacing: 0.1 },
  // Text inputs
  input:   { fontFamily: fonts.regular,  fontSize: 14, lineHeight: 21 },
  // Small allcaps section divider text
  overline:{ fontFamily: fonts.medium,   fontSize: 11, lineHeight: 16, letterSpacing: 1.2 },
} as const;

// Palette: 4 tones only.
// bg       — warm off-white   #F8F6F2
// surface  — pure white       #FFFFFF
// accent   — muted sage green #4A7C59  (replaces the bright #1E8E3E everywhere)
// warm     — soft terracotta  #A0522D  (secondary highlights only)
// text     — dark charcoal    #2B2B2B  (not pure black)
// textSoft — warm mid-gray    #7A7570
// border   — hairline warm    #E8E3DC
export const palette = {
  bg:          '#F8F6F2',
  surface:     '#FFFFFF',
  accent:      '#4A7C59',
  accentLight: '#EEF4F0',  // tint for chips / selected states
  warm:        '#A0522D',
  warmLight:   '#F7F0E8',  // tint for warm surfaces
  text:        '#2B2B2B',
  textSoft:    '#7A7570',
  textFaint:   '#B0AAA4',
  border:      '#E8E3DC',
  hairline:    '#EDE8E1',
  error:       '#B5342A',
  white:       '#FFFFFF',
  // keep compatible aliases used by existing code
  primary:     '#4A7C59',
  primaryDark: '#2E5438',
  secondary:   '#A0522D',
  accent2:     '#A0522D',
  background:  '#F8F6F2',
  mutedSurface:'#F3F0EC',
  textMuted:   '#7A7570',
  pureVeg:     '#4A7C59',
  success:     '#3B7A57',
  cardShadow:  'rgba(0,0,0,0)',  // no shadows in minimal design
  overlay:     'rgba(43,43,43,0.45)',
} as const;

export const customerTheme = {
  colors: palette,
  spacing: {
    xs:  8,
    sm:  14,
    md:  20,
    lg:  28,
    xl:  40,
    xxl: 56,
  },
  radius: {
    xs:  6,
    sm:  10,
    md:  14,
    lg:  20,
    pill: 999,
  },
  fonts,
  type,
} as const;
