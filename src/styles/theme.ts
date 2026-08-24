/**
 * Tokens de diseño semánticos estilo iOS / iPadOS (Human Interface Guidelines)
 * Paleta Light / Dark mode y Acentos de Sistema
 */

export const IOS_COLORS = {
  // Acentos del sistema iOS
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
    card: '#FFFFFF',            // iOS Secondary System Grouped Background (Cards)
    cardSecondary: '#F8F9FA',   // Secondary Card / Subtle containers
    chip: '#E5E5EA',            // Chip & Pills background
    border: '#E5E5EA',          // System Separator / Border
    borderSubtle: '#F2F2F7',    // Subtle separator
    text: {
      primary: '#000000',       // Label
      secondary: '#6C6C70',     // Secondary Label
      tertiary: '#8E8E93',      // Tertiary Label
      quaternary: '#C7C7CC',    // Quaternary Label
    },
    sidebar: '#FFFFFF',         // Sidebar background in iPadOS
    sidebarActive: 'rgba(0, 122, 255, 0.12)', // Active tint for sidebar
  },

  dark: {
    background: '#000000',      // iOS OLED System Background
    card: '#1C1C1E',            // iOS System Grouped Secondary Background (Cards)
    cardSecondary: '#2C2C2E',   // iOS System Grouped Tertiary Background (Chips/Sub-cards)
    chip: '#2C2C2E',            // Chip & Pills background
    border: '#38383A',          // System Separator / Border
    borderSubtle: '#2C2C2E',    // Subtle separator
    text: {
      primary: '#FFFFFF',       // Label
      secondary: '#8E8E93',     // Secondary Label
      tertiary: '#636366',      // Tertiary Label
      quaternary: '#48484A',    // Quaternary Label
    },
    sidebar: '#121214',         // Sidebar background in iPadOS
    sidebarActive: 'rgba(0, 122, 255, 0.20)', // Active tint for sidebar
  },
};

export const getIosTheme = (isDark: boolean) => {
  return isDark ? IOS_COLORS.dark : IOS_COLORS.light;
};
