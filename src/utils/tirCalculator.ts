import { GlucoseReading } from '../types';

export interface TirBreakdown {
  totalReadings: number;
  inRangePercent: number; // 70-180 mg/dL (target >70%)
  timeAboveRangePercent: number; // >180 mg/dL (target <25%)
  highPercent: number; // 181-250 mg/dL
  veryHighPercent: number; // >250 mg/dL (target <5%)
  timeBelowRangePercent: number; // <70 mg/dL (target <4%)
  lowPercent: number; // 54-69 mg/dL
  veryLowPercent: number; // <54 mg/dL (target <1%)
  meanGlucose: number; // mg/dL
  standardDeviation: number; // mg/dL
  coefficientOfVariation: number; // % (target <36%)
  gmiPercent: number; // % estimated A1c (3.31 + 0.02392 * mean)
  gmiExplanation: string;
  minReading: number;
  maxReading: number;
}

export function calculateDetailedTIR(readings: { value: number }[]): TirBreakdown {
  if (!readings || readings.length === 0) {
    return {
      totalReadings: 0,
      inRangePercent: 0,
      timeAboveRangePercent: 0,
      highPercent: 0,
      veryHighPercent: 0,
      timeBelowRangePercent: 0,
      lowPercent: 0,
      veryLowPercent: 0,
      meanGlucose: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      gmiPercent: 0,
      gmiExplanation: 'No sample readings available to calculate metrics.',
      minReading: 0,
      maxReading: 0,
    };
  }

  let veryLow = 0; // <54
  let low = 0; // 54-69
  let inRange = 0; // 70-180
  let high = 0; // 181-250
  let veryHigh = 0; // >250
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const r of readings) {
    const val = r.value;
    sum += val;
    if (val < min) min = val;
    if (val > max) max = val;

    if (val < 54) {
      veryLow++;
    } else if (val < 70) {
      low++;
    } else if (val <= 180) {
      inRange++;
    } else if (val <= 250) {
      high++;
    } else {
      veryHigh++;
    }
  }

  const total = readings.length;
  const mean = Math.round(sum / total);

  // Variance & Standard Deviation
  const variance = readings.reduce((acc, curr) => acc + Math.pow(curr.value - mean, 2), 0) / total;
  const standardDeviation = Math.round(Math.sqrt(variance));
  const coefficientOfVariation = mean > 0 ? Math.round((standardDeviation / mean) * 100) : 0;

  // GMI calculation (Standard Bergenstal equation: GMI [%] = 3.31 + [0.02392 * mean_glucose_mg_dL])
  const gmiPercent = Number((3.31 + 0.02392 * mean).toFixed(1));

  const inRangePct = Math.round((inRange / total) * 100);
  const lowPct = Math.round((low / total) * 100);
  const veryLowPct = Math.round((veryLow / total) * 100);
  const highPct = Math.round((high / total) * 100);
  const veryHighPct = Math.round((veryHigh / total) * 100);

  const tbrPct = lowPct + veryLowPct;
  const tarPct = highPct + veryHighPct;

  return {
    totalReadings: total,
    inRangePercent: inRangePct,
    timeAboveRangePercent: tarPct,
    highPercent: highPct,
    veryHighPercent: veryHighPct,
    timeBelowRangePercent: tbrPct,
    lowPercent: lowPct,
    veryLowPercent: veryLowPct,
    meanGlucose: mean,
    standardDeviation,
    coefficientOfVariation,
    gmiPercent,
    gmiExplanation:
      'GMI is a CGM-derived estimate of your HbA1c based on average glucose over time. It is not interchangeable with a laboratory venous blood HbA1c test, but provides a helpful directional proxy.',
    minReading: min === Infinity ? 0 : min,
    maxReading: max === -Infinity ? 0 : max,
  };
}
