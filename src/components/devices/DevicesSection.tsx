'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AlertCircle, CheckCircle2, Clock3, Database, RefreshCw, ShieldCheck, Unplug } from 'lucide-react';

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
  } = useApp();

  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [historyLimit, setHistoryLimit] = useState('288');
  const [now, setNow] = useState(Date.now());
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
                Read glucose history from your existing Nightscout instance.
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
            The URL and optional token stay in this browser&apos;s memory and are cleared on disconnect or reload. They are sent only to the Nightscout URL you enter. Browser-based credentials are accessible within your browser environment; this prototype does not store them or CGM readings permanently.
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
            Importing exported glucose history is planned as a separate fallback.
          </p>
          <span className="text-[11px] font-semibold text-slate-400">PLANNED</span>
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
    </div>
  );
}
