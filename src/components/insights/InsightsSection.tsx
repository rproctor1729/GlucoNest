'use client';

import { useMemo } from 'react';
import { Activity, ArrowDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { convertGlucose, formatUnitLabel } from '@/utils/glucoseUtils';
import { calculateDetailedTIR } from '@/utils/tirCalculator';
import { findRepeatedMealObservation } from '@/utils/mealObservations';

export default function InsightsSection() {
  const { readings, meals, glucoseUnit, dataSource, targetRange, setActiveSection } = useApp();
  const personalReadings = useMemo(() => dataSource === 'demo' ? [] : readings.filter(r => !r.isDemo), [readings, dataSource]);
  const stats = useMemo(() => calculateDetailedTIR(personalReadings, targetRange.low, targetRange.high), [personalReadings, targetRange]);
  const observation = useMemo(() => findRepeatedMealObservation(meals, personalReadings), [meals, personalReadings]);
  const unit = formatUnitLabel(glucoseUnit);
  const fmt = (value: number) => convertGlucose(value, glucoseUnit);
  const metrics = [
    { label: 'Average glucose', value: stats.totalReadings ? `${fmt(stats.meanGlucose)} ${unit}` : '—', note: `${stats.totalReadings} valid readings in your active source.` },
    { label: 'Time in your range', value: stats.hasSufficientData ? `${stats.inRangePercent}%` : '—', note: `${fmt(targetRange.low)}–${fmt(targetRange.high)} ${unit}` },
    { label: 'Glucose variability', value: stats.hasSufficientVariabilityData ? `${stats.coefficientOfVariation}%` : '—', note: 'Coefficient of variation (CV).' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else setActiveSection('devices');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-nest-100 px-3 py-1.5 text-[11px] font-semibold text-nest-800 dark:bg-nest-950 dark:text-nest-200">
          {dataSource === 'demo' ? 'Sample data' : dataSource === 'nightscout' ? 'Nightscout readings' : 'Your saved readings'}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-nest-700 hover:bg-nest-50 dark:border-slate-700 dark:text-nest-200 dark:hover:bg-nest-950 transition-colors"
          onClick={() => scrollToSection('doctor-report')}
        >
          <span>Jump to doctor report</span>
          <ArrowDown size={14} aria-hidden="true" />
        </button>
      </div>

      {!personalReadings.length ? (
        <div className="nest-card p-7 space-y-4">
          <Activity size={25} className="text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Your own data brings this space to life.</h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Connect Nightscout or import personal readings below to see your time-in-range, averages, repeated meal observations, and clinical report.
          </p>
          <button
            type="button"
            className="button-primary inline-flex items-center gap-2"
            onClick={() => scrollToSection('data-sources')}
          >
            <span>Connect a data source below</span>
            <ArrowDown size={15} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Glucose summary">
            {metrics.map(item => (
              <article key={item.label} className="nest-card p-5">
                <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.label}</h3>
                <p className="mt-3 font-mono text-2xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.note}</p>
              </article>
            ))}
          </section>

          <section className="nest-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Glucose range breakdown</h2>
            {stats.hasSufficientData ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  Below range: <strong>{stats.timeBelowRangePercent}%</strong>
                </p>
                <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  Within range: <strong>{stats.inRangePercent}%</strong>
                </p>
                <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  Above range: <strong>{stats.timeAboveRangePercent}%</strong>
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                At least 12 hours of usable, closely spaced readings are needed for time-based percentages. Current coverage: {Math.floor(stats.coverageMinutes / 60)} hours.
              </p>
            )}
          </section>

          <section className="nest-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Repeated meal observations</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {observation ? (
                <>Across {observation.count} entries of <strong>{observation.food}</strong>, the average observed peak change was {observation.averageChange > 0 ? '+' : observation.averageChange < 0 ? '−' : ''}{fmt(Math.abs(observation.averageChange))} {unit}. This describes these logs; it does not predict your next reading.</>
              ) : (
                'Add at least five entries of the same food, each with a reading within 30 minutes before and 1–3 hours after the meal, to see an observation.'
              )}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
