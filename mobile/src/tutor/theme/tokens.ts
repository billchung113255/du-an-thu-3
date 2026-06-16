import { TextStyle, ViewStyle } from 'react-native';
import type { Curriculum } from '../types/models';

/**
 * Times Edu brand tokens.
 * Core brand colors are fixed by the brand guide: gold #B38B4D, navy #1D3557,
 * white #FFFFFF, beige #F9F5EF. Supporting tones are derived from these.
 */
export const colors = {
  navy: '#1D3557',
  navy800: '#27406A',
  navy700: '#33517F',
  gold: '#B38B4D',
  goldSoft: '#D4B883',
  beige: '#F9F5EF',
  white: '#FFFFFF',
  card: '#FFFFFF',
  parchment: '#F1ECE1',
  ink: '#1D2B45',
  inkOnNavy: '#EDE7DA',
  slate: '#6A7282',
  slate2: '#9AA1AD',
  line: '#ECE5D8',
  line2: '#F3EEE4',
  ok: '#2E7D5B',
  okBg: '#E8F2EC',
  warn: '#B0822E',
  warnBg: '#F7EFD9',
  overlay: 'rgba(29,53,87,0.55)',
} as const;

/** Per-curriculum accent colors used for tags, avatars and scannable cues. */
export const curriculumColor: Record<Curriculum, { fg: string; bg: string }> = {
  IGCSE: { fg: '#2C6E6A', bg: '#E2EEEC' },
  'A Level': { fg: '#A9772A', bg: '#F5EBD6' },
  IB: { fg: '#8A3B3B', bg: '#F2E3E2' },
  AP: { fg: '#3E5C8A', bg: '#E4EAF3' },
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = { sm: 8, md: 11, lg: 16, xl: 20, pill: 999 } as const;

/**
 * Display (Fraunces) and body (Inter) families are part of the brand identity.
 * TODO(fonts): add the font files via expo-font or `npx react-native-asset`,
 * then set the families below. Until then, screens fall back to system fonts
 * and rely on weight/size for hierarchy.
 */
export const fonts = {
  display: undefined as string | undefined, // e.g. 'Fraunces'
  body: undefined as string | undefined, // e.g. 'Inter'
};

/** Apply the display family only when it has been wired, so we never set an
 *  unknown fontFamily that renders inconsistently across platforms. */
export const displayText = (extra?: TextStyle): TextStyle => ({
  ...(fonts.display ? { fontFamily: fonts.display } : null),
  ...extra,
});

export const shadow: Record<'card' | 'hero' | 'sheet', ViewStyle> = {
  card: {
    shadowColor: '#1D3557',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  hero: {
    shadowColor: '#1D3557',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
};
