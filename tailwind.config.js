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
          blue: "#007AFF",
          green: "#34C759",
          red: "#FF3B30",
          orange: "#FF9500",
          purple: "#AF52DE",
          cyan: "#32ADE6",
          indigo: "#5856D6",
          pink: "#FF2D55",
          yellow: "#FFCC00",
          teal: "#30B0C7",
          mint: "#00C7BE",
          bg: {
            light: "#F2F2F7",
            dark: "#000000",
          },
          card: {
            light: "#FFFFFF",
            dark: "#1C1C1E",
          },
          secondary: {
            light: "#F8F9FA",
            dark: "#2C2C2E",
          },
          chip: {
            light: "#E5E5EA",
            dark: "#2C2C2E",
          },
          border: {
            light: "#E5E5EA",
            dark: "#38383A",
          },
          text: {
            primaryLight: "#000000",
            primaryDark: "#FFFFFF",
            secondaryLight: "#6C6C70",
            secondaryDark: "#8E8E93",
            tertiaryLight: "#8E8E93",
            tertiaryDark: "#636366",
          },
        },
      },
    },
  },
  plugins: [],
};
