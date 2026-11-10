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
      if (process.env.NODE_ENV === 'production') {
        void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch((error: unknown) => {
          console.error('Unable to register the offline app shell.', error);
        });
      } else {
        // A worker installed during an earlier preview can still control next dev.
        // Unregistering alone does not release the current document: reload it once.
        void (async () => {
          const workerUrl = new URL('/sw.js', window.location.origin).href;
          const wasControlled = navigator.serviceWorker.controller?.scriptURL === workerUrl;
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.filter((registration) =>
            [registration.active, registration.waiting, registration.installing]
              .some((worker) => worker?.scriptURL === workerUrl)
          ).map((registration) => registration.unregister()));
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter((key) => key.startsWith('gluconest-shell-'))
              .map((key) => caches.delete(key)));
          }
          if (wasControlled) window.location.reload();
        })().catch((error: unknown) => {
          console.error('Unable to clear the old GlucoNest development cache.', error);
        });
      }
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
