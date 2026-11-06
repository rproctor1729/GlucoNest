import type { GlucoseReading, InsulinLogEntry, MealLogEntry } from '../types';
import { calculateDetailedTIR } from './tirCalculator';

export interface TodaySummary {
  readingCount: number;
  lowCount: number; // readings below 70 mg/dL
  highCount: number; // readings above 180 mg/dL
  timeInRangePercent: number | null; // null when there is not enough data for a time-based figure
  mealCount: number;
  carbsTotal: number;
  insulinUnits: number;
  lastMealTime: string | null;
}

export function isSameLocalDay(iso: string, now: Date): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function summarizeToday(
  readings: GlucoseReading[],
  meals: MealLogEntry[],
  insulinLogs: InsulinLogEntry[],
  now: Date = new Date()
): TodaySummary {
  const todayReadings = readings.filter((r) => Number.isFinite(r.value) && isSameLocalDay(r.timestamp, now));
  const tir = calculateDetailedTIR(todayReadings.map((r) => ({ value: r.value, timestamp: r.timestamp })));

  const todayMeals = meals
    .filter((m) => isSameLocalDay(m.timestamp, now))
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  const todayInsulin = insulinLogs.filter((i) => isSameLocalDay(i.timestamp, now));

  return {
    readingCount: todayReadings.length,
    lowCount: todayReadings.filter((r) => r.value < 70).length,
    highCount: todayReadings.filter((r) => r.value > 180).length,
    timeInRangePercent: tir.hasSufficientData ? tir.inRangePercent : null,
    mealCount: todayMeals.length,
    carbsTotal: todayMeals.reduce((sum, m) => sum + m.totalCarbs, 0),
    insulinUnits: todayInsulin.reduce((sum, i) => sum + i.units, 0),
    lastMealTime: todayMeals[0]?.timestamp ?? null,
  };
}
