'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { convertGlucose, formatUnitLabel } from '@/utils/glucoseUtils';
import { calculateDetailedTIR } from '@/utils/tirCalculator';
import {
  weeklyHistoricalComparisons,
  postMealResponseSamples,
} from '@/data/mockInsights';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Compass,
  Moon,
  Utensils,
  Calendar,
  AlertCircle,
  HelpCircle,
  Activity,
  CheckCircle2,
  BarChart2,
  Info,
} from 'lucide-react';

export default function InsightsSection() {
  const { readings, glucoseUnit, patterns, darkMode, isNightscoutConnected, dataSource } = useApp();

  const tirStats = calculateDetailedTIR(readings);

  // Compute overnight stats (12 AM to 6 AM)
  const overnightReadings = readings.filter((r) => {
    const parsedTimestamp = Date.parse(r.timestamp);
    const hour = Number.isFinite(parsedTimestamp)
      ? new Date(parsedTimestamp).getHours()
      : parseInt(r.timestamp.split(':')[0], 10);
    return hour >= 0 && hour <= 6;
  });
  const overnightTIR = calculateDetailedTIR(overnightReadings);

  // Formatted day-of-week comparisons data
  const chartDataWeekly = weeklyHistoricalComparisons.map((d) => ({
    ...d,
    displayMean: glucoseUnit === 'mmol/L' ? Number((d.meanGlucose / 18.0182).toFixed(1)) : d.meanGlucose,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
        {isNightscoutConnected
          ? 'NIGHTSCOUT DATA · Selected history'
          : dataSource === 'manual'
            ? 'MANUAL DATA · Entered history'
            : 'DEMO DATA · Sample history'}
      </div>
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-nest-500/10 text-nest-600 dark:text-nest-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Insights & Deterministic Analytics
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Calculated purely in client-side TypeScript. Observations, not clinical verdicts. No AI or LLMs used.
        </p>
      </div>

      {/* Overview Cards: Daily Averages & Variability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: 24h Mean & GMI */}
        <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Daily Glucose Average
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-mono">
              {isNightscoutConnected ? 'Selected history' : '24-Hour Mean'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {convertGlucose(tirStats.meanGlucose, glucoseUnit)}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {formatUnitLabel(glucoseUnit)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Estimated GMI:</span>
              <span className="font-mono font-bold text-nest-600 dark:text-nest-400">
                {tirStats.hasSufficientGmiData ? `${tirStats.gmiPercent}%` : 'Insufficient data'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {tirStats.hasSufficientGmiData
                ? 'Standard Bergenstal formula: 3.31 + (0.02392 × mean glucose). A directional proxy, not laboratory venous HbA1c.'
                : 'Requires at least 10 days of readings; this estimate is not laboratory venous HbA1c.'}
            </p>
          </div>
        </div>

        {/* Card 2: TIR Breakdown */}
        <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Time-In-Range (TIR)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              {tirStats.hasSufficientData ? `${tirStats.inRangePercent}%` : 'Insufficient data'}
            </span>
          </div>

          <div className={`h-4 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 ${tirStats.hasSufficientData ? '' : 'opacity-30'}`}>
            <div style={{ width: `${tirStats.veryLowPercent}%` }} className="bg-rose-700" title="Very Low" />
            <div style={{ width: `${tirStats.lowPercent}%` }} className="bg-rose-400" title="Low" />
            <div style={{ width: `${tirStats.inRangePercent}%` }} className="bg-emerald-500" title="In Range" />
            <div style={{ width: `${tirStats.highPercent}%` }} className="bg-amber-400" title="High" />
            <div style={{ width: `${tirStats.veryHighPercent}%` }} className="bg-orange-600" title="Very High" />
          </div>

          <div className="grid grid-cols-3 text-center text-xs pt-1 font-mono">
            <div className="p-1 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400">
              <span className="font-bold">{tirStats.hasSufficientData ? `${tirStats.timeBelowRangePercent}%` : '—'}</span>
              <div className="text-[10px] text-slate-400">Below (&lt;70)</div>
            </div>
            <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
              <span className="font-bold">{tirStats.hasSufficientData ? `${tirStats.inRangePercent}%` : '—'}</span>
              <div className="text-[10px] text-slate-400">Target (70-180)</div>
            </div>
            <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400">
              <span className="font-bold">{tirStats.hasSufficientData ? `${tirStats.timeAboveRangePercent}%` : '—'}</span>
              <div className="text-[10px] text-slate-400">Above (&gt;180)</div>
            </div>
          </div>
        </div>

        {/* Card 3: Glucose Variability (CV %) */}
        <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Glucose Variability
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800">
              {!tirStats.hasSufficientVariabilityData
                ? 'Insufficient data'
                : tirStats.coefficientOfVariation < 36 ? 'Target <36%' : 'Above <36% target'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {tirStats.hasSufficientVariabilityData ? `${tirStats.coefficientOfVariation}%` : '—'}
            </span>
            <span className="text-xs text-slate-500">CV (SD / Mean)</span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            {tirStats.hasSufficientVariabilityData ? (
              <>Standard Deviation: <strong className="font-mono text-slate-900 dark:text-white">{tirStats.standardDeviation} {formatUnitLabel(glucoseUnit)}</strong>. A CV below 36% indicates consistent stability without volatile swings.</>
            ) : 'At least two usable readings are needed to estimate variability.'}
          </div>
        </div>
      </div>

      {dataSource === 'demo' && (
      <>
      {/* Overnight Trend Observation (12 AM to 6 AM) */}
      <div className="bg-white dark:bg-[#131b24] p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Overnight Glucose Stability (12:00 AM – 6:00 AM)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluating nighttime basal coverage and dawn hepatic release.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            96% Overnight TIR
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f161e] border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Overnight Mean</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {convertGlucose(overnightTIR.meanGlucose, glucoseUnit)} {formatUnitLabel(glucoseUnit)}
            </div>
            <p className="text-[11px] text-slate-500">Very gentle overnight holding pattern</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f161e] border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Dawn Drift</span>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              +25 {formatUnitLabel(glucoseUnit)}
            </div>
            <p className="text-[11px] text-slate-500">Between 5:00 AM and 6:30 AM</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f161e] border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Nighttime Low Alarms</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              0 events
            </div>
            <p className="text-[11px] text-slate-500">No hypoglycaemia recorded &lt;70</p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-[#0f161e] rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Sample observation only:</strong> In this demo data, glucose stays fairly flat until about 5:00 AM, then rises gradually. Basal insulin decisions belong to your care team.
        </div>
      </div>

      {/* Post-Meal Comparison: Indian Staples */}
      <div className="bg-white dark:bg-[#131b24] p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Post-Meal Glucose Trajectory Comparisons
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            How different Indian meal compositions absorb and peak in sample datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {postMealResponseSamples.map((sample) => (
            <div
              key={sample.foodCategory}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {sample.foodCategory}
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Peak at {sample.peakTimeMin} min
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <div>Average Rise: <strong className="text-slate-900 dark:text-white">+{sample.avgRiseMgDl} mg/dL</strong></div>
                <div>Back to Baseline: <strong className="text-slate-900 dark:text-white">~{sample.returnToBaselineMin} min</strong></div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                {sample.observation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Day-of-Week Historical Comparison Chart */}
      <div className="bg-white dark:bg-[#131b24] p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nest-500" />
              <span>Day-of-Week Comparison (Historical Sample Week)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing average Time-In-Range across weekdays vs weekend routines.
            </p>
          </div>
          <span className="text-xs text-slate-400">Wednesday showed highest TIR (91%)</span>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#f1f5f9'} />
              <XAxis
                dataKey="dayName"
                tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold">{data.dayName}</div>
                        <div>TIR: <strong className="text-emerald-400">{data.tirPercent}%</strong></div>
                        <div>Mean: <strong className="text-nest-300">{data.displayMean} {formatUnitLabel(glucoseUnit)}</strong></div>
                        <div>Activity: <strong className="text-slate-300">{data.activeMinutes} mins</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="tirPercent" fill="#5c9183" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-[#0f161e] rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Routine Pattern:</strong> Mid-week consistency yields higher Time-In-Range due to scheduled lunch timings. Saturday showed slight variance from dining out and later dinner bolus timings.
        </div>
      </div>
      </>
      )}
      {dataSource !== 'demo' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b24] p-5 text-xs text-slate-600 dark:text-slate-400">
          {isNightscoutConnected
            ? 'Nightscout glucose metrics above are calculated from the selected readings.'
            : 'Manual glucose metrics above use only the readings you entered.'}
          {' '}Demo-only meal response, overnight narrative, and weekday comparisons are hidden rather than mixed with your data.
          {!tirStats.hasSufficientData && (
            <span className="block mt-2 font-semibold">
              Time-based range percentages need at least 12 hours of usable, closely spaced readings. Current usable coverage: {Math.floor(tirStats.coverageMinutes / 60)} hours.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
