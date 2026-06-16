import type { TextStyle } from 'react-native';

/**
 * Times Edu brand tokens.
 * Core palette per brand spec: navy #1D3557, gold #B38B4D, white #FFFFFF, beige #F9F5EF.
 * Supporting shades + semantic colors derived for a cohesive, accessible system.
 */
export const colors = {
  navy900: '#14253D',
  navy800: '#1D3557', // core navy
  navy700: '#274A73',
  ink: '#1A2235',

  gold: '#B38B4D', // core gold
  goldBright: '#D8B877',
  goldDeep: '#8F6E3A',

  paper: '#F9F5EF', // core beige
  paper2: '#F1EADD',
  paper3: '#E9DFCD',
  line: '#E3DAC9',

  slate: '#5B6678',
  slate2: '#8A93A4',

  green: '#2F8F6B',
  amber: '#C2872B',
  danger: '#B4452F',
  blue: '#335C8A',

  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Font family names match the @expo-google-fonts packages loaded in App.tsx. */
export const fonts = {
  serifMedium: 'Spectral_500Medium',
  serifSemi: 'Spectral_600SemiBold',
  serifBold: 'Spectral_700Bold',
  serifItalic: 'Spectral_500Medium_Italic',
  sansRegular: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansSemi: 'HankenGrotesk_600SemiBold',
  sansBold: 'HankenGrotesk_700Bold',
} as const;

export const shadow = {
  card: {
    shadowColor: colors.navy800,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  gold: {
    shadowColor: colors.goldDeep,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

/** Shared text presets to keep typography consistent across screens. */
export const text: Record<string, TextStyle> = {
  eyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.slate2,
  },
  h1: { fontFamily: fonts.serifSemi, fontSize: 30, color: colors.ink, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.ink, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.serifSemi, fontSize: 17, color: colors.ink },
  body: { fontFamily: fonts.sansRegular, fontSize: 15, lineHeight: 23, color: colors.ink },
  bodyMuted: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.slate },
  label: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink },
  caption: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.slate2 },
};

export const gradients = {
  navy: [colors.navy700, colors.navy800, colors.navy900] as const,
  gold: [colors.goldBright, colors.gold, colors.goldDeep] as const,
};
