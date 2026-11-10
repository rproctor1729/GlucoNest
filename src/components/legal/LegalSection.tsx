'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function LegalSection() {
  const { setActiveSection } = useApp();
  const contactEmail = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? '';

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fadeIn">
      <header className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Privacy, terms &amp; contact</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Plain-language information for this browser-based prototype.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[var(--surface)]">
        <h2 className="font-semibold text-slate-900 dark:text-white">Privacy</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <li>Records you enter are stored in this browser&apos;s local storage. Browser storage is not encrypted and may be cleared by your browser or by anyone with access to this device.</li>
          <li>CSV files are parsed in your browser. JSON backups are created locally and may contain sensitive health information; keep downloaded files private.</li>
          <li>Nightscout readings and an optional access token are held in memory and sent directly to the Nightscout host you configure. They are not included in local backups and are cleared on disconnect or reload.</li>
          <li>The service worker caches app files for offline loading; it does not cache health data or Nightscout responses.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[var(--surface)]">
        <h2 className="font-semibold text-slate-900 dark:text-white">Terms and safety</h2>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          GlucoNest is an independent prototype for education and self-tracking. It is not a medical device, clinical service, emergency alert, diagnosis, or treatment recommendation. Do not rely on it for insulin decisions, hypoglycaemia response, or urgent care. Use your prescribed care plan and established device alerts, and discuss health decisions with your clinical team. The prototype is provided as-is and may be unavailable, incomplete, or contain errors.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[var(--surface)]">
        <h2 className="font-semibold text-slate-900 dark:text-white">Contact</h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Use the feedback page to share comments. Feedback is saved in this browser; sending it to the maintainer is a separate choice.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => setActiveSection('feedback')} className="h-10 rounded-xl bg-nest-600 px-4 text-xs font-semibold text-white hover:bg-nest-700">
            Open feedback page
          </button>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Email maintainer
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
