/**
 * Canonical Times Edu brand tokens shared by the root shell (login, gate).
 * Each feature module (student/, tutor/) keeps its own derived token file;
 * this is the single source for surfaces that live above both modules.
 * Core palette: navy #1D3557, gold #B38B4D, white #FFFFFF, beige #F9F5EF.
 */
export const brand = {
  navy900: '#14253D',
  navy800: '#1D3557',
  navy700: '#274A73',
  gold: '#B38B4D',
  goldBright: '#D8B877',
  goldDeep: '#8F6E3A',
  paper: '#F9F5EF',
  paper2: '#F1EADD',
  line: '#E3DAC9',
  ink: '#1A2235',
  slate: '#5B6678',
  slate2: '#8A93A4',
  white: '#FFFFFF',
  teal: '#2C6E6A',
} as const;

export const brandFonts = {
  serifSemi: 'Spectral_600SemiBold',
  serifBold: 'Spectral_700Bold',
  sansRegular: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansSemi: 'HankenGrotesk_600SemiBold',
  sansBold: 'HankenGrotesk_700Bold',
} as const;

export const supportEmail = 'admin@times.edu.vn';
