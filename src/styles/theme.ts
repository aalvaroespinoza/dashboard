/**
 * Tokens de diseño semánticos oficiales Apple Human Interface Guidelines (HIG) para iOS / iPadOS 18
 * Paleta adaptativa Light / Dark mode, Sistema de 4 Capas de Superficie, Jerarquía de 4 Etiquetas de Texto y Físicas Spring
 */

export const APPLE_ACCENT = {
  blue: { light: '#007AFF', dark: '#0A84FF' },
  red: { light: '#FF3B30', dark: '#FF453A' },
  green: { light: '#34C759', dark: '#30D158' },
  orange: { light: '#FF9500', dark: '#FF9F0A' },
  yellow: { light: '#FFCC00', dark: '#FFD60A' },
  purple: { light: '#AF52DE', dark: '#BF5AF2' },
  pink: { light: '#FF2D55', dark: '#FF375F' },
  teal: { light: '#30B0C7', dark: '#40C8E0' },
  indigo: { light: '#5856D6', dark: '#5E5CE6' },
  mint: { light: '#00C7BE', dark: '#63E6E2' },
  cyan: { light: '#32ADE6', dark: '#64D2FF' },
};

export type AppleAccentName = keyof typeof APPLE_ACCENT;

export const getAppleAccent = (name: AppleAccentName, isDark: boolean = true): string => {
  const colorObj = APPLE_ACCENT[name] || APPLE_ACCENT.blue;
  return isDark ? colorObj.dark : colorObj.light;
};

export const IOS_COLORS = {
  // Acentos de Sistema Apple (Valores base adaptativos)
  blue: '#007AFF',
  green: '#34C759',
  red: '#FF3B30',
  orange: '#FF9500',
  purple: '#AF52DE',
  cyan: '#32ADE6',
  indigo: '#5856D6',
  pink: '#FF2D55',
  yellow: '#FFCC00',
  teal: '#30B0C7',
  mint: '#00C7BE',

  // 1. Modo Claro (Light Mode)
  light: {
    // Fondos y Superficies (System Backgrounds)
    background: '#FFFFFF',          // System Background
    canvas: '#F2F2F7',              // Secondary Grouped Background
    groupedBackground: '#F2F2F7',   // Secondary Background (Grouped Layouts)
    card: '#FFFFFF',                // Tertiary Background (Cards / List rows)
    cardSecondary: '#F2F2F7',       // Secondary card surface
    cardTertiary: '#E5E5EA',        // Elevated card surface
    surfaceElevated: '#E5E5EA',     // Elevated / Quaternary (Chips, Search, Modals)
    chip: '#E5E5EA',                // Elevated chips
    border: '#E5E5EA',              // System Separator / Border (Quaternary)
    borderSubtle: '#F2F2F7',        // Subtle separator
    borderHighlight: 'rgba(255, 255, 255, 0.9)',

    // Jerarquía de Textos (System Labels)
    text: {
      primary: '#000000',           // Primary Label (100% opacity)
      secondary: '#8A8A8E',         // Secondary Label (60% opacity)
      tertiary: '#C7C7CC',          // Tertiary Label (30% opacity)
      quaternary: '#E5E5EA',        // Quaternary Label (18% opacity)
    },

    // Acentos adaptados para Light Mode
    accent: {
      blue: APPLE_ACCENT.blue.light,
      red: APPLE_ACCENT.red.light,
      green: APPLE_ACCENT.green.light,
      orange: APPLE_ACCENT.orange.light,
      yellow: APPLE_ACCENT.yellow.light,
      purple: APPLE_ACCENT.purple.light,
      pink: APPLE_ACCENT.pink.light,
      teal: APPLE_ACCENT.teal.light,
      indigo: APPLE_ACCENT.indigo.light,
      mint: APPLE_ACCENT.mint.light,
      cyan: APPLE_ACCENT.cyan.light,
    },

    sidebar: 'rgba(255, 255, 255, 0.88)',
    sidebarBorder: '#E5E5EA',
    sidebarActive: 'rgba(0, 122, 255, 0.12)',
  },

  // 2. Modo Oscuro (Dark Mode)
  dark: {
    // Fondos y Superficies (System Backgrounds)
    background: '#000000',          // System Background (OLED True Black)
    canvas: '#000000',              // Base canvas
    groupedBackground: '#000000',   // Grouped background
    card: '#1C1C1E',                // Secondary Background (Elevated cards)
    cardSecondary: '#2C2C2E',       // Tertiary Background (Inner cards/cells)
    cardTertiary: '#3A3A3C',        // Quaternary Background
    surfaceElevated: '#3A3A3C',     // Elevated / Quaternary (Chips, Search, Modals)
    chip: '#2C2C2E',                // Chips
    border: 'rgba(255, 255, 255, 0.10)', // System Separator / Border
    borderSubtle: '#242426',        // Subtle separator
    borderHighlight: 'rgba(255, 255, 255, 0.12)', // Micro-borde de luz superior
    borderSide: 'rgba(255, 255, 255, 0.05)',

    // Jerarquía de Textos (System Labels)
    text: {
      primary: '#FFFFFF',           // Primary Label (100% opacity)
      secondary: '#8E8E93',         // Secondary Label (60% opacity)
      tertiary: '#636366',          // Tertiary Label (30% opacity)
      quaternary: '#38383A',        // Quaternary Label (18% opacity)
    },

    // Acentos adaptados para Dark Mode
    accent: {
      blue: APPLE_ACCENT.blue.dark,
      red: APPLE_ACCENT.red.dark,
      green: APPLE_ACCENT.green.dark,
      orange: APPLE_ACCENT.orange.dark,
      yellow: APPLE_ACCENT.yellow.dark,
      purple: APPLE_ACCENT.purple.dark,
      pink: APPLE_ACCENT.pink.dark,
      teal: APPLE_ACCENT.teal.dark,
      indigo: APPLE_ACCENT.indigo.dark,
      mint: APPLE_ACCENT.mint.dark,
      cyan: APPLE_ACCENT.cyan.dark,
    },

    sidebar: 'rgba(18, 18, 20, 0.88)',
    sidebarBorder: '#2C2C2E',
    sidebarActive: 'rgba(10, 132, 255, 0.18)',
  },
};

export const IOS_SPRINGS = {
  snappy: { damping: 18, stiffness: 220, mass: 1 },
  bouncy: { damping: 14, stiffness: 240, mass: 1 },
  smooth: { damping: 22, stiffness: 180, mass: 1 },
  gentle: { damping: 26, stiffness: 140, mass: 1 },
};

export const IOS_FONTS = {
  regular: 'SF-Pro-Display-Regular',
  semibold: 'SF-Pro-Display-Semibold',
  bold: 'SF-Pro-Display-Bold',
  roundedMedium: 'SF-Pro-Rounded-Medium',
  rounded: 'SF-Pro-Rounded-Bold',
  roundedHeavy: 'SF-Pro-Rounded-Heavy',
  mono: 'JetBrainsMono-Bold',
};

export const getIosTheme = (isDark: boolean) => {
  return isDark ? IOS_COLORS.dark : IOS_COLORS.light;
};

/**
 * Helper oficial para píldoras / badges estilo Glass / Tinted Pills:
 * Fondo translúcido al 12%-15% con texto/icono al 100% de saturación adaptativo.
 */
export const getTintStyle = (color: string, isDark: boolean = true, opacity: number = 0.15) => {
  let bg = `rgba(0, 122, 255, ${opacity})`;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      bg = `rgba(${r}, ${g}, ${b}, ${isDark ? opacity + 0.03 : opacity})`;
    }
  } else if (color.startsWith('rgb')) {
    bg = color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }

  return {
    backgroundColor: bg,
    color: color,
  };
};

/**
 * Estilo base para tarjetas Bento con micro-bordes de luz especular
 */
export const getSpecularCardStyle = (isDark: boolean = true) => {
  return {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)',
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
    borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
    borderRightColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
  };
};
