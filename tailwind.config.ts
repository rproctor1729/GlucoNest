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
          50: "#f2f7f5",
          100: "#e2eeeb",
          200: "#c0dad5",
          300: "#9ad5cd",
          400: "#73b7b0",
          500: "#458b87", // Brand teal
          600: "#246d6e",
          700: "#155e60",
          800: "#184d50",
          900: "#193d3f",
          950: "#142c2e",
        },
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
