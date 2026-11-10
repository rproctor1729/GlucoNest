'use client';

import { useEffect } from 'react';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('An application section failed.', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 px-6 text-slate-900 dark:text-slate-100 ">
      <h1 className="text-xl font-bold">GlucoNest hit an unexpected error</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Your locally saved records have not been intentionally changed. Reload this screen to try again.
      </p>
      <button onClick={reset} className="rounded-xl bg-nest-600 text-white px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Try again
      </button>
    </main>
  );
}
