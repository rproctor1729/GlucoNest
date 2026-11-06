'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  convertGlucose,
  formatUnitLabel,
  getTrendSymbol,
  getGlucoseStatus,
  getGlucoseStatusColor,
} from '@/utils/glucoseUtils';
import { calculateDetailedTIR } from '@/utils/tirCalculator';
import { translate } from '@/lib/i18n';
import TodayCard from '@/components/dashboard/TodayCard';
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

export default function DashboardSection() {
  const {
    readings,
    currentReading,
    glucoseUnit,
    patterns,
    activePattern,
    setActivePatternId,
    setActiveSection,
    resetDemoData,
    dataSource,
    connectionStatus,
    isNightscoutConnected,
    lastSuccessfulFetch,
    connectionError,
    refreshNightscout,
    darkMode,
    targetRange,
    language,
    meals,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'3h' | '6h' | '12h' | '24h'>('24h');
  const [now, setNow] = useState(Date.now());
  const [glucoseDetailsExpanded, setGlucoseDetailsExpanded] = useState(false);

  const tirStats = calculateDetailedTIR(readings, targetRange.low, targetRange.high);

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

  const chartData = useMemo(() => filteredReadings.map((reading) => ({
    ...reading,
    displayValue: glucoseUnit === 'mmol/L'
      ? Number((reading.value / 18.0182).toFixed(1))
      : reading.value,
    chartTime: Number.isFinite(Date.parse(reading.timestamp))
      ? new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : reading.timeLabel,
  })), [filteredReadings, glucoseUnit]);

  const targetLow = glucoseUnit === 'mmol/L'
    ? Number((targetRange.low / 18.0182).toFixed(1))
    : targetRange.low;
  const targetHigh = glucoseUnit === 'mmol/L'
    ? Number((targetRange.high / 18.0182).toFixed(1))
    : targetRange.high;
  const yDomainMin = glucoseUnit === 'mmol/L' ? 2.5 : 40;
  const yDomainMax = glucoseUnit === 'mmol/L' ? 16.5 : 300;

  if (!currentReading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <TodayCard />
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
  const status = getGlucoseStatus(currentReading.value, targetRange.low, targetRange.high);
  // Ambient glow follows the status. The status label beside it carries the meaning, so colour is not the only cue.
  const glowClass = status === 'very-low' || status === 'low'
    ? 'bg-rose-400/25 dark:bg-rose-500/20'
    : status === 'high' || status === 'very-high'
      ? 'bg-amber-300/25 dark:bg-amber-500/15'
      : 'bg-emerald-300/25 dark:bg-emerald-500/15';
  // "Live" only for fresh Nightscout data. Demo and manual readings are never presented as live.
  const statusColors = getGlucoseStatusColor(status, darkMode, targetRange.low, targetRange.high);
  const statusLabel = status === 'in-range'
    ? translate(language, 'dashboard.inRange')
    : status === 'low' || status === 'very-low'
      ? translate(language, 'dashboard.low')
      : translate(language, 'dashboard.high');
  const latestReadingTime = Number.isFinite(Date.parse(currentReading.timestamp))
    ? new Date(currentReading.timestamp).toLocaleString()
    : currentReading.timeLabel;
  const readingIsStale = isNightscoutConnected &&
    Number.isFinite(Date.parse(currentReading.timestamp)) &&
    now - Date.parse(currentReading.timestamp) > 10 * 60 * 1000;
  // "Live" only for fresh Nightscout data. Demo and manual readings are never presented as live.
  const showLive = isNightscoutConnected && !readingIsStale;
  const todayKey = new Date(now).toDateString();
  const todaysReadings = readings.filter((reading) => {
    const timestamp = Date.parse(reading.timestamp);
    return Number.isFinite(timestamp) && new Date(timestamp).toDateString() === todayKey;
  });
  const todaysStats = calculateDetailedTIR(todaysReadings, targetRange.low, targetRange.high);
  const lowsToday = todaysReadings.filter((reading) => reading.value < targetRange.low).length;
  const latestMealToday = [...meals]
    .filter((meal) => new Date(meal.timestamp).toDateString() === todayKey)
    .sort((first, second) => Date.parse(second.timestamp) - Date.parse(first.timestamp))[0];

  // Marks the newest point on the chart with a slow halo. Only the last point gets it.
  const newestIndex = chartData.length - 1;
  const renderNewestDot = (props: { cx?: number; cy?: number; index?: number }) => {
    if (props.index !== newestIndex || props.cx === undefined || props.cy === undefined) {
      return <g key={`dot-${props.index ?? 'none'}`} />;
    }
    return (
      <g key={`newest-${props.index}`}>
        <circle
          cx={props.cx}
          cy={props.cy}
          r={9}
          fill="#5c9183"
          className="gn-pulse-ring"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        <circle cx={props.cx} cy={props.cy} r={4.5} fill="#5c9183" stroke="#ffffff" strokeWidth={2} />
      </g>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fadeIn">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131b24] p-4 sm:p-6 shadow-subtle">
        <div aria-hidden="true" className={`gn-breathe pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl ${glowClass}`} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${
            isNightscoutConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : dataSource === 'manual'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
          }`}>
            {isNightscoutConnected ? 'NIGHTSCOUT DATA' : dataSource === 'manual' ? 'MANUAL DATA' : 'DEMO DATA'}
          </span>
          <div className="flex items-center gap-3 text-xs">
            {isNightscoutConnected && (
              <button
                type="button"
                onClick={() => void refreshNightscout()}
                disabled={connectionStatus === 'fetching'}
                className="font-semibold text-slate-600 dark:text-slate-300 hover:underline disabled:opacity-60"
              >
                {connectionStatus === 'fetching' ? 'Fetching…' : 'Refresh'}
              </button>
            )}
            {dataSource === 'demo' && (
              <button
                type="button"
                onClick={resetDemoData}
                className="font-semibold text-slate-600 dark:text-slate-300 hover:underline"
              >
                Reset demo
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSection('devices')}
              className="font-semibold text-nest-700 dark:text-nest-300 hover:underline"
            >
              Data sources
            </button>
          </div>
        </div>

        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {isNightscoutConnected
            ? `Read-only Nightscout · Last fetched ${lastSuccessfulFetch ? new Date(lastSuccessfulFetch).toLocaleString() : 'not yet'}`
            : dataSource === 'manual'
              ? 'Manually entered readings only; demo samples are not included.'
              : 'Sample readings for exploring the prototype.'}
          {readingIsStale && <span className="ml-2 font-semibold">Last reading is stale · {latestReadingTime}</span>}
        </p>
        {connectionError && (
          <p role="alert" className="mt-2 text-xs text-amber-700 dark:text-amber-300">
            {connectionError} {isNightscoutConnected ? 'Showing the last successfully fetched readings.' : 'Demo data remains active.'}
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 sm:items-center gap-5 sm:gap-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{translate(language, 'dashboard.current')}</span>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusColors.badgeBg}`}>
                {statusLabel}
              </span>
              {showLive && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="gn-live-dot absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white tabular-nums">
                {convertGlucose(currentReading.value, glucoseUnit)}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{formatUnitLabel(glucoseUnit)}</span>
              {trend && (
                <span className="text-2xl font-bold text-nest-600 dark:text-nest-400" title={trend.text} aria-label={trend.text}>
                  {trend.symbol}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {trend ? `${trend.text} · ` : ''}{latestReadingTime}
            </p>
          </div>

          <div className="sm:border-l sm:border-slate-100 sm:dark:border-slate-800 sm:pl-7">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{translate(language, 'dashboard.tir')}</span>
              <span className="text-3xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
                {tirStats.hasSufficientData ? `${tirStats.inRangePercent}%` : '—'}
              </span>
            </div>
            <div
              className="mt-2 h-2.5 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800"
              role="img"
              aria-label={tirStats.hasSufficientData
                ? `Time in range ${tirStats.inRangePercent}%, below range ${tirStats.timeBelowRangePercent}%, above range ${tirStats.timeAboveRangePercent}%`
                : 'Time in range unavailable due to insufficient readings'}
            >
              {tirStats.hasSufficientData && (
                <>
                  <div style={{ width: `${tirStats.veryLowPercent}%` }} className="bg-rose-700" />
                  <div style={{ width: `${tirStats.lowPercent}%` }} className="bg-rose-400" />
                  <div style={{ width: `${tirStats.inRangePercent}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${tirStats.highPercent}%` }} className="bg-amber-400" />
                  <div style={{ width: `${tirStats.veryHighPercent}%` }} className="bg-orange-600" />
                </>
              )}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
              <span className="text-rose-600 dark:text-rose-400">TBR {tirStats.hasSufficientData ? `${tirStats.timeBelowRangePercent}%` : '—'}</span>
              <span className="text-emerald-600 dark:text-emerald-400">TIR {tirStats.hasSufficientData ? `${tirStats.inRangePercent}%` : '—'}</span>
              <span className="text-amber-600 dark:text-amber-400">TAR {tirStats.hasSufficientData ? `${tirStats.timeAboveRangePercent}%` : '—'}</span>
            </div>
            {!tirStats.hasSufficientData && (
              <p className="mt-1 text-[10px] text-slate-400">
                At least 12 hours of usable readings are needed for time-based percentages.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            type="button"
            aria-expanded={glucoseDetailsExpanded}
            aria-controls="glucose-details"
            onClick={() => setGlucoseDetailsExpanded((expanded) => !expanded)}
            className="inline-flex min-h-8 items-center gap-2 text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
          >
            {glucoseDetailsExpanded
              ? translate(language, 'dashboard.hideDetails')
              : translate(language, 'dashboard.details')}
            <span aria-hidden="true" className={`transition-transform duration-200 ${glucoseDetailsExpanded ? 'rotate-180' : ''}`}>⌄</span>
          </button>
          <div
            id="glucose-details"
            aria-hidden={!glucoseDetailsExpanded}
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
              glucoseDetailsExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-3 sm:grid-cols-3">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Average glucose</div>
                  <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                    {convertGlucose(tirStats.meanGlucose, glucoseUnit)} {formatUnitLabel(glucoseUnit)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Lowest glucose</div>
                  <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                    {convertGlucose(tirStats.minReading, glucoseUnit)} {formatUnitLabel(glucoseUnit)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Highest glucose</div>
                  <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                    {convertGlucose(tirStats.maxReading, glucoseUnit)} {formatUnitLabel(glucoseUnit)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Glucose variability (CV)</div>
                  <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                    {tirStats.hasSufficientVariabilityData ? `${tirStats.coefficientOfVariation}%` : 'Insufficient data'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Estimated GMI</div>
                  <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                    {tirStats.hasSufficientGmiData ? `${tirStats.gmiPercent}%` : 'Insufficient data'}
                  </div>
                </div>
              </div>
              {isNightscoutConnected && (
                <p className="pt-2 text-[10px] text-slate-400">
                  {tirStats.totalReadings} readings · {Math.floor(tirStats.coverageMinutes / 60)}h usable coverage
                  {!tirStats.hasSufficientGmiData && ' · GMI requires at least 10 days of readings'}
                </p>
              )}
              {tirStats.hasSufficientGmiData && (
                <p className="pt-1 text-[10px] text-slate-400">Estimated GMI is a CGM-derived estimate, not laboratory HbA1c.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Today so far"
        className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-[#131b24] sm:grid-cols-3"
      >
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Today so far · Time in range</div>
          <div className="mt-1 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
            {todaysStats.hasSufficientData ? `${todaysStats.inRangePercent}%` : 'Not enough data'}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Readings below your range</div>
          <div className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-white">{lowsToday}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Last meal logged today</div>
          <div className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
            {latestMealToday?.name ?? 'No meal logged today'}
          </div>
          {latestMealToday?.isDemo && <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300">SAMPLE</span>}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131b24] p-4 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isNightscoutConnected ? 'Nightscout glucose history' : dataSource === 'manual' ? 'Manual glucose history' : 'Continuous glucose curve'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target: {targetLow}–{targetHigh} {formatUnitLabel(glucoseUnit)}
              {dataSource === 'demo' ? ' · Sample readings' : isNightscoutConnected ? ' · Read-only data' : ' · Quick Log readings'}
            </p>
          </div>
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-0.5 text-xs" aria-label="Chart time range">
            {(['3h', '6h', '12h', '24h'] as const).map((range) => (
              <button
                key={range}
                type="button"
                aria-pressed={timeRange === range}
                onClick={() => setTimeRange(range)}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
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

        <div id="glucose-chart-description" className="sr-only">
          {translate(language, 'dashboard.chartSummary')}
        </div>
        <div className="h-[320px] sm:h-[420px] lg:h-[480px] w-full" role="region" aria-label="Glucose chart" aria-describedby="glucose-chart-description">
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
                        <div className="tabular-nums text-slate-400">{data.timeLabel}</div>
                        <div className="text-base font-bold tabular-nums">
                          {data.displayValue} {formatUnitLabel(glucoseUnit)}
                        </div>
                        {data.notes && <div className="text-amber-300 text-[11px] font-medium">{data.notes}</div>}
                        {data.eventDetails && <div className="text-nest-300 text-[11px]">{data.eventDetails}</div>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceArea y1={targetLow} y2={targetHigh} fill="#10b981" fillOpacity={darkMode ? 0.08 : 0.06} />
              <ReferenceLine y={targetHigh} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />
              <ReferenceLine y={targetLow} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="displayValue"
                stroke="#5c9183"
                strokeWidth={2.75}
                dot={renderNewestDot}
                activeDot={{ r: 5, fill: '#5c9183', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <details className="border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <summary className="cursor-pointer font-semibold text-nest-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 dark:text-nest-300">
            Text alternative: view chart readings
          </summary>
          <div className="mt-3 max-h-64 overflow-auto">
            <table className="w-full text-left text-[11px]">
              <caption className="sr-only">Glucose readings shown in the continuous glucose chart</caption>
              <thead className="sticky top-0 bg-white text-slate-500 dark:bg-[#131b24] dark:text-slate-400">
                <tr>
                  <th scope="col" className="p-2">Time</th>
                  <th scope="col" className="p-2">Glucose ({formatUnitLabel(glucoseUnit)})</th>
                  <th scope="col" className="p-2">Reading note</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((reading, index) => (
                  <tr key={`${reading.timestamp}-${index}`} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-2 tabular-nums">{reading.chartTime}</td>
                    <td className="p-2 tabular-nums">{reading.displayValue}</td>
                    <td className="p-2">{reading.notes || 'No note'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" />
              <span>Target band ({targetLow}–{targetHigh})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-nest-500" />
              <span>{isNightscoutConnected ? 'Nightscout trace' : dataSource === 'manual' ? 'Manual readings' : 'Demo trace'}</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold tracking-wide">
            {isNightscoutConnected ? 'NIGHTSCOUT DATA' : dataSource === 'manual' ? 'MANUAL DATA' : 'DEMO DATA'}
          </span>
        </div>
      </section>

      {dataSource === 'demo' && activePattern && (
        <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131b24] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today&apos;s insight</h2>
                <span className="rounded bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-800 dark:text-amber-300">
                  DEMO
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                {activePattern.observation}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {activePattern.historicalContext} This is an example from sample data, not a recommendation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('insights')}
              className="shrink-0 text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline"
            >
              Explore more
            </button>
          </div>
          {patterns.length > 1 && (
            <div className="mt-3 flex gap-1.5" aria-label="Choose a demo insight">
              {patterns.map((pattern, index) => (
                <button
                  key={pattern.id}
                  type="button"
                  aria-label={`Show demo insight ${index + 1}`}
                  aria-pressed={activePattern.id === pattern.id}
                  onClick={() => setActivePatternId(pattern.id)}
                  className={`h-1.5 w-5 rounded-full transition-colors ${
                    activePattern.id === pattern.id
                      ? 'bg-nest-600'
                      : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
