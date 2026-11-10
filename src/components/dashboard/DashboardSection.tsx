'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, ChevronDown, Database, RefreshCw, RotateCcw, Utensils, Droplets } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { convertGlucose, formatUnitLabel, getTrendSymbol, getGlucoseStatus, getGlucoseStatusColor } from '@/utils/glucoseUtils';
import { calculateDetailedTIR } from '@/utils/tirCalculator';
import { translate } from '@/lib/i18n';
import { getReadingWindow } from '@/utils/chartWindow';
import { summarizeToday } from '@/utils/today';
import TimeInRangeRing from './TimeInRangeRing';
import styles from './DashboardSection.module.css';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceArea, ReferenceLine, Brush } from 'recharts';

export default function DashboardSection() {
  const { readings, currentReading, glucoseUnit, setActiveSection, resetDemoData, dataSource, connectionStatus,
    isNightscoutConnected, lastSuccessfulFetch, connectionError, refreshNightscout, darkMode, targetRange, language, meals } = useApp();
  const [timeRange, setTimeRange] = useState<'3h' | '6h' | '12h' | '24h'>('24h');
  const [now, setNow] = useState(() => Date.now());
  const [glucoseDetailsExpanded, setGlucoseDetailsExpanded] = useState(false);
  const chartGradientId = useId();
  const [showTargetBand, setShowTargetBand] = useState(true);
  const [chartWindow, setChartWindow] = useState<{startIndex:number;endIndex:number} | null>(null);
  useEffect(() => setChartWindow(null), [timeRange, readings]);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(preference.matches);
    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () => preference.removeEventListener('change', updateMotion);
  }, []);
  const tirStats = calculateDetailedTIR(readings, targetRange.low, targetRange.high);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

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


  const trend = currentReading?.trend ? getTrendSymbol(currentReading.trend) : null;
  const status = currentReading ? getGlucoseStatus(currentReading.value, targetRange.low, targetRange.high) : null;
  const statusColors = status ? getGlucoseStatusColor(status, darkMode, targetRange.low, targetRange.high) : null;
  const statusLabel = status === 'in-range' ? translate(language, 'dashboard.inRange')
    : status === 'low' || status === 'very-low' ? translate(language, 'dashboard.low') : translate(language, 'dashboard.high');
  const latestReadingTime = currentReading && Number.isFinite(Date.parse(currentReading.timestamp))
    ? new Date(currentReading.timestamp).toLocaleString() : currentReading?.timeLabel;
  const readingIsStale = isNightscoutConnected && currentReading && Number.isFinite(Date.parse(currentReading.timestamp)) &&
    now - Date.parse(currentReading.timestamp) > 10 * 60 * 1000;
  const today = summarizeToday(dataSource === 'demo' ? [] : readings, meals, [], new Date(now), targetRange);
  const latestMealToday = meals.find(meal => !meal.isDemo && meal.timestamp === today.lastMealTime);
  const rangeRows = [
    { label: 'Below range', value: tirStats.timeBelowRangePercent, color: '#e8979e' },
    { label: 'Within range', value: tirStats.inRangePercent, color: '#739b64' },
    { label: 'Above range', value: tirStats.timeAboveRangePercent, color: '#d6ad61' },
  ];
  const details = [
    { label: 'Average glucose', value: currentReading ? convertGlucose(tirStats.meanGlucose, glucoseUnit) + ' ' + formatUnitLabel(glucoseUnit) : '—' },
    { label: 'Lowest glucose', value: currentReading ? convertGlucose(tirStats.minReading, glucoseUnit) + ' ' + formatUnitLabel(glucoseUnit) : '—' },
    { label: 'Highest glucose', value: currentReading ? convertGlucose(tirStats.maxReading, glucoseUnit) + ' ' + formatUnitLabel(glucoseUnit) : '—' },
    { label: 'Glucose variability (CV)', value: tirStats.hasSufficientVariabilityData ? tirStats.coefficientOfVariation + '%' : 'Insufficient data' },
    { label: 'Estimated GMI', value: tirStats.hasSufficientGmiData ? tirStats.gmiPercent + '%' : 'Insufficient data' },
  ];
  const visibleWindow = getReadingWindow(chartWindow, filteredReadings.length);
  const selectedPeriodReadings = filteredReadings.slice(visibleWindow.startIndex, visibleWindow.endIndex + 1);
  const periodSummary = selectedPeriodReadings.length ? {
    average: Math.round(selectedPeriodReadings.reduce((sum, reading) => sum + reading.value, 0) / selectedPeriodReadings.length),
    minimum: Math.min(...selectedPeriodReadings.map(reading => reading.value)),
    maximum: Math.max(...selectedPeriodReadings.map(reading => reading.value)),
  } : null;

  return (
    <div className={styles.dashboard}>
      <section className={styles.overview + ' bg-white dark:bg-[var(--surface)] border-slate-200 dark:border-slate-800'} aria-label="Glucose overview">
        <div className={styles.sourceBar}>
          <div className={styles.sourceIdentity}><span className={styles.sourceIcon + ' bg-nest-50 text-nest-700 dark:bg-nest-950 dark:text-nest-300'}><Database size={18} /></span><div><span className={styles.sourceLabel + (dataSource === 'demo' ? ' text-amber-800 dark:text-amber-300' : ' text-nest-700 dark:text-nest-300')}>{dataSource === 'demo' ? 'EXPLORING SAMPLE DATA' : isNightscoutConnected ? 'NIGHTSCOUT · READ ONLY' : 'YOUR MANUAL READINGS'}</span><p className="text-slate-500 dark:text-slate-400">{dataSource === 'demo' ? 'A preview of your day. Personal logs stay separate.' : isNightscoutConnected ? 'Last fetched: ' + (lastSuccessfulFetch ? new Date(lastSuccessfulFetch).toLocaleString() : 'Not yet') : 'Your own readings, recorded in this browser.'}</p></div></div>
          <div className={styles.sourceActions}>
            {dataSource === 'demo' && <button type="button" className={styles.quietButton + ' text-slate-500 dark:text-slate-400'} onClick={resetDemoData}><RotateCcw size={14} /><span>Reset sample</span></button>}
            {isNightscoutConnected && <button type="button" className={styles.quietButton + ' text-slate-600 dark:text-slate-300'} onClick={() => void refreshNightscout()} disabled={connectionStatus === 'fetching'}><RefreshCw size={14} /><span>{connectionStatus === 'fetching' ? 'Refreshing…' : 'Refresh'}</span></button>}
            <button type="button" className={styles.dataButton + ' text-nest-800 bg-nest-100 hover:bg-nest-200 dark:text-nest-200 dark:bg-nest-900 dark:hover:bg-nest-800'} onClick={() => setActiveSection('devices')}><span>{dataSource === 'demo' ? 'Connect your data' : 'Manage data source'}</span><ArrowUpRight size={16} /></button>
          </div>
        </div>
        {connectionError && <p role="alert" className={styles.connectionError + ' text-amber-800 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/30'}>{connectionError} {isNightscoutConnected ? 'Showing the last successfully fetched readings.' : dataSource === 'demo' ? 'Sample data remains active.' : 'Your saved readings remain active.'}</p>}

        {currentReading ? <>
          <div className={styles.snapshotGrid}>
            <div className={styles.spotlight}>
              <div className={styles.spotlightTop}><span>{dataSource === 'demo' ? 'LATEST SAMPLE READING' : translate(language, 'dashboard.current')}</span><Activity size={23} strokeWidth={1.4} /></div>
              <div className={styles.readingValue}><strong>{convertGlucose(currentReading.value, glucoseUnit)}</strong><span>{formatUnitLabel(glucoseUnit)}</span>{trend && <span className={styles.trendSymbol} aria-label={trend.text}>{trend.symbol}</span>}</div>
              <div className={styles.readingState}><span className={styles.statusBadge + ' ' + statusColors?.badgeBg}>{statusLabel}</span><span>{trend?.text || 'No trend available'}</span></div>
              <div className={styles.readingTimestamp}><span>{latestReadingTime}</span><span>{readingIsStale ? 'STALE READING' : dataSource === 'demo' ? 'SAMPLE' : 'LATEST AVAILABLE'}</span></div>
            </div>
            <div className={styles.rangePanel}>
              <div className={styles.rangeHeading}><div><p className={styles.eyebrow + ' text-slate-500 dark:text-slate-400'}>THE BIGGER PICTURE</p><h2>Time in range</h2></div><span className={styles.historyPill + ' text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-900'}>Available history</span></div>
              <div className={styles.rangeVisual}><TimeInRangeRing percent={tirStats.hasSufficientData ? tirStats.inRangePercent : null} size={128} /><dl className={styles.rangeLegend}>{rangeRows.map(row => <div key={row.label}><dt className="text-slate-500 dark:text-slate-400"><span style={{backgroundColor:row.color}} />{row.label}</dt><dd>{tirStats.hasSufficientData ? row.value + '%' : '—'}</dd></div>)}</dl></div>
              <p className={styles.rangeNote + ' text-slate-500 dark:text-slate-400'}>{tirStats.hasSufficientData ? 'Target band: ' + targetLow + '–' + targetHigh + ' ' + formatUnitLabel(glucoseUnit) + ' · ' + tirStats.totalReadings + ' readings' : 'At least 12 hours of usable readings are needed for time-based percentages.'}</p>
            </div>
          </div>

        </> : <div className={styles.emptyState}><span className={styles.emptyIcon + ' text-nest-600 bg-nest-50 dark:text-nest-300 dark:bg-nest-950'}><Activity size={38} strokeWidth={1.3} /></span><h2>No glucose readings available</h2><p className="text-slate-500 dark:text-slate-400">{isNightscoutConnected ? 'The connected instance returned no valid readings. Refresh above to try again.' : 'Add a reading in Quick Log, or use the data connection above to import your readings.'} Sample readings are kept separate from your own data.</p><button type="button" className="button-primary" onClick={() => setActiveSection('quick-log')}>Open Quick Log <ArrowUpRight size={16} /></button></div>}
      {currentReading && <div className={`${styles.chartPanel} border-slate-100 dark:border-slate-800`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className={styles.eyebrow + ' text-nest-600 dark:text-nest-300'}>YOUR DAY, IN PERSPECTIVE</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isNightscoutConnected ? 'Nightscout glucose history' : dataSource === 'manual' ? 'Manual glucose history' : 'Glucose through the day'}
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
                onClick={() => { setChartWindow(null); setTimeRange(range); }}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.curveToolbar}>
          <div className={styles.periodStats} aria-label="Selected period summary">{periodSummary && [{label:'Mean',value:periodSummary.average},{label:'Lowest',value:periodSummary.minimum},{label:'Highest',value:periodSummary.maximum}].map(stat => <span key={stat.label}><small className="text-slate-500 dark:text-slate-400">{stat.label}</small><strong>{convertGlucose(stat.value,glucoseUnit)}</strong></span>)}<small className="text-slate-400">{formatUnitLabel(glucoseUnit)} · {chartWindow ? 'Zoomed selection' : timeRange + ' summary'}</small></div>
          <button type="button" className={styles.targetToggle + ' text-nest-700 dark:text-nest-300'} aria-pressed={showTargetBand} onClick={() => setShowTargetBand(value => !value)}><span style={{backgroundColor:showTargetBand ? '#83a775' : '#94a3b8'}} />Target band {showTargetBand ? 'on' : 'off'}</button>
        </div>
        <div id="glucose-chart-description" className="sr-only">
          {translate(language, 'dashboard.chartSummary')}
        </div>
        <div className={styles.chartCanvas} role="region" aria-label="Glucose chart" aria-describedby="glucose-chart-description">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={timeRange} accessibilityLayer data={chartData} margin={{ top: 20, right: 15, left: -15, bottom: 8 }}>
              <defs><linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#73a283" stopOpacity={0.28} /><stop offset="100%" stopColor="#73a283" stopOpacity={0.01} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 7" vertical={false} stroke={darkMode ? '#26372f' : '#e9eee5'} />
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
              <Tooltip cursor={{stroke:darkMode ? '#b7cd9c' : '#6d8759',strokeDasharray:'4 5',strokeWidth:1}}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                        <div className="font-mono text-slate-400">{data.timeLabel}</div>
                        <div className="text-base font-bold font-mono">
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
              {showTargetBand && <ReferenceArea y1={targetLow} y2={targetHigh} fill="#10b981" fillOpacity={darkMode ? 0.12 : 0.12} />}
              {showTargetBand && <ReferenceLine y={targetHigh} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />}
              {showTargetBand && <ReferenceLine y={targetLow} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />}
              <Area isAnimationActive={!reducedMotion && !chartWindow} animationDuration={900} animationEasing="ease-out"
                fill={`url(#${chartGradientId})`}
                type="monotone"
                dataKey="displayValue"
                stroke={darkMode ? '#a3c7ab' : '#527e5e'}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#5c9183', stroke: '#ffffff', strokeWidth: 2 }}
              />
              {chartData.length > 1 && <Brush ariaLabel="Glucose history zoom handle. Use left and right arrow keys to change the visible time window." startIndex={visibleWindow.startIndex} endIndex={visibleWindow.endIndex} onChange={range => { if (range.startIndex !== undefined && range.endIndex !== undefined) setChartWindow({startIndex:range.startIndex,endIndex:range.endIndex}); }} dataKey="chartTime" height={28} travellerWidth={9} stroke={darkMode ? '#65816b' : '#a7b99a'} fill={darkMode ? '#16241d' : '#f4f7ed'} tickFormatter={() => ''}><AreaChart><Area dataKey="displayValue" stroke="#7f9b70" fill="#7f9b7025" isAnimationActive={false} /></AreaChart></Brush>}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className={styles.navigatorHint + ' text-slate-500 dark:text-slate-400'}>Hover or use the arrow keys to inspect readings. Drag the navigator handles to zoom within this period.</p>
        <details className="border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <summary className="cursor-pointer font-semibold text-nest-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 dark:text-nest-300">
            Text alternative: view chart readings
          </summary>
          <div className="mt-3 max-h-64 overflow-auto">
            <table className="w-full text-left text-[11px]">
              <caption className="sr-only">Glucose readings shown in the continuous glucose chart</caption>
              <thead className="sticky top-0 bg-white text-slate-500 dark:bg-[var(--surface)] dark:text-slate-400">
                <tr>
                  <th scope="col" className="p-2">Time</th>
                  <th scope="col" className="p-2">Glucose ({formatUnitLabel(glucoseUnit)})</th>
                  <th scope="col" className="p-2">Reading note</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((reading, index) => (
                  <tr key={`${reading.timestamp}-${index}`} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-2 font-mono">{reading.chartTime}</td>
                    <td className="p-2 font-mono">{reading.displayValue}</td>
                    <td className="p-2">{reading.notes || 'No note'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
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
      </div>}
      {currentReading && <>
          <div className={styles.todayRow + ' border-slate-100 dark:border-slate-800'}>
            <div className={styles.todayIntro}><span className={styles.todayIcon + ' bg-nest-50 text-nest-600 dark:bg-nest-950 dark:text-nest-300'}><Droplets size={19} /></span><div><strong>Your own day</strong><small className="text-slate-500 dark:text-slate-400">Personal logs only</small></div></div>
            <div className={styles.todayMetric}><span className="text-slate-500 dark:text-slate-400">Readings today</span><strong>{today.readingCount}</strong></div>
            <div className={styles.todayMetric}><span className="text-slate-500 dark:text-slate-400">Below your range</span><strong>{today.lowCount}</strong></div>
            <div className={styles.lastMeal}><Utensils size={17} className="text-slate-400" /><div><span className="text-slate-500 dark:text-slate-400">Last meal today</span><strong>{latestMealToday?.name || 'Nothing logged yet'}</strong></div></div>
          </div>
          <div className={styles.detailArea + ' border-slate-100 dark:border-slate-800'}><button type="button" aria-expanded={glucoseDetailsExpanded} aria-controls="glucose-details" className={styles.detailToggle + ' text-nest-700 dark:text-nest-300'} onClick={() => setGlucoseDetailsExpanded(v => !v)}>{glucoseDetailsExpanded ? translate(language,'dashboard.hideDetails') : translate(language,'dashboard.details')}<ChevronDown size={15} style={{transform:glucoseDetailsExpanded ? 'rotate(180deg)' : undefined}} /></button>
            {glucoseDetailsExpanded && <div id="glucose-details" className={styles.detailContent}><dl>{details.map(item => <div key={item.label}><dt className="text-slate-500 dark:text-slate-400">{item.label}</dt><dd>{item.value}</dd></div>)}</dl>{tirStats.hasSufficientGmiData && <p className="text-slate-500 dark:text-slate-400">Estimated GMI is a CGM-derived estimate, not laboratory HbA1c.</p>}</div>}
          </div>

      </>}
      </section>
    </div>
  );
}