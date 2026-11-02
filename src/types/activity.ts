import { MealLogEntry } from './meal';
import { InsulinLogEntry } from './insulin';

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO string
  type: 'walk' | 'run' | 'gym' | 'cycling' | 'yoga' | 'sports' | 'other';
  durationMinutes: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  notes?: string;
  isDemo?: boolean;
}

export interface NoteLogEntry {
  id: string;
  timestamp: string; // ISO string
  category: 'sleep' | 'stress' | 'illness' | 'travel' | 'site-change' | 'general';
  content: string;
  isDemo?: boolean;
}

export type GeneralLogEntry =
  | { kind: 'glucose'; data: { id: string; timestamp: string; value: number; note?: string } }
  | { kind: 'meal'; data: MealLogEntry }
  | { kind: 'insulin'; data: InsulinLogEntry }
  | { kind: 'activity'; data: ActivityLogEntry }
  | { kind: 'note'; data: NoteLogEntry };
