'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  RefreshCw,
  ShieldCheck,
  Unplug,
  Upload,
  X,
} from 'lucide-react';
import {
  createLocalDataBackup,
  LocalDataBackup,
  parseLocalDataBackup,
} from '@/lib/localData';
import { parseGlucoseCsv, CsvGlucoseImport } from '@/lib/csvImport';
import ReminderSettings from '@/components/devices/ReminderSettings';
import TargetRangeSettings from '@/components/devices/TargetRangeSettings';

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) return 'Not available';
  return new Date(timestamp).toLocaleString();
}

export default function DevicesSection() {
  const {
    readings,
    currentReading,
    dataSource,
    connectionStatus,
    isNightscoutConnected,
    nightscoutUrl,
    lastSuccessfulFetch,
    connectionError,
    connectNightscout,
    refreshNightscout,
    disconnectNightscout,
    setActiveSection,
    resetDemoData,
    manualReadings,
    importManualReadings,
    meals,
    insulinLogs,
    activityLogs,
    feedbackList,
    importLocalDataBackup,
  } = useApp();

  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [historyLimit, setHistoryLimit] = useState('288');
  const [now, setNow] = useState(Date.now());
  const [pendingBackup, setPendingBackup] = useState<LocalDataBackup | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [pendingCsv, setPendingCsv] = useState<CsvGlucoseImport | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);
  const loading = connectionStatus === 'fetching';
  const latestReadingAt = currentReading?.timestamp ?? null;
  const isStale = Boolean(
    latestReadingAt &&
      Number.isFinite(Date.parse(latestReadingAt)) &&
      now - Date.parse(latestReadingAt) > 10 * 60 * 1000
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleConnect = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await connectNightscout({
      url,
      token: token.trim() || undefined,
      historyLimit: Number(historyLimit),
    });
  };

  const handleDisconnect = () => {
    disconnectNightscout();
    setUrl('');
    setToken('');
    setHistoryLimit('288');
  };

  const handleExport = () => {
    const backup = createLocalDataBackup({
      manualReadings,
      meals,
      insulinLogs,
      activityLogs,
      feedbackList,
    });
    const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const fileUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = `gluconest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    downloadLink.click();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    setBackupError(null);
    setBackupStatus('Your backup was prepared in this browser. Store the downloaded file somewhere private.');
  };

  const handleBackupFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    setPendingBackup(null);
    setBackupError(null);
    setBackupStatus(null);
    if (!file) return;

    try {
      const contents: unknown = JSON.parse(await file.text());
      setPendingBackup(parseLocalDataBackup(contents));
    } catch (error) {
      setBackupError(
        error instanceof Error ? error.message : 'The selected file could not be read.'
      );
    }
  };

  const handleImportBackup = () => {
    if (!pendingBackup) return;
    try {
      importLocalDataBackup(pendingBackup);
      setBackupStatus('Backup records merged successfully. Records not in the file were kept.');
      setPendingBackup(null);
      setBackupError(null);
    } catch (error) {
      setBackupError(
        error instanceof Error ? error.message : 'The backup could not be imported.'
      );
    }
  };

  const handleCsvFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    setPendingCsv(null);
    setCsvError(null);
    setCsvStatus(null);
    if (!file) return;
    try {
      setPendingCsv(parseGlucoseCsv(await file.text()));
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : 'The CSV file could not be read.');
    }
  };

  const handleImportCsv = () => {
    if (!pendingCsv) return;
    const result = importManualReadings(pendingCsv.readings);
    if (!result) {
      setCsvError('The readings could not be saved in this browser. Free storage space and try again.');
      return;
    }
    setCsvStatus(
      `Imported ${result.imported} readings${result.skipped ? `; skipped ${result.skipped} duplicates` : ''}.` +
      (pendingCsv.rejectedRows.length ? ` ${pendingCsv.rejectedRows.length} invalid rows were excluded.` : '')
    );
    setPendingCsv(null);
    setCsvError(null);
  };

  const backupRecordCount = pendingBackup
    ? Object.values(pendingBackup.data).reduce((total, records) => total + records.length, 0)
    : 0;

  return (
    <div className="space-y-7 animate-fadeIn">
      <header className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Devices &amp; Data Sources
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Connect a source you already use, or continue exploring with GlucoNest demo data.
        </p>
      </header>

      <section className="bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-nest-500/10 text-nest-700 dark:text-nest-300 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Nightscout</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Read glucose history from your existing Nightscout instance. Temporary network or server errors are retried twice automatically.
              </p>
            </div>
          </div>
          <span className={`self-start inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            connectionStatus === 'error'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
              : isNightscoutConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {connectionStatus === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : isNightscoutConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Unplug className="w-3.5 h-3.5" />
            )}
            {loading ? 'Fetching' : connectionStatus === 'error' ? 'Connection error' : isNightscoutConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {isNightscoutConnected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 mb-1">Nightscout instance</div>
                <div className="text-slate-700 dark:text-slate-200 break-all">{nightscoutUrl}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 mb-1">Last successful fetch</div>
                <div className="text-slate-700 dark:text-slate-200">{formatTimestamp(lastSuccessfulFetch)}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 mb-1">Last glucose reading</div>
                <div className="text-slate-700 dark:text-slate-200">{formatTimestamp(latestReadingAt)}</div>
              </div>
            </div>

            {isStale && (
              <p className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
                <Clock3 className="w-4 h-4 shrink-0" />
                This reading is over 10 minutes old. It may be stale; do not treat this prototype as a real-time alarm.
              </p>
            )}
            {connectionError && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {connectionError}
              </p>
            )}
            {readings.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected, but Nightscout returned no valid glucose readings. Demo readings are not mixed into this view.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void refreshNightscout()}
                disabled={loading}
                className="h-10 px-4 rounded-xl bg-nest-600 hover:bg-nest-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh readings
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_10rem] gap-3">
              <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                Nightscout URL
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://your-nightscout.example.com"
                  autoComplete="url"
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-nest-500/40"
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                History limit
                <input
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  required
                  value={historyLimit}
                  onChange={(event) => setHistoryLimit(event.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nest-500/40"
                />
              </label>
            </div>
            <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              Optional read-only access token
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Leave blank if your instance allows read access"
                autoComplete="new-password"
                spellCheck={false}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-nest-500/40"
              />
            </label>

            {connectionError && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {connectionError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-4 rounded-xl bg-nest-600 hover:bg-nest-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {loading ? 'Testing connection…' : 'Connect now'}
              </button>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Requests up to {historyLimit || '288'} readings from the last history page.
              </span>
              {connectionStatus === 'error' && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="h-10 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Clear failed attempt
                </button>
              )}
            </div>
          </form>
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">Privacy and access</h4>
          <p>
            A publicly readable instance needs no token. For a protected instance, an administrator can create a Nightscout subject/access token with read-only glucose permission and use the instance&apos;s authorization tool to obtain its bearer token. Never enter your Nightscout administrator API_SECRET.
          </p>
          <p>
            The URL and optional token stay in this browser&apos;s memory and are cleared on disconnect or reload. They are sent only to the Nightscout URL you enter. Browser-based credentials are accessible within your browser environment; this prototype does not store them or fetched CGM readings permanently. Manual glucose readings remain in this browser until you clear its site data.
          </p>
          <p>
            Direct browser requests require your Nightscout server to allow this site through CORS. This is a read-only history viewer, not a safety-critical real-time CGM alarm.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-5 space-y-2 ${
          dataSource === 'demo'
            ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b24]'
        }`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Demo data</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sample readings remain available whenever Nightscout is disconnected. Disconnecting restores the demo dashboard.
          </p>
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            {dataSource === 'demo' ? 'ACTIVE SOURCE' : 'AVAILABLE'}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b24] p-5 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">CSV import</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add readings exported from a glucose meter or CGM file.
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">AVAILABLE BELOW</span>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b24] p-5 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Manual glucose entry</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record a fingerstick or other manual value in the existing quick log.
          </p>
          <button
            type="button"
            onClick={() => setActiveSection('quick-log')}
            className="text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline"
          >
            Open Quick Log
          </button>
          {dataSource === 'manual' && (
            <button
              type="button"
              onClick={resetDemoData}
              className="block text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline"
            >
              Return to demo data
            </button>
          )}
          {dataSource === 'manual' && (
            <span className="block text-[11px] font-semibold text-slate-400">ACTIVE SOURCE</span>
          )}
        </div>
      </section>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        Dexcom official API, Abbott FreeStyle Libre approved integrations, xDrip+, Medtronic, Android Health Connect, and Apple HealthKit are future possibilities, not currently connected.
      </p>

      <TargetRangeSettings />
      <ReminderSettings />

      <section className="bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Import glucose readings from CSV</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Choose a CSV with a timestamp (or date) and glucose/value column. Values in mmol/L are converted to mg/dL. Files are parsed locally; no upload occurs.
          </p>
        </div>
        <label className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          <Upload className="h-4 w-4" />
          Choose CSV file
          <input type="file" accept=".csv,text/csv" onChange={(event) => void handleCsvFile(event)} className="sr-only" aria-label="Choose glucose CSV file" />
        </label>
        {pendingCsv && (
          <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:bg-amber-950/20">
            <p className="text-xs text-amber-900 dark:text-amber-100">
              Ready to import {pendingCsv.readings.length} glucose readings.
              {pendingCsv.rejectedRows.length > 0 && ` ${pendingCsv.rejectedRows.length} invalid row(s) will be excluded.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleImportCsv} className="h-9 rounded-xl bg-amber-700 px-3 text-xs font-semibold text-white hover:bg-amber-800">
                Import readings
              </button>
              <button type="button" onClick={() => setPendingCsv(null)} className="h-9 rounded-xl border border-amber-300 px-3 text-xs font-semibold text-amber-900 dark:border-amber-800 dark:text-amber-100">
                Cancel
              </button>
            </div>
          </div>
        )}
        {csvError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{csvError}</p>}
        {csvStatus && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{csvStatus}</p>}
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Accepted fields are date/time and glucose value, with optional units (mg/dL or mmol/L). Imported readings become part of your manual records.
        </p>
      </section>

      <section className="bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-nest-500/10 text-nest-700 dark:text-nest-300 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Your local data</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Export or restore your manual readings, logs, and feedback as a JSON file. Backups stay on this device unless you choose where to save or share them. Demo records and Nightscout credentials or fetched readings are not included.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="h-10 px-4 rounded-xl bg-nest-600 hover:bg-nest-700 text-white text-xs font-semibold inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
          >
            <Download className="w-4 h-4" />
            Export JSON backup
          </button>
          <label className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2 cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-nest-500">
            <Upload className="w-4 h-4" />
            Choose backup file
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => void handleBackupFile(event)}
              className="sr-only"
              aria-label="Choose GlucoNest JSON backup"
            />
          </label>
        </div>

        {pendingBackup && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3">
            <p className="text-xs text-amber-900 dark:text-amber-100">
              This backup contains {backupRecordCount} personal records: {pendingBackup.data.manualReadings.length} glucose readings, {pendingBackup.data.meals.length} meals, {pendingBackup.data.insulinLogs.length} insulin logs, {pendingBackup.data.activityLogs.length} activity logs, and {pendingBackup.data.feedbackList.length} feedback entries.
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Confirm to merge by record ID. Matching records will be updated from the backup; records absent from it will be kept.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleImportBackup}
                className="h-9 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold"
              >
                Confirm merge
              </button>
              <button
                type="button"
                onClick={() => setPendingBackup(null)}
                className="h-9 px-3 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100 text-xs font-semibold inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {backupError && (
          <p role="alert" className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300">
            {backupError}
          </p>
        )}
        {backupStatus && (
          <p role="status" className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200">
            {backupStatus}
          </p>
        )}
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Restoring merges records with those already saved here. Keep backup files private: they may contain sensitive health information.
        </p>
      </section>
    </div>
  );
}
