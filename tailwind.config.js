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
            tertiaryDark: "#48484A",
            quaternaryLight: "#E5E5EA",
            quaternaryDark: "#38383A",
          },
        },
      },
    },
  },
  plugins: [],
};
