import { GlucoseTrend, GlucoseUnit, GlucoseStatus } from '../types';

export function convertGlucose(valueInMgDl: number, unit: GlucoseUnit): string {
  if (unit === 'mmol/L') {
    return (valueInMgDl / 18.0182).toFixed(1);
  }
  return Math.round(valueInMgDl).toString();
}

export function formatUnitLabel(unit: GlucoseUnit): string {
  return unit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
}

export function parseGlucoseInput(displayValue: number, unit: GlucoseUnit): number {
  if (unit === 'mmol/L') {
    return Math.round(displayValue * 18.0182);
  }
  return Math.round(displayValue);
}

export function getTrendSymbol(trend?: GlucoseTrend): { symbol: string; text: string; degrees: number } {
  switch (trend) {
    case 'DOUBLE_UP':
      return { symbol: '↑↑', text: 'Rising rapidly (>3 mg/dL/min)', degrees: -90 };
    case 'UP':
      return { symbol: '↑', text: 'Rising (2-3 mg/dL/min)', degrees: -90 };
    case 'SLIGHT_UP':
      return { symbol: '↗', text: 'Rising slowly (1-2 mg/dL/min)', degrees: -45 };
    case 'FLAT':
      return { symbol: '→', text: 'Steady (changing <1 mg/dL/min)', degrees: 0 };
    case 'SLIGHT_DOWN':
      return { symbol: '↘', text: 'Falling slowly (1-2 mg/dL/min)', degrees: 45 };
    case 'DOWN':
      return { symbol: '↓', text: 'Falling (2-3 mg/dL/min)', degrees: 90 };
    case 'DOUBLE_DOWN':
      return { symbol: '↓↓', text: 'Falling rapidly (>3 mg/dL/min)', degrees: 90 };
    default:
      return { symbol: '→', text: 'Steady', degrees: 0 };
  }
}

export function getGlucoseStatus(mgDl: number, targetLow = 70, targetHigh = 180): GlucoseStatus {
  if (mgDl < 54) return 'very-low';
  if (mgDl < targetLow) return 'low';
  if (mgDl <= targetHigh) return 'in-range';
  if (mgDl <= 250) return 'high';
  return 'very-high';
}

export function getGlucoseStatusColor(status: GlucoseStatus, isDark = false, targetLow = 70, targetHigh = 180): {
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  label: string;
} {
  switch (status) {
    case 'very-low':
      return {
        badgeBg: isDark ? 'bg-rose-950/70 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-700',
        badgeText: 'text-rose-600 dark:text-rose-400',
        dotColor: 'bg-rose-600',
        label: 'Urgent Low (<54 mg/dL)',
      };
    case 'low':
      return {
        badgeBg: isDark ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-rose-50/90 border-rose-200 text-rose-600',
        badgeText: 'text-rose-500 dark:text-rose-400',
        dotColor: 'bg-rose-500',
        label: `Below Target (<${targetLow} mg/dL)`,
      };
    case 'in-range':
      return {
        badgeBg: isDark ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
        badgeText: 'text-emerald-600 dark:text-emerald-400',
        dotColor: 'bg-emerald-500',
        label: `In Range (${targetLow}–${targetHigh} mg/dL)`,
      };
    case 'high':
      return {
        badgeBg: isDark ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700',
        badgeText: 'text-amber-600 dark:text-amber-400',
        dotColor: 'bg-amber-500',
        label: `Above Target (>${targetHigh} mg/dL)`,
      };
    case 'very-high':
      return {
        badgeBg: isDark ? 'bg-orange-950/50 border-orange-800/70 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700',
        badgeText: 'text-orange-600 dark:text-orange-400',
        dotColor: 'bg-orange-600',
        label: 'Elevated (>250 mg/dL)',
      };
  }
}
