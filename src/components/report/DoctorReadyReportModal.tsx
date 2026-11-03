'use client';

import React, { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { convertGlucose, formatUnitLabel } from '@/utils/glucoseUtils';
import { calculateDetailedTIR } from '@/utils/tirCalculator';
import {
  X,
  Printer,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Activity,
  Info,
} from 'lucide-react';

export default function DoctorReadyReportModal() {
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    readings,
    meals,
    insulinLogs,
    glucoseUnit,
    reportPeriod,
    setReportPeriod,
    isNightscoutConnected,
    dataSource,
  } = useApp();

  const printRef = useRef<HTMLDivElement>(null);

  if (!isReportModalOpen) return null;

  if (dataSource !== 'demo') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
        <div
          className="w-full max-w-lg bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="report-modal-title" className="text-base font-semibold">
                Sample report preview only
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                This report contains a sample patient profile, logs, and observations. It is unavailable with {isNightscoutConnected ? 'Nightscout' : 'manual'} data to prevent mixing sample content with your readings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close report message"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The selected glucose data remains available on My Day and My Insights. This prototype does not provide medical advice.
          </p>
        </div>
      </div>
    );
  }

  const tirData = calculateDetailedTIR(readings);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className="w-full max-w-4xl bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Top Control Bar (Hidden during Print) */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-[#0f161e] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nest-500/10 text-nest-600 dark:text-nest-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="report-modal-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Doctor-Ready Report · Clinical Summary
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-[10px] font-bold uppercase tracking-wider">
                  DEMO DATA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print or export a sample PDF for preview; replace demo details before sharing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 text-xs">
              {([14, 30, 90] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setReportPeriod(days)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    reportPeriod === days
                      ? 'bg-nest-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:space-y-4 print:text-black print:bg-white">
          {/* Document Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
                  GlucoNest
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-nest-100 dark:bg-nest-950/50 text-nest-700 dark:text-nest-300 font-medium border border-nest-200 dark:border-nest-800">
                  Ambulatory Glucose Profile (AGP)
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  SAMPLE PROTOTYPE REPORT
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 mt-1">
                Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · Standard International Consensus Layout
              </p>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div className="font-semibold text-slate-900 dark:text-white print:text-black">Sample Patient: Rohan Sharma (T1D)</div>
              <div className="text-slate-500">CGM Active Sensor Time: 97.8% ({reportPeriod} Days Analyzed)</div>
              <div className="text-slate-500">Target Range: 70–180 {formatUnitLabel(glucoseUnit)}</div>
            </div>
          </div>

          {/* Time In Range Breakdown Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TIR Bar & Percentages */}
            <div className="md:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 print:border-slate-300 print:bg-white">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Time In Range (TIR)</span>
                <span className="text-emerald-600 font-bold">{tirData.inRangePercent}% (Target &gt;70%)</span>
              </div>

              {/* Stacked Bar */}
              <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-200 dark:bg-slate-800 mb-3">
                <div style={{ width: `${tirData.veryLowPercent}%` }} className="bg-rose-700" title={`Very Low: ${tirData.veryLowPercent}%`} />
                <div style={{ width: `${tirData.lowPercent}%` }} className="bg-rose-400" title={`Low: ${tirData.lowPercent}%`} />
                <div style={{ width: `${tirData.inRangePercent}%` }} className="bg-emerald-500" title={`In Range: ${tirData.inRangePercent}%`} />
                <div style={{ width: `${tirData.highPercent}%` }} className="bg-amber-400" title={`High: ${tirData.highPercent}%`} />
                <div style={{ width: `${tirData.veryHighPercent}%` }} className="bg-orange-600" title={`Very High: ${tirData.veryHighPercent}%`} />
              </div>

              {/* Legend & Exact Numbers */}
              <div className="grid grid-cols-5 text-center text-[11px] gap-1">
                <div className="p-1 rounded bg-rose-50 dark:bg-rose-950/20">
                  <div className="text-rose-700 font-bold">{tirData.veryLowPercent}%</div>
                  <div className="text-[10px] text-slate-500">&lt;54 (Goal &lt;1%)</div>
                </div>
                <div className="p-1 rounded bg-rose-50/50 dark:bg-rose-950/10">
                  <div className="text-rose-500 font-bold">{tirData.lowPercent}%</div>
                  <div className="text-[10px] text-slate-500">54–69 (Goal &lt;4%)</div>
                </div>
                <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/20">
                  <div className="text-emerald-600 font-bold">{tirData.inRangePercent}%</div>
                  <div className="text-[10px] text-slate-500">70–180 (Goal &gt;70%)</div>
                </div>
                <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/20">
                  <div className="text-amber-600 font-bold">{tirData.highPercent}%</div>
                  <div className="text-[10px] text-slate-500">181–250 (Goal &lt;25%)</div>
                </div>
                <div className="p-1 rounded bg-orange-50 dark:bg-orange-950/20">
                  <div className="text-orange-600 font-bold">{tirData.veryHighPercent}%</div>
                  <div className="text-[10px] text-slate-500">&gt;250 (Goal &lt;5%)</div>
                </div>
              </div>
            </div>

            {/* Core Biomarkers */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 print:border-slate-300 print:bg-white flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Mean Glucose</div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white print:text-black">
                  {convertGlucose(tirData.meanGlucose, glucoseUnit)}{' '}
                  <span className="text-xs font-normal text-slate-500">{formatUnitLabel(glucoseUnit)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Estimated GMI</div>
                  <div className="text-lg font-bold font-mono text-nest-600 dark:text-nest-400">{tirData.gmiPercent}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Variability (CV)</div>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">{tirData.coefficientOfVariation}%</div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                *GMI is a CGM-derived estimate: 3.31 + (0.02392 × mean glucose) and does not replace laboratory venous HbA1c.
              </p>
            </div>
          </div>

          {/* Ambulatory Profile Synopsis */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 print:border-slate-300 print:bg-white space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-nest-500" />
              Observed Patterns & Discussion Points for Endocrinologist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  1. Dawn Hepatic Release (5:00 AM – 7:00 AM)
                </span>
                Drift of +20 to +30 mg/dL prior to awakening. Suggest evaluating a small basal step increase from 4:30 AM to 6:30 AM.
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  2. Post-Lunch Rice Bolus Timing
                </span>
                Bolusing 15 min prior to steamed rice meals holds peak under 165 mg/dL. Bolusing at mealtime produces peaks ~195 mg/dL.
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  3. Physical Activity & Evening Sensitivity
                </span>
                Post-dinner walks (20+ min) maintain stable overnight readings with zero nocturnal lows recorded.
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  4. Average Daily Dose Total (TDD)
                </span>
                Estimated TDD: 38.5 units (Basal 46% / Bolus 54%). Demonstrates stable glycemic baseline.
              </div>
            </div>
          </div>

          {/* Representative Event Logbook */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Sample Event Logbook (Representative Day)</span>
              <span className="text-[11px] text-slate-500 font-normal">Stored locally in browser</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {meals.map((m) => (
                <div key={m.id} className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{m.name}</span>
                    <span className="text-slate-500">({m.totalCarbs}g carbs)</span>
                  </div>
                  <span className="font-mono text-amber-600 font-semibold">{m.totalCarbs}g</span>
                </div>
              ))}
              {insulinLogs.map((i) => (
                <div key={i.id} className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">
                      {new Date(i.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {i.units}u {i.type} insulin
                    </span>
                    <span className="text-slate-500">({i.notes || i.brandName})</span>
                  </div>
                  <span className="font-mono text-nest-600 font-semibold">{i.units}u</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Endorsement */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>GlucoNest Community Preview · Zero Commercial Ads · Prepared for Clinical Consultation</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
