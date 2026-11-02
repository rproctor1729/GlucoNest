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
        glucose: {
          verylow: "#be123c", // < 54 mg/dL (urgent low)
          low: "#f43f5e",     // 54-69 mg/dL (gentle coral/rose)
          target: "#10b981",  // 70-180 mg/dL (calm emerald)
          high: "#f59e0b",    // 181-250 mg/dL (warm amber)
          veryhigh: "#ea580c",// > 250 mg/dL (soft burnt orange)
        }
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
