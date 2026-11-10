export interface LocalReminderSettings {
  glucoseCheckEnabled: boolean;
  intervalHours: 1 | 2 | 4 | 8;
  nextGlucoseAt: string | null;
  sensorChangeAt: string | null;
}

export const REMINDER_STORAGE_KEY = 'gluconest_local_reminders';
export const REMINDER_CHANGE_EVENT = 'gluconest-reminders-updated';

export const DEFAULT_REMINDER_SETTINGS: LocalReminderSettings = {
  glucoseCheckEnabled: false,
  intervalHours: 2,
  nextGlucoseAt: null,
  sensorChangeAt: null,
};

export function readReminderSettings(reportError: (message: string) => void = console.error): LocalReminderSettings {
  const raw = window.localStorage.getItem(REMINDER_STORAGE_KEY);
  if (raw === null) return DEFAULT_REMINDER_SETTINGS;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    reportError('Saved reminder settings are invalid.');
    return DEFAULT_REMINDER_SETTINGS;
  }
  if (!value || typeof value !== 'object') throw new Error('Saved reminder settings are invalid.');
  const settings = value as Partial<LocalReminderSettings>;
  const validOptionalTime = (time: unknown) =>
    time === null || (typeof time === 'string' && Number.isFinite(Date.parse(time)));
  if (
    typeof settings.glucoseCheckEnabled !== 'boolean' ||
    ![1, 2, 4, 8].includes(settings.intervalHours as number) ||
    !validOptionalTime(settings.nextGlucoseAt) ||
    !validOptionalTime(settings.sensorChangeAt)
  ) {
    throw new Error('Saved reminder settings are invalid.');
  }
  return settings as LocalReminderSettings;
}

export function writeReminderSettings(settings: LocalReminderSettings): void {
  window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(REMINDER_CHANGE_EVENT));
}
