export type GlucoseUnit = 'mg/dL' | 'mmol/L';

export type GlucoseTrend =
  | 'DOUBLE_UP'
  | 'UP'
  | 'SLIGHT_UP'
  | 'FLAT'
  | 'SLIGHT_DOWN'
  | 'DOWN'
  | 'DOUBLE_DOWN';

export interface NormalizedGlucoseReading {
  id: string;
  value: number;
  unit: 'mg/dL';
  timestamp: string;
  timeLabel: string;
  source: 'nightscout' | 'csv' | 'manual';
  trend?: GlucoseTrend;
  originalSource?: string;
}

export interface GlucoseReading {
  id?: string;
  timestamp: string; // "HH:mm" or ISO string
  timeLabel: string;
  value: number; // in mg/dL (normalized)
  unit?: 'mg/dL';
  source?: 'nightscout' | 'csv' | 'manual';
  originalSource?: string;
  trend?: GlucoseTrend;
  notes?: string;
  event?: 'meal' | 'insulin' | 'exercise' | 'correction' | 'hypo';
  eventDetails?: string;
  isDemo?: boolean;
}

export type GlucoseStatus = 'very-low' | 'low' | 'in-range' | 'high' | 'very-high';
