'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function TargetRangeSettings() {
  const { targetRange, saveTargetRange, largeText, toggleLargeText } = useApp();
  const [low, setLow] = useState(String(targetRange.low));
  const [high, setHigh] = useState(String(targetRange.high));
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setLow(String(targetRange.low));
    setHigh(String(targetRange.high));
  }, [targetRange]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const saved = saveTargetRange(Number(low), Number(high));
    setStatus(saved
      ? 'Your personal range was saved and will be used in glucose summaries.'
      : 'Enter a valid range from 20–400 mg/dL, with the lower value below the upper value.');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#131b24] sm:p-7">
      <h3 className="font-semibold text-slate-900 dark:text-white">Personal target range</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Use the range recommended by your clinician. GlucoNest does not set or recommend a personal target.
      </p>
      <form onSubmit={handleSave} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          Lower (mg/dL)
          <input type="number" min="20" max="399" required value={low} onChange={(event) => setLow(event.target.value)} className="block h-10 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          Upper (mg/dL)
          <input type="number" min="21" max="400" required value={high} onChange={(event) => setHigh(event.target.value)} className="block h-10 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <button type="submit" className="h-10 rounded-xl bg-nest-600 px-4 text-xs font-semibold text-white hover:bg-nest-700">Save range</button>
      </form>
      {status && <p role="status" className="mt-3 text-xs text-slate-600 dark:text-slate-300">{status}</p>}
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button type="button" onClick={toggleLargeText} aria-pressed={largeText} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          {largeText ? 'Use standard text size' : 'Use larger text'}
        </button>
      </div>
    </section>
  );
}
