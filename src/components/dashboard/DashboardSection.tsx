'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  convertGlucose,
  formatUnitLabel,
  getTrendSymbol,
  getGlucoseStatus,
  getGlucoseStatusColor,
} from '@/utils/glucoseUtils';
import { calculateDetailedTIR } from '@/utils/tirCalculator';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Clock,
  Utensils,
  Syringe,
  Activity,
  Compass,
  ArrowUpRight,
  Info,
  Calendar,
  AlertCircle,
  Plus,
  ShieldAlert,
  FileText,
  RotateCcw,
} from 'lucide-react';

export default function DashboardSection() {
  const {
    readings,
    currentReading,
    glucoseUnit,
    meals,
    insulinLogs,
    activityLogs,
    patterns,
    activePattern,
    setActivePatternId,
    darkMode,
    setIsOneTapModalOpen,
    setActiveSection,
    setIsReportModalOpen,
    resetDemoData,
    dataSource,
    connectionStatus,
    isNightscoutConnected,
    lastSuccessfulFetch,
    connectionError,
    refreshNightscout,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'3h' | '6h' | '12h' | '24h'>('24h');
  const [now, setNow] = useState(Date.now());

  const tirStats = calculateDetailedTIR(readings);

  useEffect(() => {
    if (!isNightscoutConnected) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, [isNightscoutConnected]);

  const filteredReadings = useMemo(() => {
    if (dataSource !== 'demo' && readings.length > 0) {
      const durationHours = Number.parseInt(timeRange, 10);
      const timestamps = readings.map((reading) => Date.parse(reading.timestamp)).filter(Number.isFinite);
      if (timestamps.length === readings.length) {
        const latestTimestamp = Math.max(...timestamps);
        const startTimestamp = latestTimestamp - durationHours * 60 * 60 * 1000;
        return readings.filter((reading) => Date.parse(reading.timestamp) >= startTimestamp);
      }
    }
    if (timeRange === '3h') return readings.slice(-6);
    if (timeRange === '6h') return readings.slice(-10);
    if (timeRange === '12h') return readings.slice(-16);
    return readings;
  }, [dataSource, readings, timeRange]);

  // Chart data formatted for current unit
  const chartData = useMemo(() => {
    return filteredReadings.map((r) => {
      const displayVal = glucoseUnit === 'mmol/L' ? Number((r.value / 18.0182).toFixed(1)) : r.value;
      return {
        ...r,
        displayValue: displayVal,
        chartTime: Number.isFinite(Date.parse(r.timestamp))
          ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : r.timeLabel,
      };
    });
  }, [filteredReadings, glucoseUnit]);

  // Target band values in current unit
  const targetLow = glucoseUnit === 'mmol/L' ? 3.9 : 70;
  const targetHigh = glucoseUnit === 'mmol/L' ? 10.0 : 180;
  const yDomainMin = glucoseUnit === 'mmol/L' ? 2.5 : 40;
  const yDomainMax = glucoseUnit === 'mmol/L' ? 16.5 : 300;

  // Build unified daily activity timeline
  const dailyTimeline = useMemo(() => {
    const events: Array<{
      id: string;
      time: string;
      type: 'meal' | 'insulin' | 'activity' | 'glucose';
      title: string;
      detail: string;
    }> = [];

    // From readings with events
    readings
      .filter((r) => r.event)
      .forEach((r) => {
        events.push({
          id: r.id || 't-' + r.timestamp,
          time: r.timeLabel,
          type: r.event as any,
          title: r.event === 'meal' ? 'Meal Logged' : r.event === 'insulin' ? 'Insulin Dose' : 'Activity',
          detail: r.eventDetails || `${r.value} ${formatUnitLabel(glucoseUnit)}`,
        });
      });

    // From meals
    const visibleMeals = dataSource === 'demo' ? meals : meals.filter((meal) => !meal.isDemo);
    const visibleInsulinLogs = dataSource === 'demo' ? insulinLogs : insulinLogs.filter((log) => !log.isDemo);
    const visibleActivityLogs = dataSource === 'demo' ? activityLogs : activityLogs.filter((log) => !log.isDemo);

    visibleMeals.forEach((m) => {
      const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      events.push({
        id: m.id,
        time: timeStr,
        type: 'meal',
        title: m.name,
        detail: `${m.totalCarbs}g estimated carbs`,
      });
    });

    // From insulin logs
    visibleInsulinLogs.forEach((i) => {
      const timeStr = new Date(i.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      events.push({
        id: i.id,
        time: timeStr,
        type: 'insulin',
        title: `${i.units}u ${i.type === 'rapid' ? 'Rapid Bolus' : 'Basal'}`,
        detail: i.notes || `${i.brandName || 'Insulin'}`,
      });
    });

    // From activity
    visibleActivityLogs.forEach((a) => {
      const timeStr = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      events.push({
        id: a.id,
        time: timeStr,
        type: 'activity',
        title: `${a.durationMinutes} min ${a.type}`,
        detail: a.notes || `${a.intensity} intensity`,
      });
    });

    // Return unique items (latest first)
    return events.slice(0, 7);
  }, [readings, meals, insulinLogs, activityLogs, glucoseUnit, dataSource]);

  if (!currentReading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="rounded-2xl border border-nest-200 dark:border-nest-900/60 bg-white dark:bg-[#131b24] p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Connected to Nightscout
              </span>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">No glucose readings available</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                The instance returned no valid readings. Demo readings are not mixed with this source.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refreshNightscout()}
              disabled={connectionStatus === 'fetching'}
              className="h-10 px-4 rounded-xl bg-nest-600 hover:bg-nest-700 disabled:opacity-60 text-white text-xs font-semibold"
            >
              {connectionStatus === 'fetching' ? 'Fetching…' : 'Refresh'}
            </button>
          </div>
          {connectionError && <p role="alert" className="text-xs text-amber-700 dark:text-amber-300">{connectionError}</p>}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last successful fetch: {lastSuccessfulFetch ? new Date(lastSuccessfulFetch).toLocaleString() : 'Not available'}
          </p>
          <button
            type="button"
            onClick={() => setActiveSection('devices')}
            className="text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline"
          >
            Manage data sources
          </button>
        </div>
      </div>
    );
  }

  const trend = currentReading.trend ? getTrendSymbol(currentReading.trend) : null;
  const status = getGlucoseStatus(currentReading.value);
  const statusColors = getGlucoseStatusColor(status, darkMode);
  const latestReadingTime = Number.isFinite(Date.parse(currentReading.timestamp))
    ? new Date(currentReading.timestamp).toLocaleString()
    : currentReading.timeLabel;
  const readingIsStale = isNightscoutConnected &&
    Number.isFinite(Date.parse(currentReading.timestamp)) &&
    now - Date.parse(currentReading.timestamp) > 10 * 60 * 1000;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <div className={`rounded-xl border p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs ${
        isNightscoutConnected
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
          : dataSource === 'manual'
            ? 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
            isNightscoutConnected
              ? 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100'
              : dataSource === 'manual'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                : 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100'
          }`}>
            {isNightscoutConnected ? 'NIGHTSCOUT DATA' : dataSource === 'manual' ? 'MANUAL DATA' : 'DEMO DATA'}
          </span>
          <span className="font-medium">
            {isNightscoutConnected
              ? `Read-only Nightscout history · Last fetched ${lastSuccessfulFetch ? new Date(lastSuccessfulFetch).toLocaleString() : 'not yet'}`
              : dataSource === 'manual'
                ? 'Manually entered glucose readings only · demo samples are not included.'
                : 'Prototype preview: sample readings and analytics for exploration.'}
          </span>
          {readingIsStale && <span className="font-semibold">Last reading is stale · {latestReadingTime}</span>}
        </div>
        <div className="flex items-center gap-3">
          {isNightscoutConnected && (
            <button
              type="button"
              onClick={() => void refreshNightscout()}
              disabled={connectionStatus === 'fetching'}
              className="font-semibold hover:underline disabled:opacity-60"
            >
              {connectionStatus === 'fetching' ? 'Fetching…' : 'Refresh'}
            </button>
          )}
          {dataSource === 'demo' && (
            <button
              type="button"
              onClick={resetDemoData}
              className="flex items-center gap-1 hover:underline font-semibold"
              title="Reset to default sample data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveSection('devices')}
            className="font-semibold hover:underline"
          >
            Data sources
          </button>
        </div>
        {connectionError && isNightscoutConnected && (
          <p role="alert" className="basis-full">{connectionError} Showing the last successfully fetched readings.</p>
        )}
        {connectionError && !isNightscoutConnected && (
          <p role="alert" className="basis-full font-medium">
            Nightscout connection failed: {connectionError} Demo data remains active.
          </p>
        )}
      </div>

      {/* The Big Number First Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Glucose Value Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-subtle flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isNightscoutConnected ? 'Latest Glucose' : dataSource === 'manual' ? 'Manual Glucose' : 'Sample Glucose (My Day)'}
                </span>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColors.badgeBg}`}>
                {statusColors.label}
              </span>
            </div>

            {/* Huge Tabular Number + Trend Arrow */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-7xl sm:text-8xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                {convertGlucose(currentReading.value, glucoseUnit)}
              </span>

              <div className="flex flex-col">
                {trend && (
                  <span className="text-3xl font-bold text-nest-600 dark:text-nest-400" title={trend.text}>
                    {trend.symbol}
                  </span>
                )}
                <span className="text-xs font-medium text-slate-500 font-mono">
                  {formatUnitLabel(glucoseUnit)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {trend ? `${trend.text} · ` : ''}
              {isNightscoutConnected
                ? `Reading timestamp: ${latestReadingTime}`
                : dataSource === 'manual' ? `Manual reading · ${latestReadingTime}` : `Demo reading · ${latestReadingTime}`}
            </p>
          </div>

          {/* Time-in-Range Breakdown Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Time In Range (TIR)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {tirStats.hasSufficientData ? `${tirStats.inRangePercent}% (Target >70%)` : 'Insufficient data'}
              </span>
            </div>

            {/* Horizontal Mini Stack */}
            <div className={`h-3 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 ${tirStats.hasSufficientData ? '' : 'opacity-30'}`}>
              <div style={{ width: `${tirStats.veryLowPercent}%` }} className="bg-rose-700" title={`Urgent Low: ${tirStats.veryLowPercent}%`} />
              <div style={{ width: `${tirStats.lowPercent}%` }} className="bg-rose-400" title={`Low: ${tirStats.lowPercent}%`} />
              <div style={{ width: `${tirStats.inRangePercent}%` }} className="bg-emerald-500" title={`In Range: ${tirStats.inRangePercent}%`} />
              <div style={{ width: `${tirStats.highPercent}%` }} className="bg-amber-400" title={`High: ${tirStats.highPercent}%`} />
              <div style={{ width: `${tirStats.veryHighPercent}%` }} className="bg-orange-600" title={`Very High: ${tirStats.veryHighPercent}%`} />
            </div>

            {/* TBR and TAR pill breakdown */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
              <span className="text-rose-600 dark:text-rose-400">TBR: {tirStats.hasSufficientData ? `${tirStats.timeBelowRangePercent}%` : '—'}</span>
              <span className="text-emerald-600 dark:text-emerald-400">TIR: {tirStats.hasSufficientData ? `${tirStats.inRangePercent}%` : '—'}</span>
              <span className="text-amber-600 dark:text-amber-400">TAR: {tirStats.hasSufficientData ? `${tirStats.timeAboveRangePercent}%` : '—'}</span>
            </div>
          </div>
        </div>

        {dataSource === 'demo' ? (
        <div className="lg:col-span-7 bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-nest-500/10 text-nest-600 dark:text-nest-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-nest-700 dark:text-nest-300">
                  {activePattern.eyebrow}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                {activePattern.impactMetric}
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                "{activePattern.observation}"
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {activePattern.encouragementAdvice}
              </p>
            </div>

            {/* Context Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f161e] border border-slate-200/70 dark:border-slate-800/80 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <Info className="w-3.5 h-3.5 text-nest-500 shrink-0" />
                <span>Deterministic Observation (No AI or Diagnostic Conclusions):</span>
              </div>
              <p className="leading-relaxed">
                {activePattern.historicalContext} Glucose numbers are neutral data. Patterns turn raw readings into practical, shame-free ideas to try.
              </p>
            </div>
          </div>

          {/* Pattern selector tabs */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-medium">
              Explore other demo observations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {patterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePatternId(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activePattern.id === p.id
                      ? 'bg-nest-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p.title.split(' ')[0]}...
                </button>
              ))}
            </div>
          </div>
          </div>
          ) : (
            <div className="lg:col-span-7 bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Compass className="w-4 h-4 text-nest-600 dark:text-nest-400" />
                Demo patterns hidden
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Sample observations and suggestions are not derived from this data source. No insulin adjustment advice is provided.
              </p>
            </div>
            )}
      </div>

      {/* Glucose Curve Section with Target Band */}
      <div className="bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>              {isNightscoutConnected ? 'Nightscout Glucose History' : dataSource === 'manual' ? 'Manual Glucose History' : 'Continuous Demo Glucose Curve'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                Target: {targetLow}–{targetHigh} {formatUnitLabel(glucoseUnit)}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isNightscoutConnected
                ? 'Read-only glucose history from your connected Nightscout instance.'
                : dataSource === 'manual'
                  ? 'Glucose values recorded manually in Quick Log; no demo readings are included.'
                  : 'Interactive timeline with sample glucose values. Hover data points to view details.'}
            </p>
          </div>

          {/* Time range selectors */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 text-xs">
            {(['3h', '6h', '12h', '24h'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Curve */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="chartTime"
                tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }}
                axisLine={{ stroke: darkMode ? '#334155' : '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[yDomainMin, yDomainMax]}
                tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }}
                axisLine={{ stroke: darkMode ? '#334155' : '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                        <div className="font-mono text-slate-400">{data.timeLabel}</div>
                        <div className="text-base font-bold font-mono">
                          {data.displayValue} {formatUnitLabel(glucoseUnit)}
                        </div>
                        {data.notes && (
                          <div className="text-amber-300 text-[11px] font-medium">{data.notes}</div>
                        )}
                        {data.eventDetails && (
                          <div className="text-nest-300 text-[11px]">{data.eventDetails}</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Shaded Target Range Area (70-180 mg/dL) */}
              <ReferenceArea
                y1={targetLow}
                y2={targetHigh}
                fill="#10b981"
                fillOpacity={darkMode ? 0.08 : 0.06}
              />

              {/* Target Boundaries */}
              <ReferenceLine
                y={targetHigh}
                stroke={darkMode ? '#334155' : '#e2e8f0'}
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={targetLow}
                stroke={darkMode ? '#334155' : '#e2e8f0'}
                strokeDasharray="3 3"
              />

              {/* Main Smooth Glucose Line */}
              <Line
                type="monotone"
                dataKey="displayValue"
                stroke="#5c9183"
                strokeWidth={2.75}
                dot={false}
                activeDot={{ r: 5, fill: '#5c9183', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40"></span>
              <span>Target Band ({targetLow}–{targetHigh})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-nest-500"></span>
              <span>{isNightscoutConnected ? 'Nightscout trace' : dataSource === 'manual' ? 'Manual readings' : 'Continuous Demo Trace'}</span>
            </div>
          </div>
          <span className="text-[11px]">{isNightscoutConnected ? 'NIGHTSCOUT DATA · Read-only' : dataSource === 'manual' ? 'MANUAL DATA' : 'DEMO DATA · Sample T1D profile'}</span>
        </div>
      </div>

      {/* Daily Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131b24] p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Average Glucose</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {convertGlucose(tirStats.meanGlucose, glucoseUnit)}{' '}
            <span className="text-xs font-normal text-slate-400">{formatUnitLabel(glucoseUnit)}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {isNightscoutConnected
              ? `${tirStats.totalReadings} readings · ${Math.floor(tirStats.coverageMinutes / 60)}h usable coverage`
              : dataSource === 'manual' ? `${tirStats.totalReadings} manual readings` : 'Based on 24-hr sample'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#131b24] p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Estimated GMI</span>
          <div className="text-xl font-bold font-mono text-nest-600 dark:text-nest-400">
            {tirStats.hasSufficientGmiData ? `${tirStats.gmiPercent}%` : 'Insufficient data'}
          </div>
          <span className="text-[10px] text-slate-400">
            {tirStats.hasSufficientGmiData
              ? 'CGM estimate (not lab HbA1c)'
              : 'Requires at least 10 days of readings'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#131b24] p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Variability (CV)</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {tirStats.hasSufficientVariabilityData ? `${tirStats.coefficientOfVariation}%` : 'Insufficient data'}
          </div>
          <span className="text-[10px] text-slate-400">
            {tirStats.hasSufficientVariabilityData ? 'CV (SD / mean)' : 'Requires at least 2 usable readings'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#131b24] p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Lowest / Highest</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {convertGlucose(tirStats.minReading, glucoseUnit)} / {convertGlucose(tirStats.maxReading, glucoseUnit)}
          </div>
          <span className="text-[10px] text-slate-400">{formatUnitLabel(glucoseUnit)} span</span>
        </div>
      </div>

      {/* Daily Activity Timeline & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Stream */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Activity & Meal Timeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recent meals, insulin events, and activity logs.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('quick-log')}
              className="text-xs font-semibold text-nest-600 dark:text-nest-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {dataSource !== 'demo' ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Demo meal and activity samples are hidden while using {isNightscoutConnected ? 'Nightscout' : 'manual'} glucose data.
              </p>
            ) : dailyTimeline.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {item.type === 'meal' ? (
                      <Utensils className="w-4 h-4 text-amber-500" />
                    ) : item.type === 'insulin' ? (
                      <Syringe className="w-4 h-4 text-nest-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400">{item.detail}</div>
                  </div>
                </div>
                <div className="font-mono text-slate-500 dark:text-slate-400">{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Navigation Callouts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-subtle space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Explore Community Prototype Tools
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveSection('food-library')}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-nest-500 bg-slate-50 dark:bg-slate-900/50 text-left transition-colors flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-nest-600 dark:group-hover:text-nest-400">
                      Indian Food Library
                    </div>
                    <div className="text-[11px] text-slate-400">40+ foods, servings & meal builder</div>
                  </div>
                </div>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('insights')}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-nest-500 bg-slate-50 dark:bg-slate-900/50 text-left transition-colors flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-nest-500" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-nest-600 dark:group-hover:text-nest-400">
                      My Insights & Analytics
                    </div>
                    <div className="text-[11px] text-slate-400">Deterministic weekly & post-meal trends</div>
                  </div>
                </div>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-nest-500 bg-slate-50 dark:bg-slate-900/50 text-left transition-colors flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-nest-600 dark:group-hover:text-nest-400">
                      Doctor-Ready Clinical PDF
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {dataSource === 'demo'
                        ? 'Printable sample AGP summary (14/30/90 days)'
                        : 'Sample report preview only; not generated from selected readings'}
                    </div>
                  </div>
                </div>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('feedback')}
                className="w-full p-3 rounded-xl border border-nest-200 dark:border-nest-800 bg-nest-50/50 dark:bg-nest-950/20 text-left transition-colors flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-nest-600 dark:text-nest-400" />
                  <div>
                    <div className="font-semibold text-nest-800 dark:text-nest-200">
                      Help Shape GlucoNest
                    </div>
                    <div className="text-[11px] text-nest-600 dark:text-nest-400">Share your thoughts on this prototype</div>
                  </div>
                </div>
                <span className="text-nest-600 dark:text-nest-400 font-bold">Feedback →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
