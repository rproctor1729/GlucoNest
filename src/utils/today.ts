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
  now: Date = new Date(),
  targetRange = { low: 70, high: 180 }
): TodaySummary {
  const todayReadings = readings.filter((r) => !r.isDemo && Number.isFinite(r.value) && r.value >= 20 && r.value <= 600 && Date.parse(r.timestamp) <= now.getTime() && isSameLocalDay(r.timestamp, now));
  const tir = calculateDetailedTIR(todayReadings, targetRange.low, targetRange.high);

  const todayMeals = meals
    .filter((m) => !m.isDemo && Date.parse(m.timestamp) <= now.getTime() && isSameLocalDay(m.timestamp, now))
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  const todayInsulin = insulinLogs.filter((i) => !i.isDemo && Date.parse(i.timestamp) <= now.getTime() && isSameLocalDay(i.timestamp, now));

  return {
    readingCount: todayReadings.length,
    lowCount: todayReadings.filter((r) => r.value < targetRange.low).length,
    highCount: todayReadings.filter((r) => r.value > targetRange.high).length,
    timeInRangePercent: tir.hasSufficientData ? tir.inRangePercent : null,
    mealCount: todayMeals.length,
    carbsTotal: todayMeals.reduce((sum, m) => sum + m.totalCarbs, 0),
    insulinUnits: todayInsulin.reduce((sum, i) => sum + i.units, 0),
    lastMealTime: todayMeals[0]?.timestamp ?? null,
  };
}
