// Plain-language definitions shown next to the abbreviations used in the app.

export const GLOSSARY = {
  tir: {
    term: 'Time in range (TIR)',
    plain: 'The share of readings between 70 and 180 mg/dL (3.9–10 mmol/L). Higher is generally better, and your care team sets your own target.',
  },
  tbr: {
    term: 'Time below range (TBR)',
    plain: 'The share of readings under 70 mg/dL. Lows need treatment with the Rule of 15.',
  },
  tar: {
    term: 'Time above range (TAR)',
    plain: 'The share of readings over 180 mg/dL.',
  },
  cv: {
    term: 'Coefficient of variation (CV)',
    plain: 'How much your glucose swings compared with its average. Under 36% is the commonly used target for stable readings.',
  },
  gmi: {
    term: 'Glucose management indicator (GMI)',
    plain: 'An estimate of an HbA1c value from your CGM average. It is not a lab HbA1c test and can differ from one.',
  },
  mean: {
    term: 'Average glucose',
    plain: 'The mean of all readings in the period shown.',
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
