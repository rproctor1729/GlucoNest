export type GlucoseUnit = 'mg/dL' | 'mmol/L';

export type GlucoseTrend =
  | 'DOUBLE_UP'
  | 'UP'
  | 'SLIGHT_UP'
  | 'FLAT'
  | 'SLIGHT_DOWN'
  | 'DOWN'
  | 'DOUBLE_DOWN';

export interface GlucoseReading {
  id?: string;
  timestamp: string; // "HH:mm" or ISO string
  timeLabel: string;
  value: number; // in mg/dL (normalized)
  trend?: GlucoseTrend;
  notes?: string;
  event?: 'meal' | 'insulin' | 'exercise' | 'correction' | 'hypo';
  eventDetails?: string;
  isDemo?: boolean;
}

export type GlucoseStatus = 'very-low' | 'low' | 'in-range' | 'high' | 'very-high';
