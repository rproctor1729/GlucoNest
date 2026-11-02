import { GlucoseUnit } from '../types';

export function mgDlToMmol(mgDl: number): number {
  return Number((mgDl / 18.0182).toFixed(1));
}

export function mmolToMgDl(mmol: number): number {
  return Math.round(mmol * 18.0182);
}

export function displayGlucoseValue(valInMgDl: number, unit: GlucoseUnit): string {
  if (unit === 'mmol/L') {
    return (valInMgDl / 18.0182).toFixed(1);
  }
  return Math.round(valInMgDl).toString();
}
