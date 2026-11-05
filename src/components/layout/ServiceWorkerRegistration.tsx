'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translate } from '@/lib/i18n';

export default function ServiceWorkerRegistration() {
  const [offline, setOffline] = useState(false);
  const { language } = useApp();

  useEffect(() => {
    const updateStatus = () => setOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('Unable to register the offline app shell.', error);
      });
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 shadow-sm dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      {translate(language, 'common.offline')}
    </div>
  );
}
