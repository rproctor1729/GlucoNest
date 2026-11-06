import type { GlucoseReading, InsulinLogEntry, MealLogEntry } from '../types';
import { calculateDetailedTIR, TirBreakdown } from './tirCalculator';

// Builds the numbers for a printable summary from the user's own logged data only.
// It reports figures and logs. It does not recommend doses or changes to treatment.

export interface DailyRow {
  date: string; // YYYY-MM-DD in local time
  readings: number;
  min: number;
  max: number;
  mean: number;
  lows: number; // readings below 70 mg/dL
}

export interface ReportData {
  periodDays: number;
  from: string;
  to: string;
  tir: TirBreakdown;
  readingCount: number;
  daily: DailyRow[];
  meals: MealLogEntry[];
  insulin: InsulinLogEntry[];
}

function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function buildReport(
  readings: GlucoseReading[],
  meals: MealLogEntry[],
  insulinLogs: InsulinLogEntry[],
  periodDays: number,
  now: Date = new Date()
): ReportData {
  const to = now.getTime();
  const from = to - periodDays * 24 * 60 * 60 * 1000;

  const inPeriod = readings
    .filter((r) => !r.isDemo && Number.isFinite(r.value))
    .map((r) => ({ value: r.value, timestamp: r.timestamp, time: Date.parse(r.timestamp) }))
    .filter((r) => Number.isFinite(r.time) && r.time >= from && r.time <= to)
    .sort((a, b) => a.time - b.time);

  const tir = calculateDetailedTIR(inPeriod.map((r) => ({ value: r.value, timestamp: r.timestamp })));

  const groups = new Map<string, number[]>();
  for (const reading of inPeriod) {
    const key = localDateKey(new Date(reading.time));
    groups.set(key, [...(groups.get(key) ?? []), reading.value]);
  }
  const daily: DailyRow[] = [...groups.entries()].map(([date, values]) => ({
    date,
    readings: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    mean: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
    lows: values.filter((v) => v < 70).length,
  }));

  const inWindow = (iso: string) => {
    const time = Date.parse(iso);
    return Number.isFinite(time) && time >= from && time <= to;
  };

  return {
    periodDays,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    tir,
    readingCount: inPeriod.length,
    daily,
    meals: meals.filter((m) => !m.isDemo && inWindow(m.timestamp)).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    insulin: insulinLogs.filter((i) => !i.isDemo && inWindow(i.timestamp)).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
  };
}
