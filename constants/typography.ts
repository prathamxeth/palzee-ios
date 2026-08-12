import { Platform } from 'react-native';

export const Fonts = {
  Bricolage: 'bricolage_grotesque_variable',
  CourierPrime: 'courier_prime',
  DelaGothicOne: 'dela_gothic_one_regular',
  GoogleSans: 'google_sans_regular',
  IBMPlexMono: 'ibm_plex_mono',
  JetBrainsMono: 'jetbrains_mono_regular',
  Ownglyph: 'ownglyph',
  RobotoMediumNumbers: 'roboto_medium_numbers',
  RobotoMono: 'roboto_mono_regular',
  RobotoSlab: 'roboto_slab_regular',
  SpaceMono: 'space_mono_regular',
  Unpack: 'unpack',
  SystemRounded: Platform.OS === 'ios' ? '.AppleSystemUIFontRounded-Regular' : 'sans-serif-rounded',
  SystemRoundedBold: Platform.OS === 'ios' ? '.AppleSystemUIFontRounded-Bold' : 'sans-serif-rounded',
  SystemRoundedMedium: Platform.OS === 'ios' ? '.AppleSystemUIFontRounded-Medium' : 'sans-serif-rounded',
  SystemRoundedSemibold: Platform.OS === 'ios' ? '.AppleSystemUIFontRounded-Semibold' : 'sans-serif-rounded',
};

export const Typography = {
  displayLarge: {
    fontFamily: Fonts.Bricolage,
    fontSize: 72,
    lineHeight: 72,
    letterSpacing: -1.8,
  },
  displayMedium: {
    fontFamily: Fonts.Bricolage,
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -1.0,
  },
  titleLarge: {
    fontFamily: Fonts.Ownglyph,
    fontSize: 24,
    lineHeight: 28,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  labelLarge: {
    fontWeight: '700' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
};
