export const Colors = {
  // Brand Palette
  PalBlack: '#000000',
  PalWhite: '#FFFFFF',
  PalBackground: '#FFFFFF',
  PalTextDark: '#1A1A1A',
  PalTextMuted: '#666666',

  // Playful Accents (doodle palette)
  PalCloudYellow: '#FDE792',
  PalPizzaOrange: '#FFB443',
  PalOrangeFruit: '#FF921E',
  PalPlantPurple: '#AC87FA',
  PalPlantGreen: '#10B981',
  PalTeaGreen: '#00C896',
  PalFireRed: '#FF5232',
  PalPrimary: '#FF5232',
  PalBingsuBlue: '#60A5FA',
  PalBingsuCherry: '#EF4444',
  PalAmoledBlack: '#000000',

  // Onboarding Background Themes
  Theme1Color: '#FFFFF2',
  Theme2Color: '#F9F9F9',
  Theme3Color: '#FFFFF4',
  Theme4Color: '#FBF7F5',
  Theme5Color: '#F9F1F1',

  // Light Mode Text Accents
  Theme1TextColor: '#E9B7CE',
  Theme2TextColor: '#E9B7CE',
  Theme3TextColor: '#E8BDF9',
  Theme4TextColor: '#F5BFD7',
  Theme5TextColor: '#F6CFBE',

  // Dark Mode Text Accents
  Theme1TextColorDark: '#9E3E64',
  Theme2TextColorDark: '#9E3E64',
  Theme3TextColorDark: '#863A9A',
  Theme4TextColorDark: '#9E3D60',
  Theme5TextColorDark: '#A84622',

  // Border Edge Glow Accents (Theme Switcher Options)
  BorderGlow: {
    blue: '#11D5F3',
    green: '#65EA7B',
    orange: '#FE9068',
    pink: '#FE75F5',
    purple: '#AA6DFE',
    cyan: '#5D96FF',
  },

  // Distinct PALZEE Logo Text Accents per theme (matching Android PAL logoColor scheme)
  LogoTextAccent: {
    blue: '#310BED',
    green: '#FF530A',
    orange: '#0BBEFF',
    pink: '#38D4C2',
    purple: '#FFA600',
    cyan: '#77E4BE',
  },
};

export const PalThemeColors = [
  Colors.Theme1Color,
  Colors.Theme2Color,
  Colors.Theme3Color,
  Colors.Theme4Color,
  Colors.Theme5Color,
];

export const PalLightTextColors = [
  Colors.Theme1TextColor,
  Colors.Theme2TextColor,
  Colors.Theme3TextColor,
  Colors.Theme4TextColor,
  Colors.Theme5TextColor,
];

export const PalDarkTextColors = [
  Colors.Theme1TextColorDark,
  Colors.Theme2TextColorDark,
  Colors.Theme3TextColorDark,
  Colors.Theme4TextColorDark,
  Colors.Theme5TextColorDark,
];

// Profile / Avatar Smiley Color Palette (12 Vibrant Colors)
export const SmileyAvatarColors = [
  '#FFE600', // Vibrant Yellow
  '#FF6700', // Bright Orange
  '#FF073A', // Neon Red
  '#FF007F', // Hot Pink
  '#B000FF', // Deep Purple
  '#310BED', // Electric Violet
  '#00F0FF', // Bright Cyan
  '#00E676', // Spring Green
  '#76FF03', // Lime Green
  '#FFC400', // Amber Gold
  '#FF4081', // Rose Pink
  '#00B0FF', // Deep Sky Blue
];

/**
 * Calculates deterministic profile avatar color for user
 */
export function getSmileyColorForUser(userId?: string | null, index: number = 0): string {
  if (index >= 0 && index < SmileyAvatarColors.length) {
    return SmileyAvatarColors[index % SmileyAvatarColors.length];
  }
  if (userId && userId.length > 0) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const idx = Math.abs(hash) % SmileyAvatarColors.length;
    return SmileyAvatarColors[idx];
  }
  return SmileyAvatarColors[0];
}

