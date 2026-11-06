'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { summarizeToday } from '@/utils/today';
import TimeInRangeRing from '@/components/dashboard/TimeInRangeRing';

// Counts only what the user logged today. Sample entries are excluded.
export default function TodayCard() {
  const { readings, meals, insulinLogs, glucoseUnit, dataSource } = useApp();

  const summary = useMemo(
    () => summarizeToday(
      readings.filter((r) => !r.isDemo),
      meals.filter((m) => !m.isDemo),
      insulinLogs.filter((i) => !i.isDemo),
      new Date()
    ),
    [readings, meals, insulinLogs]
  );

  const lastMeal = summary.lastMealTime
    ? new Date(summary.lastMealTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const stats = [
    { label: 'Readings', value: String(summary.readingCount), tone: 'text-slate-900 dark:text-white' },
    { label: 'Under 70', value: String(summary.lowCount), tone: summary.lowCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white' },
    { label: 'Over 180', value: String(summary.highCount), tone: summary.highCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white' },
    { label: 'Meals', value: `${summary.mealCount}`, sub: lastMeal ? `last ${lastMeal}` : null, tone: 'text-slate-900 dark:text-white' },
    { label: 'Carbs', value: `${summary.carbsTotal} g`, tone: 'text-slate-900 dark:text-white' },
    { label: 'Insulin', value: `${summary.insulinUnits} u`, tone: 'text-slate-900 dark:text-white' },
  ];

  return (
    <section
      aria-labelledby="today-title"
      className="nest-card relative overflow-hidden p-5 sm:p-6"
    >
      {/* Soft decorative glow. Not interactive. */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nest-300/25 blur-3xl dark:bg-nest-600/15" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <TimeInRangeRing percent={summary.timeInRangePercent} />

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="eyebrow">Today so far</p>
            <h2 id="today-title" className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              {summary.readingCount === 0 ? 'Nothing logged yet today' : `${summary.readingCount} readings today`}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {dataSource === 'demo' ? 'Your own logs only. Sample data is not counted.' : `Glucose in ${glucoseUnit}`}
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200/70 bg-white/70 p-2.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/5 dark:bg-white/[0.03]"
              >
                <dt className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{stat.label}</dt>
                <dd className={`mt-0.5 font-mono text-base font-semibold tabular-nums ${stat.tone}`}>{stat.value}</dd>
                {stat.sub && <dd className="text-[10px] text-slate-500 dark:text-slate-400">{stat.sub}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
