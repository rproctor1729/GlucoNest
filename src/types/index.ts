export * from './glucose';
export * from './meal';
export * from './insulin';
export * from './activity';
export * from './food';
export * from './feedback';

export type NavigationSection =
  | 'my-day'
  | 'quick-log'
  | 'insights'
  | 'food-library'
  | 'learn-community'
  | 'about'
  | 'feedback'
  | 'devices'
  | 'legal'
  | 'report';

export interface PatternInsight {
  id: string;
  title: string;
  eyebrow: string;
  observation: string;
  encouragementAdvice: string;
  impactMetric: string;
  category: 'meal' | 'timing' | 'exercise' | 'sleep' | 'weekend';
  confidence: number;
  relatedFoodOrHabit: string;
  historicalContext?: string;
  isDemo?: boolean;
}

export interface EducationalGuide {
  id: string;
  title: string;
  category: 'Emergency' | 'Daily Life' | 'Food & Carbs' | 'Clinic & Endo' | 'Technology' | 'Climate & Storage';
  readTime: string;
  summary: string;
  isEmergency?: boolean;
  checklistItems?: string[];
  bodySections: {
    heading: string;
    content: string;
  }[];
}

export interface DoctorReportConfig {
  periodDays: 14 | 30 | 90;
  patientName: string;
  targetRangeLow: number;
  targetRangeHigh: number;
  includeInsulinDoses: boolean;
  includeMealCorrelations: boolean;
  includeDayOverlay: boolean;
}
