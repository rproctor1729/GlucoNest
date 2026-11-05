import type { GlucoseTrend, NormalizedGlucoseReading } from '@/types';

export interface NightscoutConfig {
  url: string;
  token?: string;
  historyLimit: number;
}

export type NightscoutErrorCode =
  | 'invalid-url'
  | 'insecure-url'
  | 'invalid-limit'
  | 'unauthorized'
  | 'http-error'
  | 'server-error'
  | 'cors-or-network'
  | 'timeout'
  | 'malformed-response';

export class NightscoutError extends Error {
  constructor(
    public readonly code: NightscoutErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'NightscoutError';
  }
}

const TREND_MAP: Record<string, GlucoseTrend> = {
  DOUBLEUP: 'DOUBLE_UP',
  SINGLEUP: 'UP',
  FORTYFIVEUP: 'SLIGHT_UP',
  FLAT: 'FLAT',
  FORTYFIVEDOWN: 'SLIGHT_DOWN',
  SINGLEDOWN: 'DOWN',
  DOUBLEDOWN: 'DOUBLE_DOWN',
};

function normalizeBaseUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new NightscoutError('invalid-url', 'Enter a valid Nightscout URL, including https://.');
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new NightscoutError('invalid-url', 'Use a valid HTTPS Nightscout URL.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new NightscoutError('invalid-url', 'Remove credentials, query parameters, and fragments from the URL.');
  }

  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  if (url.protocol !== 'https:' && !localHosts.has(url.hostname)) {
    throw new NightscoutError('insecure-url', 'Remote Nightscout instances must use HTTPS.');
  }

  url.pathname = url.pathname.replace(/\/+$/, '');
  return url;
}

function parseTimestamp(record: Record<string, unknown>): string | null {
  const candidates = [record.dateString, record.date, record.timestamp];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' && typeof candidate !== 'number') continue;
    const parsed = typeof candidate === 'number'
      ? new Date(candidate)
      : new Date(candidate);
    if (Number.isFinite(parsed.getTime())) return parsed.toISOString();
  }
  return null;
}

function normalizeTrend(value: unknown): GlucoseTrend | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.replace(/[^a-z]/gi, '').toUpperCase();
  return TREND_MAP[normalized];
}

export function parseNightscoutEntries(payload: unknown): NormalizedGlucoseReading[] {
  if (!Array.isArray(payload)) {
    throw new NightscoutError('malformed-response', 'Nightscout returned an unexpected response. Check the instance URL and API access.');
  }

  const readings = new Map<string, NormalizedGlucoseReading>();
  for (const item of payload) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const timestamp = parseTimestamp(record);
    const rawValue = typeof record.sgv === 'number' || typeof record.sgv === 'string'
      ? Number(record.sgv)
      : NaN;
    const units = String(record.units ?? record.unit ?? '').toLowerCase();
    const value = units.includes('mmol')
      ? Math.round(rawValue * 18.0182)
      : Math.round(rawValue);

    if (!timestamp || !Number.isFinite(value) || value < 20 || value > 600) continue;

    const id = typeof record._id === 'string' && record._id
      ? record._id
      : `${timestamp}-${value}`;
    if (readings.has(timestamp)) continue;

    const trend = normalizeTrend(record.direction ?? record.trend);
    const reading: NormalizedGlucoseReading = {
      id,
      timestamp,
      timeLabel: new Date(timestamp).toLocaleString(),
      value,
      unit: 'mg/dL',
      source: 'nightscout',
      ...(typeof record.device === 'string'
        ? { originalSource: record.device }
        : typeof record.type === 'string'
          ? { originalSource: record.type }
          : {}),
      ...(trend ? { trend } : {}),
    };
    readings.set(timestamp, reading);
  }

  return [...readings.values()].sort(
    (first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp)
  );
}

export async function fetchNightscoutReadings(
  config: NightscoutConfig,
  signal?: AbortSignal
): Promise<NormalizedGlucoseReading[]> {
  const limit = Number(config.historyLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
    throw new NightscoutError('invalid-limit', 'Choose a history limit between 1 and 1000 readings.');
  }

  const baseUrl = normalizeBaseUrl(config.url);
  const requestUrl = new URL(`${baseUrl.href.replace(/\/+$/, '')}/api/v1/entries/sgv.json`);
  requestUrl.searchParams.set('count', String(limit));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  try {
    let response: Response;
    try {
      response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(config.token?.trim()
            ? { Authorization: `Bearer ${config.token.trim()}` }
            : {}),
        },
        signal: controller.signal,
        cache: 'no-store',
      });
    } catch {
      if (controller.signal.aborted) {
        throw new NightscoutError('timeout', 'Nightscout did not respond within 12 seconds. Check the URL and try again.');
      }
      throw new NightscoutError(
        'cors-or-network',
        'The browser could not reach Nightscout. The server may be unavailable or may block this browser request with CORS; check its CORS settings. No proxy is used.'
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new NightscoutError(
        'unauthorized',
        'Nightscout denied read access. Check that the optional token is a valid read-only access token, or leave it blank for a publicly readable instance.'
      );
    }
    if (!response.ok) {
      throw new NightscoutError(
        response.status >= 500 ? 'server-error' : 'http-error',
        `Nightscout returned HTTP ${response.status}. Check the instance URL and its read access.`
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new NightscoutError('malformed-response', 'Nightscout returned data that was not valid JSON.');
    }

    return parseNightscoutEntries(payload);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export async function fetchNightscoutReadingsWithRetry(
  config: NightscoutConfig,
  signal?: AbortSignal
): Promise<NormalizedGlucoseReading[]> {
  const maxRetries = 2;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchNightscoutReadings(config, signal);
    } catch (error) {
      const retryable = error instanceof NightscoutError &&
        ['timeout', 'cors-or-network', 'server-error'].includes(error.code);
      if (!retryable || attempt >= maxRetries || signal?.aborted) throw error;
      const delay = Math.min(400 * (2 ** attempt), 1600);
      await new Promise<void>((resolve, reject) => {
        const abort = () => {
          clearTimeout(timer);
          reject(new NightscoutError('timeout', 'The Nightscout retry was cancelled.'));
        };
        const timer = setTimeout(() => {
          signal?.removeEventListener('abort', abort);
          resolve();
        }, delay);
        signal?.addEventListener('abort', abort, { once: true });
        if (signal?.aborted) abort();
      });
    }
  }
}
