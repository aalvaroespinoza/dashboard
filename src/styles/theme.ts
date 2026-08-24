/**
 * Tokens de diseño semánticos estilo iOS / iPadOS 18 (Apple Human Interface Guidelines)
 * Paleta Light / Dark mode, Sistema de Capas, Luces Especulares y Físicas Spring
 */

export const IOS_COLORS = {
  // Acentos de Sistema Apple
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

  light: {
    background: '#F2F2F7',      // iOS System Grouped Background
    canvas: '#F2F2F7',
    card: '#FFFFFF',            // iOS System Grouped Secondary Background (Cards)
    cardSecondary: '#E5E5EA',   // Secondary Card / Subtle containers
    surfaceElevated: '#FFFFFF', // Elevated sheets & modals
    chip: '#E5E5EA',            // Chip & Pills background
    border: '#E5E5EA',          // System Separator / Border
    borderSubtle: '#F2F2F7',    // Subtle separator
    borderHighlight: 'rgba(255, 255, 255, 0.8)',
    text: {
      primary: '#000000',       // Label
      secondary: '#6C6C70',     // Secondary Label
      tertiary: '#8E8E93',      // Tertiary Label
      quaternary: '#C7C7CC',    // Quaternary Label
    },
    sidebar: 'rgba(255, 255, 255, 0.85)',
    sidebarBorder: '#E5E5EA',
    sidebarActive: 'rgba(0, 122, 255, 0.12)',
  },

  dark: {
    background: '#000000',      // iOS OLED System Background
    canvas: '#000000',
    card: '#1C1C1E',            // iOS System Grouped Secondary Background (Cards)
    cardSecondary: '#2C2C2E',   // iOS System Grouped Tertiary Background (Chips/Sub-cards)
    surfaceElevated: '#2C2C2E', // Elevated sheets & modals
    chip: '#2C2C2E',            // Chip & Pills background
    border: '#2C2C2E',          // System Separator / Border
    borderSubtle: '#242426',    // Subtle separator
    borderHighlight: 'rgba(255, 255, 255, 0.12)', // Micro-borde de luz superior
    borderSide: 'rgba(255, 255, 255, 0.05)',      // Bordes laterales sutiles
    text: {
      primary: '#FFFFFF',       // Label
      secondary: '#8E8E93',     // Secondary Label
      tertiary: '#636366',      // Tertiary Label
      quaternary: '#48484A',    // Quaternary Label
    },
    sidebar: 'rgba(18, 18, 20, 0.85)',
    sidebarBorder: '#2C2C2E',
    sidebarActive: 'rgba(0, 122, 255, 0.18)',
  },
};

export const IOS_SPRINGS = {
  snappy: { damping: 18, stiffness: 220, mass: 1 },
  bouncy: { damping: 14, stiffness: 240, mass: 1 },
  smooth: { damping: 22, stiffness: 180, mass: 1 },
  gentle: { damping: 26, stiffness: 140, mass: 1 },
};

export const getIosTheme = (isDark: boolean) => {
  return isDark ? IOS_COLORS.dark : IOS_COLORS.light;
};

/**
 * Helper para generar fondos de píldoras / squircles al 15% de opacidad
 * con texto o icono al 100% de saturación.
 */
export const getTintStyle = (color: string, isDark: boolean = true) => {
  // Convertir hex a rgba con 0.15 de opacidad
  let bg = 'rgba(0, 122, 255, 0.15)';
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      bg = `rgba(${r}, ${g}, ${b}, ${isDark ? 0.16 : 0.12})`;
    }
  } else if (color.startsWith('rgb')) {
    bg = color.replace('rgb', 'rgba').replace(')', ', 0.16)');
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
    borderRadius: 28,
    borderWidth: 1,
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)',
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
    borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
    borderRightColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
  };
};
