'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { convertGlucose, formatUnitLabel } from '@/utils/glucoseUtils';
import { calculateDetailedTIR } from '@/utils/tirCalculator';
import { calculateAgpProfile } from '@/utils/agp';
import { Activity, FileText, TrendingUp } from 'lucide-react';

const MIN_MEALS_FOR_OBSERVATION = 5;

interface MealObservation {
  food: string;
  count: number;
  averageChange: number;
}

function findRepeatedMealObservation(
  meals: ReturnType<typeof useApp>['meals'],
  readings: ReturnType<typeof useApp>['readings']
): MealObservation | null {
  const validReadings = readings
    .filter((reading) => !reading.isDemo && Number.isFinite(Date.parse(reading.timestamp)))
    .sort((first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp));
  const changes = new Map<string, number[]>();

  for (const meal of meals) {
    if (meal.isDemo) continue;
    const mealTime = Date.parse(meal.timestamp);
    if (!Number.isFinite(mealTime)) continue;
    const before = validReadings
      .filter((reading) => {
        const time = Date.parse(reading.timestamp);
        return time <= mealTime && time >= mealTime - 30 * 60 * 1000;
      })
      .at(-1);
    const after = validReadings.filter((reading) => {
      const time = Date.parse(reading.timestamp);
      return time >= mealTime + 60 * 60 * 1000 && time <= mealTime + 3 * 60 * 60 * 1000;
    });
    if (!before || after.length === 0) continue;
    const peak = Math.max(...after.map((reading) => reading.value));
    const foodNames = new Set(
      (meal.items.length > 0 ? meal.items.map((item) => item.name) : [meal.name])
        .map((name) => name.trim().toLocaleLowerCase())
        .filter(Boolean)
    );
    for (const food of foodNames) {
      changes.set(food, [...(changes.get(food) ?? []), peak - before.value]);
    }
  }

  const candidates = [...changes.entries()]
    .filter(([, values]) => values.length >= MIN_MEALS_FOR_OBSERVATION)
    .sort((first, second) => second[1].length - first[1].length);
  if (candidates.length === 0) return null;

  const [food, values] = candidates[0];
  const displayName = meals
    .flatMap((meal) => meal.items.length > 0 ? meal.items.map((item) => item.name) : [meal.name])
    .find((name) => name.trim().toLocaleLowerCase() === food);
  return {
    food: displayName ?? food,
    count: values.length,
    averageChange: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
  };
}

export default function InsightsSection() {
  const { readings, meals, glucoseUnit, isNightscoutConnected, dataSource, targetRange } = useApp();
  const [reportDays, setReportDays] = useState<14 | 30 | 90>(14);
  const tirStats = calculateDetailedTIR(readings, targetRange.low, targetRange.high);
  const personalReadings = dataSource === 'demo'
    ? []
    : readings.filter((reading) => !reading.isDemo && Number.isFinite(Date.parse(reading.timestamp)));
  const mealObservation = useMemo(
    () => findRepeatedMealObservation(meals, readings),
    [meals, readings]
  );
  const reportStart = Date.now() - reportDays * 24 * 60 * 60 * 1000;
  const reportReadings = personalReadings
    .filter((reading) => Date.parse(reading.timestamp) >= reportStart)
    .sort((first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp));
  const reportStats = calculateDetailedTIR(reportReadings, targetRange.low, targetRange.high);
  const agpProfile = calculateAgpProfile(reportReadings).filter((bucket) => bucket.count >= 5);
  const agpMaximum = Math.max(
    300,
    targetRange.high + 20,
    Math.min(600, Math.ceil(Math.max(0, ...reportReadings.map((reading) => reading.value)) / 50) * 50)
  );
  const chartY = (value: number) => 285 - ((value - 20) / (agpMaximum - 20)) * 245;
  const chartX = (minute: number) => 54 + (minute / 1440) * 850;
  const agpSegments: typeof agpProfile[] = [];
  for (const bucket of agpProfile) {
    const currentSegment = agpSegments[agpSegments.length - 1];
    if (!currentSegment || bucket.minuteOfDay - currentSegment[currentSegment.length - 1].minuteOfDay > 60) {
      agpSegments.push([bucket]);
    } else {
      currentSegment.push(bucket);
    }
  }

  return (
    <>
      <div className="space-y-6 animate-fadeIn print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-nest-500/10 text-nest-600 dark:text-nest-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">My Insights</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal, descriptive summaries calculated in this browser. These are observations, not treatment advice.
            </p>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {dataSource === 'demo' ? 'DEMO DATA · SAMPLE ONLY' : isNightscoutConnected ? 'NIGHTSCOUT DATA' : 'MANUAL DATA'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="report-days" className="sr-only">Report period</label>
            <select
              id="report-days"
              value={reportDays}
              onChange={(event) => setReportDays(Number(event.target.value) as 14 | 30 | 90)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={reportReadings.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-nest-600 px-3 text-xs font-semibold text-white hover:bg-nest-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              Print / Save report
            </button>
          </div>
        </div>

        {dataSource === 'demo' ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Sample readings are for exploring the prototype only. Connect Nightscout or add your own logs to view personal summaries and reports.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#131b24]">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average glucose</h3>
                <p className="mt-2 text-3xl font-bold font-mono text-slate-900 dark:text-white">
                  {personalReadings.length ? convertGlucose(tirStats.meanGlucose, glucoseUnit) : '—'}
                  <span className="ml-2 text-sm font-medium text-slate-500">{formatUnitLabel(glucoseUnit)}</span>
                </p>
                <p className="mt-2 text-[11px] text-slate-500">{personalReadings.length} readings in the active data source.</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#131b24]">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time in your target range</h3>
                <p className="mt-2 text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                  {tirStats.hasSufficientData ? `${tirStats.inRangePercent}%` : '—'}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  Target: {convertGlucose(targetRange.low, glucoseUnit)}–{convertGlucose(targetRange.high, glucoseUnit)} {formatUnitLabel(glucoseUnit)}
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#131b24]">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Glucose variability</h3>
                <p className="mt-2 text-3xl font-bold font-mono text-slate-900 dark:text-white">
                  {tirStats.hasSufficientVariabilityData ? `${tirStats.coefficientOfVariation}%` : '—'}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">CV is a descriptive measure of variability, not a diagnosis.</p>
              </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#131b24]">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Activity className="h-4 w-4 text-nest-600 dark:text-nest-400" />
                Glucose range breakdown
              </h3>
              {tirStats.hasSufficientData ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Time in, below, and above target range">
                  <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
                    Below target: <strong>{tirStats.timeBelowRangePercent}%</strong>
                  </p>
                  <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                    In target: <strong>{tirStats.inRangePercent}%</strong>
                  </p>
                  <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    Above target: <strong>{tirStats.timeAboveRangePercent}%</strong>
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  At least 12 hours of usable, closely spaced readings are needed for time-based percentages. Current coverage: {Math.floor(tirStats.coverageMinutes / 60)} hours.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#131b24]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Repeated meal observations</h3>
              {mealObservation ? (
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  Across {mealObservation.count} logged instances of <strong>{mealObservation.food}</strong> with a nearby pre-meal reading and a reading 1–3 hours later, the average observed peak change was {mealObservation.averageChange > 0 ? '+' : ''}{convertGlucose(Math.abs(mealObservation.averageChange), glucoseUnit)} {formatUnitLabel(glucoseUnit)}.
                  {' '}This describes these entries only and does not predict future readings or suggest treatment.
                </p>
              ) : (
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  No repeated-food observation is shown yet. It requires at least {MIN_MEALS_FOR_OBSERVATION} logged instances of the same food, each with a reading within 30 minutes before eating and a reading 1–3 hours afterward. No advice or dosing recommendations are generated.
                </p>
              )}
            </section>
          </>
        )}
      </div>

      <section className="hidden p-8 text-slate-900 print:block">
        <header className="print-keep border-b border-slate-300 pb-4">
          <h1 className="text-2xl font-bold">GlucoNest glucose summary</h1>
          <p className="mt-1 text-sm">Last {reportDays} days · Generated {new Date().toLocaleString()}</p>
          <p className="text-sm">Source: {isNightscoutConnected ? 'Nightscout' : dataSource === 'manual' ? 'Manual entries' : 'Demo sample'}</p>
        </header>
        {dataSource === 'demo' ? (
          <p className="mt-6 text-sm">This is sample data and is not a personal medical report.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 py-6 text-sm">
              <p>Readings: <strong>{reportReadings.length}</strong></p>
              <p>Average: <strong>{reportReadings.length ? convertGlucose(reportStats.meanGlucose, glucoseUnit) : '—'} {formatUnitLabel(glucoseUnit)}</strong></p>
              <p>Time in target: <strong>{reportStats.hasSufficientData ? `${reportStats.inRangePercent}%` : 'Insufficient data'}</strong></p>
              <p>Below target: <strong>{reportStats.hasSufficientData ? `${reportStats.timeBelowRangePercent}%` : 'Insufficient data'}</strong></p>
              <p>Above target: <strong>{reportStats.hasSufficientData ? `${reportStats.timeAboveRangePercent}%` : 'Insufficient data'}</strong></p>
              <p>Configured range: <strong>{convertGlucose(targetRange.low, glucoseUnit)}–{convertGlucose(targetRange.high, glucoseUnit)} {formatUnitLabel(glucoseUnit)}</strong></p>
            </div>
            <h2 className="mb-2 text-base font-semibold">AGP-style time-of-day profile</h2>
            <p className="mb-2 text-xs">
              Median and 10th–90th percentile by 30-minute local-time bin. Only bins with at least five readings are plotted. This is an exploratory summary, not a standardized clinical AGP.
            </p>
            {agpProfile.length >= 12 ? (
              <svg
                viewBox="0 0 960 330"
                role="img"
                aria-label={`Time-of-day glucose profile with median and percentile band for the last ${reportDays} days`}
                className="mb-6 w-full"
              >
                <title>AGP-style glucose profile for the selected readings</title>
                <rect x="54" y={chartY(targetRange.high)} width="850" height={Math.max(0, chartY(targetRange.low) - chartY(targetRange.high))} fill="#10b981" opacity="0.08" />
                {[50, 100, 150, 200, 250, 300, 400, 500].filter((value) => value < agpMaximum).map((value) => (
                  <g key={value}>
                    <line x1="54" x2="904" y1={chartY(value)} y2={chartY(value)} stroke="#94a3b8" strokeDasharray="3 4" opacity="0.45" />
                    <text x="48" y={chartY(value) + 4} textAnchor="end" fontSize="10" fill="#475569">{convertGlucose(value, glucoseUnit)}</text>
                  </g>
                ))}
                {[0, 360, 720, 1080, 1440].map((minute, index) => (
                  <text key={minute} x={chartX(Math.min(minute, 1439))} y="310" textAnchor={index === 0 ? 'start' : index === 4 ? 'end' : 'middle'} fontSize="10" fill="#475569">
                    {`${String(Math.floor(minute / 60)).padStart(2, '0')}:00`}
                  </text>
                ))}
                {agpSegments.filter((segment) => segment.length >= 2).map((segment) => (
                  <polygon
                    key={`band-${segment[0].minuteOfDay}`}
                    points={[
                      ...segment.map((bucket) => `${chartX(bucket.minuteOfDay)},${chartY(bucket.percentile90)}`),
                      ...[...segment].reverse().map((bucket) => `${chartX(bucket.minuteOfDay)},${chartY(bucket.percentile10)}`),
                    ].join(' ')}
                    fill="#5c9183"
                    opacity="0.2"
                  />
                ))}
                {agpSegments.map((segment) => (
                  <path
                    key={`median-${segment[0].minuteOfDay}`}
                    d={segment.map((bucket, index) =>
                      `${index === 0 ? 'M' : 'L'} ${chartX(bucket.minuteOfDay)} ${chartY(bucket.median)}`
                    ).join(' ')}
                    fill="none"
                    stroke="#28685b"
                    strokeWidth="2.5"
                  />
                ))}
              </svg>
            ) : (
              <p className="mb-6 rounded-lg border border-slate-300 p-3 text-xs">
                Not enough repeat readings across the day to draw a reliable time-of-day profile. The table below includes the available readings.
              </p>
            )}
            <table className="w-full border-collapse text-xs">
              <thead><tr><th className="border p-2 text-left">Date and time</th><th className="border p-2 text-left">Glucose ({formatUnitLabel(glucoseUnit)})</th><th className="border p-2 text-left">Note</th></tr></thead>
              <tbody>
                {reportReadings.map((reading, index) => (
                  <tr key={`${reading.timestamp}-${index}`}>
                    <td className="border p-2">{new Date(reading.timestamp).toLocaleString()}</td>
                    <td className="border p-2">{convertGlucose(reading.value, glucoseUnit)}</td>
                    <td className="border p-2">{reading.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p className="mt-6 text-xs">
          Educational self-tracking summary only; not a diagnosis, medical advice, or a replacement for your clinical team. Discuss the original readings with your care team.
        </p>
      </section>
    </>
  );
}
