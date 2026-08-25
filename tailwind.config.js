/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["SF-Pro-Display-Regular", "sans-serif"],
        semibold: ["SF-Pro-Display-Semibold", "sans-serif"],
        bold: ["SF-Pro-Display-Bold", "sans-serif"],
        roundedMedium: ["SF-Pro-Rounded-Medium", "sans-serif"],
        rounded: ["SF-Pro-Rounded-Bold", "sans-serif"],
        roundedHeavy: ["SF-Pro-Rounded-Heavy", "sans-serif"],
        mono: ["JetBrainsMono-Bold", "monospace"],
      },
      colors: {
        // Tokens de Superficie Semánticos
        surface: {
          base: {
            DEFAULT: '#FFFFFF',
            dark: '#000000',
          },
          card: {
            DEFAULT: '#F2F2F7',
            dark: '#1C1C1E',
          },
          elevated: {
            DEFAULT: '#E5E5EA',
            dark: '#2C2C2E',
          },
        },
        // Tokens de Borde Semánticos
        borderSemantic: {
          DEFAULT: '#E5E5EA',
          dark: 'rgba(255, 255, 255, 0.10)',
        },
        // Tokens de Texto Semánticos
        textSemantic: {
          primary: {
            DEFAULT: '#111827',
            dark: '#FFFFFF',
          },
          secondary: {
            DEFAULT: '#6B7280',
            dark: '#8E8E93',
          },
          tertiary: {
            DEFAULT: '#9CA3AF',
            dark: '#636366',
          },
        },
        // Acentos Oficiales Apple iOS
        accent: {
          blue: {
            DEFAULT: '#007AFF',
            dark: '#0A84FF',
            tint: 'rgba(0, 122, 255, 0.15)',
            tintDark: 'rgba(10, 132, 255, 0.20)',
          },
          green: {
            DEFAULT: '#34C759',
            dark: '#30D158',
            tint: 'rgba(52, 199, 89, 0.15)',
            tintDark: 'rgba(48, 209, 88, 0.20)',
          },
          orange: {
            DEFAULT: '#FF9500',
            dark: '#FF9F0A',
            tint: 'rgba(255, 149, 0, 0.15)',
            tintDark: 'rgba(255, 159, 10, 0.20)',
          },
          red: {
            DEFAULT: '#FF3B30',
            dark: '#FF453A',
            tint: 'rgba(255, 59, 48, 0.15)',
            tintDark: 'rgba(255, 69, 58, 0.20)',
          },
          purple: {
            DEFAULT: '#AF52DE',
            dark: '#BF5AF2',
            tint: 'rgba(175, 82, 222, 0.15)',
            tintDark: 'rgba(191, 90, 242, 0.20)',
          },
          cyan: {
            DEFAULT: '#32ADE6',
            dark: '#64D2FF',
            tint: 'rgba(50, 173, 230, 0.15)',
            tintDark: 'rgba(100, 210, 255, 0.20)',
          },
          indigo: {
            DEFAULT: '#5856D6',
            dark: '#5E5CE6',
            tint: 'rgba(88, 86, 214, 0.15)',
            tintDark: 'rgba(94, 92, 230, 0.20)',
          },
          mint: {
            DEFAULT: '#00C7BE',
            dark: '#63E6E2',
            tint: 'rgba(0, 199, 190, 0.15)',
            tintDark: 'rgba(99, 230, 226, 0.20)',
          },
        },
        ios: {
          // Acentos Apple HIG
          blue: "#007AFF",
          blueDark: "#0A84FF",
          green: "#34C759",
          greenDark: "#30D158",
          red: "#FF3B30",
          redDark: "#FF453A",
          orange: "#FF9500",
          orangeDark: "#FF9F0A",
          yellow: "#FFCC00",
          yellowDark: "#FFD60A",
          purple: "#AF52DE",
          purpleDark: "#BF5AF2",
          pink: "#FF2D55",
          pinkDark: "#FF375F",
          teal: "#30B0C7",
          tealDark: "#40C8E0",
          indigo: "#5856D6",
          indigoDark: "#5E5CE6",
          mint: "#00C7BE",
          mintDark: "#63E6E2",
          cyan: "#32ADE6",
          cyanDark: "#64D2FF",

          // 4 Capas de Superficie (System Backgrounds)
          bg: {
            light: "#FFFFFF",
            dark: "#000000",
          },
          grouped: {
            light: "#F2F2F7",
            dark: "#000000",
          },
          card: {
            light: "#FFFFFF",
            dark: "#1C1C1E",
          },
          secondary: {
            light: "#F2F2F7",
            dark: "#2C2C2E",
          },
          tertiary: {
            light: "#FFFFFF",
            dark: "#2C2C2E",
          },
          quaternary: {
            light: "#E5E5EA",
            dark: "#3A3A3C",
          },
          chip: {
            light: "#E5E5EA",
            dark: "#2C2C2E",
          },
          border: {
            light: "#E5E5EA",
            dark: "#2C2C2E",
          },

          // 4 Etiquetas de Texto (System Labels)
          text: {
            primaryLight: "#000000",
            primaryDark: "#FFFFFF",
            secondaryLight: "#8A8A8E",
            secondaryDark: "#8E8E93",
            tertiaryLight: "#C7C7CC",
            tertiaryDark: "#636366",
            quaternaryLight: "#E5E5EA",
            quaternaryDark: "#38383A",
          },
        },
      },
    },
  },
  plugins: [],
};
