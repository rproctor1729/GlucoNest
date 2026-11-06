'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { summarizeToday } from '@/utils/today';

const MMOL_FACTOR = 18.0182;

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
    { label: 'Readings', value: String(summary.readingCount) },
    { label: 'Under 70', value: String(summary.lowCount) },
    { label: 'Over 180', value: String(summary.highCount) },
    { label: 'In range', value: summary.timeInRangePercent === null ? '—' : `${summary.timeInRangePercent}%` },
    { label: 'Meals', value: `${summary.mealCount}${lastMeal ? ` · last ${lastMeal}` : ''}` },
    { label: 'Carbs', value: `${summary.carbsTotal} g` },
    { label: 'Insulin', value: `${summary.insulinUnits} units` },
  ];

  return (
    <section aria-labelledby="today-title" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b24] p-5 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="today-title" className="font-semibold text-slate-900 dark:text-white">Today so far</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {dataSource === 'demo' ? 'Showing your own logs only. Sample data is not counted.' : `Glucose in ${glucoseUnit}`}
        </p>
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3">
            <dt className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</dt>
            <dd className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
