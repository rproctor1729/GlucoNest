'use client';

import { useEffect, useRef, useState } from 'react';
import {
  readReminderSettings,
  REMINDER_CHANGE_EVENT,
  writeReminderSettings,
} from '@/lib/reminders';

export default function LocalReminderManager() {
  const [message, setMessage] = useState<string | null>(null);
  const handledDueTimes = useRef(new Set<string>());

  useEffect(() => {
    const check = () => {
      try {
        const settings = readReminderSettings();
        const now = Date.now();
        const dueGlucose = settings.glucoseCheckEnabled &&
          settings.nextGlucoseAt &&
          Date.parse(settings.nextGlucoseAt) <= now &&
          !handledDueTimes.current.has(settings.nextGlucoseAt);
        const dueSensor = settings.sensorChangeAt &&
          Date.parse(settings.sensorChangeAt) <= now &&
          !handledDueTimes.current.has(settings.sensorChangeAt);
        if (!dueGlucose && !dueSensor) return;

        const alerts = [
          dueGlucose ? 'Your optional glucose check-in reminder is due.' : '',
          dueSensor ? 'Your sensor-change reminder is due.' : '',
        ].filter(Boolean);
        const nextSettings = { ...settings };
        if (dueGlucose) {
          handledDueTimes.current.add(settings.nextGlucoseAt as string);
          nextSettings.nextGlucoseAt = new Date(now + settings.intervalHours * 60 * 60 * 1000).toISOString();
        }
        if (dueSensor) {
          handledDueTimes.current.add(settings.sensorChangeAt as string);
          nextSettings.sensorChangeAt = null;
        }

        const notificationText = `${alerts.join(' ')} These reminders do not replace CGM alerts or your care plan.`;
        setMessage(notificationText);
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('GlucoNest reminder', { body: notificationText });
          } catch {
            setMessage(`${notificationText} The in-app reminder is shown because the browser notification failed.`);
          }
        }
        writeReminderSettings(nextSettings);
        window.setTimeout(() => setMessage(null), 20000);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Local reminder could not be checked.');
      }
    };

    check();
    const timer = window.setInterval(check, 30000);
    window.addEventListener(REMINDER_CHANGE_EVENT, check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(REMINDER_CHANGE_EVENT, check);
    };
  }, []);

  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-20 left-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-medium text-amber-950 shadow-lg dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 xl:bottom-4">
      {message}
      <button type="button" onClick={() => setMessage(null)} className="ml-3 font-bold underline">Dismiss</button>
    </div>
  );
}
