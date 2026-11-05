'use client';

import { FormEvent, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { APP_LANGUAGES, AppLanguage, translate } from '@/lib/i18n';
import { GlucoseUnit } from '@/types';

export default function OnboardingDialog() {
  const {
    onboardingComplete,
    completeOnboarding,
    language: savedLanguage,
    glucoseUnit: savedUnit,
    targetRange: savedRange,
  } = useApp();

  const [language, setLanguage] = useState<AppLanguage>(savedLanguage);
  const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>(savedUnit);
  const [targetLow, setTargetLow] = useState(String(savedRange.low));
  const [targetHigh, setTargetHigh] = useState(String(savedRange.high));
  const [connectDataSource, setConnectDataSource] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (onboardingComplete) return null;

  const t = (key: string) => translate(language, key);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const low = Number(targetLow);
    const high = Number(targetHigh);
    if (!understood) {
      setError(t('onboarding.accept'));
      return;
    }
    if (!Number.isFinite(low) || !Number.isFinite(high) || low < 20 || high > 400 || low >= high) {
      setError('Enter a valid range: lower value must be at least 20 and below the upper value (up to 400 mg/dL).');
      return;
    }
    const saved = completeOnboarding({
      language,
      glucoseUnit,
      targetRange: { low, high },
      connectDataSource,
    });
    if (!saved) setError('Your preferences could not be saved in this browser. Check storage permissions and try again.');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#131b24] sm:p-7"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <header className="space-y-1">
            <h1 id="onboarding-title" className="text-xl font-bold text-slate-900 dark:text-white">
              {t('onboarding.title')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('onboarding.subtitle')}</p>
          </header>

          <label className="block space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {t('onboarding.language')}
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as AppLanguage)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {APP_LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {t('onboarding.unit')}
            <select
              value={glucoseUnit}
              onChange={(event) => setGlucoseUnit(event.target.value as GlucoseUnit)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="mg/dL">mg/dL</option>
              <option value="mmol/L">mmol/L</option>
            </select>
          </label>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t('onboarding.target')}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-[11px] text-slate-500">
                Lower
                <input
                  type="number"
                  min="20"
                  max="399"
                  value={targetLow}
                  onChange={(event) => setTargetLow(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="space-y-1 text-[11px] text-slate-500">
                Upper
                <input
                  type="number"
                  min="21"
                  max="400"
                  value={targetHigh}
                  onChange={(event) => setTargetHigh(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('onboarding.rangeHelp')}</p>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t('onboarding.source')}
            </legend>
            <label className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-700">
              <input
                type="radio"
                checked={!connectDataSource}
                onChange={() => setConnectDataSource(false)}
              />
              {t('onboarding.demo')}
            </label>
            <label className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-700">
              <input
                type="radio"
                checked={connectDataSource}
                onChange={() => setConnectDataSource(true)}
              />
              {t('onboarding.connect')}
            </label>
          </fieldset>

          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
            {t('onboarding.disclaimer')}
          </p>

          <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={understood}
              onChange={(event) => setUnderstood(event.target.checked)}
              className="mt-0.5 accent-nest-600"
            />
            {t('onboarding.accept')}
          </label>

          {error && <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{error}</p>}

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-nest-600 text-sm font-semibold text-white hover:bg-nest-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
          >
            {t('onboarding.start')}
          </button>
        </form>
      </section>
    </div>
  );
}
