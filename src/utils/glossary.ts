// Plain-language definitions shown next to the abbreviations used in the app.

export const GLOSSARY = {
  tir: {
    term: 'Time in range (TIR)',
    plain: 'Estimated time within your configured glucose range, calculated from closely spaced readings.',
  },
  tbr: {
    term: 'Time below range (TBR)',
    plain: 'Estimated time below your configured glucose range.',
  },
  tar: {
    term: 'Time above range (TAR)',
    plain: 'Estimated time above your configured glucose range.',
  },
  cv: {
    term: 'Coefficient of variation (CV)',
    plain: 'Variation in glucose readings relative to their average, expressed as a percentage.',
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
