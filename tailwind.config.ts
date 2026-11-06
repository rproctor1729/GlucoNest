import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nest: {
          50: "#f6f8f7",
          100: "#eaf0ed",
          200: "#d3e0da",
          300: "#afcac0",
          400: "#83ada0",
          500: "#5c9183", // Calm sage / teal signature
          600: "#467469",
          700: "#385d55",
          800: "#2f4c46",
          900: "#283f3b",
          950: "#142220",
        },
        lavender: {
          50: "#f7f5fc",
          100: "#eeeaf8",
          200: "#ddd6f1",
          300: "#c4bbe6",
          400: "#a598d6",
          500: "#8a7bc6", // GlucoNest signature
          600: "#7564b0",
          700: "#5f4f95",
          800: "#4d4179",
          900: "#3f3664",
          950: "#281f45",
        },
        cream: "#fbf7f0",
        ink: "#1f1b2e",
        coral: { 300: "#f9c3ad", 400: "#f4a68a", 500: "#e8866a" },
        sage: { 300: "#b9d3c3", 400: "#9bbfa9", 500: "#7fa893" },
        glucose: {
          verylow: "#be123c", // < 54 mg/dL (urgent low)
          low: "#f43f5e",     // 54-69 mg/dL (gentle coral/rose)
          target: "#10b981",  // 70-180 mg/dL (calm emerald)
          high: "#f59e0b",    // 181-250 mg/dL (warm amber)
          veryhigh: "#ea580c",// > 250 mg/dL (soft burnt orange)
        }
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      borderRadius: {
        'nest': '11px', // soft 10-12px per design principle #1
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};

export default config;
