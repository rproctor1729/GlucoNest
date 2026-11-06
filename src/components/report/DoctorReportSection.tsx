'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { buildReport } from '@/utils/doctorReport';
import GlossaryTerm from '@/components/common/GlossaryTerm';

const PERIODS = [14, 30, 90];
const MMOL_FACTOR = 18.0182;

// A printable summary of the user's own logged data for a clinic visit.
// It reports figures and logs only. It does not suggest doses or treatment changes.
export default function DoctorReportSection() {
  const { readings, meals, insulinLogs, dataSource, glucoseUnit } = useApp();
  const [periodDays, setPeriodDays] = useState(14);

  // Only real readings are included. Sample data is excluded.
  const report = useMemo(
    () => buildReport(
      readings.filter((r) => !r.isDemo),
      meals.filter((m) => !m.isDemo),
      insulinLogs.filter((i) => !i.isDemo),
      periodDays,
      new Date()
    ),
    [readings, meals, insulinLogs, periodDays]
  );

  const fmt = (mgdl: number) =>
    glucoseUnit === 'mmol/L' ? (mgdl / MMOL_FACTOR).toFixed(1) : String(Math.round(mgdl));

  const totalCarbs = report.meals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0);
  const totalUnits = report.insulin.reduce((sum, i) => sum + (i.units || 0), 0);
  const hasReadings = report.readingCount > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Doctor report</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">A summary of your own data for a clinic visit. Print it or save it as PDF.</p>
        </div>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Report period" className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {PERIODS.map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={periodDays === days}
                onClick={() => setPeriodDays(days)}
                className={`h-9 px-3 text-sm font-medium ${periodDays === days ? 'bg-nest-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
              >
                {days} days
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-9 px-3.5 rounded-xl text-sm font-semibold bg-nest-600 hover:bg-nest-700 text-white"
          >
            Print
          </button>
        </div>
      </div>

      <article className="print-report nest-card p-6 sm:p-8 space-y-6">
        <header>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">GlucoNest summary</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {new Date(report.from).toLocaleDateString()} to {new Date(report.to).toLocaleDateString()} · last {report.periodDays} days · unit {glucoseUnit}
          </p>
        </header>

        {!hasReadings ? (
          <p className="text-sm text-slate-700 dark:text-slate-300">
            No glucose readings from your own data in this period yet. Connect Nightscout or import a CSV from Devices &amp; Data to include them.
          </p>
        ) : (
          <>
            <section className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">Time in range ({report.readingCount} readings)</h4>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr><td className="py-1.5">In range (70–180 mg/dL)</td><td className="py-1.5 text-right font-mono">{report.tir.inRangePercent}%</td></tr>
                  <tr><td className="py-1.5">Below range (under 70)</td><td className="py-1.5 text-right font-mono">{report.tir.timeBelowRangePercent}%</td></tr>
                  <tr><td className="py-1.5">Above range (over 180)</td><td className="py-1.5 text-right font-mono">{report.tir.timeAboveRangePercent}%</td></tr>
                </tbody>
              </table>
            </section>

            <section className="space-y-2 overflow-x-auto">
              <h4 className="font-semibold text-slate-900 dark:text-white">Daily summary</h4>
              <table className="w-full text-sm min-w-[420px]">
                <thead className="text-left text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-1.5 font-medium">Date</th>
                    <th className="py-1.5 font-medium text-right">Readings</th>
                    <th className="py-1.5 font-medium text-right">Lowest</th>
                    <th className="py-1.5 font-medium text-right">Highest</th>
                    <th className="py-1.5 font-medium text-right">Average</th>
                    <th className="py-1.5 font-medium text-right">Under 70</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.daily.map((row) => (
                    <tr key={row.date}>
                      <td className="py-1.5">{row.date}</td>
                      <td className="py-1.5 text-right font-mono">{row.readings}</td>
                      <td className="py-1.5 text-right font-mono">{fmt(row.min)}</td>
                      <td className="py-1.5 text-right font-mono">{fmt(row.max)}</td>
                      <td className="py-1.5 text-right font-mono">{fmt(row.mean)}</td>
                      <td className="py-1.5 text-right font-mono">{row.lows}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        <section className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
          <h4 className="font-semibold text-slate-900 dark:text-white">Logs in this period</h4>
          <p>{report.meals.length} meals logged, {totalCarbs} g carbohydrate in total.</p>
          <p>{report.insulin.length} insulin entries, {totalUnits} units in total, as recorded.</p>
        </section>

        <section className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Terms</h4>
          <p><GlossaryTerm term="tir">TIR</GlossaryTerm>: share of readings in range. <GlossaryTerm term="tbr">TBR</GlossaryTerm>: share under 70. <GlossaryTerm term="tar">TAR</GlossaryTerm>: share over 180.</p>
          <p><GlossaryTerm term="gmi">GMI</GlossaryTerm> and <GlossaryTerm term="cv">CV</GlossaryTerm> are described in the app's glossary.</p>
        </section>

        <footer className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
          Generated from data logged in GlucoNest on this device{dataSource === 'nightscout' ? ' and Nightscout' : ''}. For discussion with your care team. Not a medical record and not a basis for changing insulin or other treatment.
        </footer>
      </article>
    </div>
  );
}
