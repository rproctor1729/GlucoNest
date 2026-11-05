'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_REMINDER_SETTINGS,
  LocalReminderSettings,
  readReminderSettings,
  writeReminderSettings,
} from '@/lib/reminders';

function toLocalDateTimeValue(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ReminderSettings() {
  const [settings, setSettings] = useState<LocalReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [sensorDate, setSensorDate] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = readReminderSettings();
      setSettings(saved);
      setSensorDate(toLocalDateTimeValue(saved.sensorChangeAt));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Reminder settings could not be loaded.');
    }
  }, []);

  const save = (next: LocalReminderSettings) => {
    try {
      writeReminderSettings(next);
      setSettings(next);
      setError(null);
      setMessage('Reminder settings saved on this device.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Reminder settings could not be saved.');
    }
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      setMessage('Browser notifications are unavailable. In-app reminders still work while this app is open.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setMessage(permission === 'granted'
        ? 'Browser notifications are enabled.'
        : 'Notifications were not enabled. In-app reminders still work while this app is open.');
    } catch {
      setMessage('Browser notifications could not be enabled. In-app reminders still work while this app is open.');
    }
  };

  const setSensorReminder = () => {
    const timestamp = sensorDate ? new Date(sensorDate).getTime() : NaN;
    if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
      setError('Choose a future sensor-change date and time.');
      return;
    }
    save({ ...settings, sensorChangeAt: new Date(timestamp).toISOString() });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#131b24] sm:p-7">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">Optional local reminders</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Reminders run only while GlucoNest remains open in this browser. They are not reliable alarms and never replace your CGM alerts or care plan.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          Glucose check-in interval
          <select
            value={settings.intervalHours}
            onChange={(event) => {
              const intervalHours = Number(event.target.value) as LocalReminderSettings['intervalHours'];
              save({
                ...settings,
                intervalHours,
                nextGlucoseAt: settings.glucoseCheckEnabled
                  ? new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString()
                  : settings.nextGlucoseAt,
              });
            }}
            className="block h-10 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value={1}>Every 1 hour</option>
            <option value={2}>Every 2 hours</option>
            <option value={4}>Every 4 hours</option>
            <option value={8}>Every 8 hours</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => save({
            ...settings,
            glucoseCheckEnabled: !settings.glucoseCheckEnabled,
            nextGlucoseAt: settings.glucoseCheckEnabled
              ? null
              : new Date(Date.now() + settings.intervalHours * 60 * 60 * 1000).toISOString(),
          })}
          className="h-10 rounded-xl bg-nest-600 px-4 text-xs font-semibold text-white hover:bg-nest-700"
        >
          {settings.glucoseCheckEnabled ? 'Turn off check-ins' : 'Enable check-ins'}
        </button>
        <button type="button" onClick={() => void requestNotifications()} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Allow browser notifications
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <label className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          Sensor change reminder
          <input type="datetime-local" value={sensorDate} onChange={(event) => setSensorDate(event.target.value)} className="block h-10 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <button type="button" onClick={setSensorReminder} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Save sensor reminder
        </button>
        {settings.sensorChangeAt && (
          <button type="button" onClick={() => { setSensorDate(''); save({ ...settings, sensorChangeAt: null }); }} className="h-10 rounded-xl px-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">
            Cancel sensor reminder
          </button>
        )}
      </div>

      {message && <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{message}</p>}
      {error && <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{error}</p>}
      {settings.nextGlucoseAt && <p className="text-[11px] text-slate-500 dark:text-slate-400">Next check-in reminder: {new Date(settings.nextGlucoseAt).toLocaleString()}</p>}
    </section>
  );
}
