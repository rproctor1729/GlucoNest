import { LOCAL_DATA_KEYS, isManualGlucoseReading, isMealLogEntry } from './localData';
import { mockGlucoseReadings } from '../data/mockGlucose';
import { initialMockMeals } from '../data/mockMeals';
import { indianFoodDatabase } from '../data/indianFoods';
import type { GlucoseReading, IndianFoodItem, MealLogEntry } from '../types';

export interface DashboardPreviewData {
  readings: GlucoseReading[];
  meals: MealLogEntry[];
  sample: boolean;
}

function readRecords<T>(storage: Pick<Storage, 'getItem'>, key: string, valid: (item: unknown) => item is T): T[] {
  const raw = storage.getItem(key);
  if (raw === null) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(valid)) throw new Error('Invalid local records');
  return parsed;
}

export function loadDashboardPreview(storage: Pick<Storage, 'getItem'> = window.localStorage, now = new Date()): DashboardPreviewData | null {
  const today = (timestamp: string) => {
    const date = new Date(timestamp);
    return date <= now && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  };
  const readings = readRecords(storage, LOCAL_DATA_KEYS.readings, isManualGlucoseReading)
    .filter(reading => !reading.isDemo && today(reading.timestamp)).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  const meals = readRecords(storage, LOCAL_DATA_KEYS.meals, isMealLogEntry)
    .filter(meal => !meal.isDemo && today(meal.timestamp)).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  if (readings.length || meals.length) return { readings, meals, sample: false };
  if (!mockGlucoseReadings.length && !initialMockMeals.length) return null;
  return { readings: mockGlucoseReadings, meals: initialMockMeals, sample: true };
}

export function loadFoodPreview(foods: readonly IndianFoodItem[] = indianFoodDatabase): IndianFoodItem | null {
  return foods[0] ?? null;
}

export function sparklinePoints(readings: readonly GlucoseReading[]): string {
  if (!readings.length) return '';
  const minute = (reading: GlucoseReading) => /^\d{2}:\d{2}$/.test(reading.timestamp)
    ? Number(reading.timestamp.slice(0, 2)) * 60 + Number(reading.timestamp.slice(3))
    : Date.parse(reading.timestamp) / 60000;
  const times = readings.map(minute);
  const start = Math.min(...times), span = Math.max(...times) - start;
  const values = readings.map(reading => reading.value);
  const low = Math.min(...values), range = Math.max(...values) - low;
  return readings.map((reading, index) => `${span ? 8 + (times[index] - start) / span * 304 : 160},${range ? 64 - (reading.value - low) / range * 48 : 40}`).join(' ');
}
