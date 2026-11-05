import {
  ActivityLogEntry,
  CommunityFeedback,
  GlucoseReading,
  InsulinLogEntry,
  MealLogEntry,
  MealItemSelection,
} from '../types';

export const LOCAL_DATA_KEYS = {
  meals: 'gluconest_meals',
  insulin: 'gluconest_insulin',
  activity: 'gluconest_activity',
  readings: 'gluconest_manual_readings',
  feedback: 'gluconest_feedback',
} as const;

export interface LocalDataBackup {
  app: 'GlucoNest';
  schemaVersion: 1;
  exportedAt: string;
  data: {
    manualReadings: GlucoseReading[];
    meals: MealLogEntry[];
    insulinLogs: InsulinLogEntry[];
    activityLogs: ActivityLogEntry[];
    feedbackList: CommunityFeedback[];
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isTimestamp(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isMealItemSelection(value: unknown): value is MealItemSelection {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.foodId) &&
    isNonEmptyString(value.name) &&
    typeof value.servings === 'number' &&
    Number.isFinite(value.servings) &&
    value.servings > 0 &&
    isNonEmptyString(value.servingDescription) &&
    typeof value.carbsPerServing === 'number' &&
    Number.isFinite(value.carbsPerServing) &&
    value.carbsPerServing >= 0 &&
    typeof value.totalCarbs === 'number' &&
    Number.isFinite(value.totalCarbs) &&
    value.totalCarbs >= 0
  );
}

export function isMealLogEntry(value: unknown): value is MealLogEntry {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    isTimestamp(value.timestamp) &&
    ['breakfast', 'lunch', 'dinner', 'snack', 'hypo-treatment'].includes(String(value.mealType)) &&
    isNonEmptyString(value.name) &&
    Array.isArray(value.items) &&
    value.items.every(isMealItemSelection) &&
    typeof value.totalCarbs === 'number' &&
    Number.isFinite(value.totalCarbs) &&
    value.totalCarbs >= 0 &&
    isOptionalString(value.notes) &&
    (value.isDemo === undefined || typeof value.isDemo === 'boolean')
  );
}

export function isInsulinLogEntry(value: unknown): value is InsulinLogEntry {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    isTimestamp(value.timestamp) &&
    ['rapid', 'basal', 'premix'].includes(String(value.type)) &&
    typeof value.units === 'number' &&
    Number.isFinite(value.units) &&
    value.units > 0 &&
    isOptionalString(value.brandName) &&
    (value.deliveryMethod === undefined ||
      ['pen', 'syringe', 'pump'].includes(String(value.deliveryMethod))) &&
    isOptionalString(value.notes) &&
    (value.isDemo === undefined || typeof value.isDemo === 'boolean')
  );
}

export function isActivityLogEntry(value: unknown): value is ActivityLogEntry {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    isTimestamp(value.timestamp) &&
    ['walk', 'run', 'gym', 'cycling', 'yoga', 'sports', 'other'].includes(String(value.type)) &&
    typeof value.durationMinutes === 'number' &&
    Number.isFinite(value.durationMinutes) &&
    value.durationMinutes > 0 &&
    ['light', 'moderate', 'vigorous'].includes(String(value.intensity)) &&
    isOptionalString(value.notes) &&
    (value.isDemo === undefined || typeof value.isDemo === 'boolean')
  );
}

export function isManualGlucoseReading(value: unknown): value is GlucoseReading {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    isTimestamp(value.timestamp) &&
    isNonEmptyString(value.timeLabel) &&
    typeof value.value === 'number' &&
    Number.isFinite(value.value) &&
    value.value > 0 &&
    (value.unit === undefined || value.unit === 'mg/dL') &&
    (value.source === undefined || value.source === 'manual') &&
    isOptionalString(value.originalSource) &&
    isOptionalString(value.notes) &&
    (value.isDemo === undefined || value.isDemo === false)
  );
}

export function isCommunityFeedback(value: unknown): value is CommunityFeedback {
  if (!isRecord(value)) return false;
  const stringArray = (item: unknown) =>
    Array.isArray(item) && item.every((entry) => typeof entry === 'string');
  return (
    isNonEmptyString(value.id) &&
    isTimestamp(value.submittedAt) &&
    typeof value.isAnonymous === 'boolean' &&
    isOptionalString(value.nameOrHandle) &&
    isOptionalString(value.emailOrContact) &&
    stringArray(value.challengingPart) &&
    isOptionalString(value.challengingPartOther) &&
    stringArray(value.currentAppsUsed) &&
    isOptionalString(value.currentAppsOther) &&
    stringArray(value.dislikedAspects) &&
    isOptionalString(value.dislikedAspectsOther) &&
    [
      'Extremely helpful',
      'Somewhat helpful',
      'Not sure',
      'I already know my counts',
    ].includes(String(value.indianFoodHelpfulness)) &&
    [
      'Yes - helps me understand the why',
      'Sometimes',
      'No - just numbers please',
    ].includes(String(value.patternExplanationsHelpfulness)) &&
    stringArray(value.featureWouldUseRegularly) &&
    isOptionalString(value.featureOther) &&
    typeof value.wishSomeoneBuilt === 'string' &&
    typeof value.additionalSuggestions === 'string'
  );
}

export function isArrayOf<T>(
  value: unknown,
  validator: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(validator);
}

export function createLocalDataBackup(data: LocalDataBackup['data']): LocalDataBackup {
  return {
    app: 'GlucoNest',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    data: {
      manualReadings: data.manualReadings.filter((reading) => !reading.isDemo),
      meals: data.meals.filter((meal) => !meal.isDemo),
      insulinLogs: data.insulinLogs.filter((entry) => !entry.isDemo),
      activityLogs: data.activityLogs.filter((entry) => !entry.isDemo),
      feedbackList: data.feedbackList,
    },
  };
}

export function parseLocalDataBackup(value: unknown): LocalDataBackup {
  if (
    !isRecord(value) ||
    value.app !== 'GlucoNest' ||
    value.schemaVersion !== 1 ||
    !isTimestamp(value.exportedAt) ||
    !isRecord(value.data)
  ) {
    throw new Error('This file is not a supported GlucoNest data backup.');
  }

  const data = value.data;
  if (
    !isArrayOf(data.manualReadings, isManualGlucoseReading) ||
    !isArrayOf(data.meals, isMealLogEntry) ||
    !isArrayOf(data.insulinLogs, isInsulinLogEntry) ||
    !isArrayOf(data.activityLogs, isActivityLogEntry) ||
    !isArrayOf(data.feedbackList, isCommunityFeedback)
  ) {
    throw new Error('The backup contains missing or invalid records. No data was imported.');
  }

  if (
    [...data.manualReadings, ...data.meals, ...data.insulinLogs, ...data.activityLogs]
      .some((entry) => entry.isDemo)
  ) {
    throw new Error('The backup contains sample records and cannot be imported.');
  }

  return {
    app: 'GlucoNest',
    schemaVersion: 1,
    exportedAt: value.exportedAt,
    data: {
      manualReadings: data.manualReadings,
      meals: data.meals,
      insulinLogs: data.insulinLogs,
      activityLogs: data.activityLogs,
      feedbackList: data.feedbackList,
    },
  };
}

export function mergeRecordsById<T extends { id?: string }>(
  existing: T[],
  incoming: T[]
): T[] {
  const records = new Map<string, T>();
  let anonymousId = 0;
  for (const record of existing) {
    records.set(record.id ?? `unidentified-existing-${anonymousId++}`, record);
  }
  for (const record of incoming) {
    records.set(record.id ?? `unidentified-imported-${anonymousId++}`, record);
  }
  return Array.from(records.values());
}

export function replaceDemoRecords<T extends { isDemo?: boolean }>(
  existing: T[],
  sampleRecords: T[]
): T[] {
  return [...existing.filter((record) => !record.isDemo), ...sampleRecords];
}
