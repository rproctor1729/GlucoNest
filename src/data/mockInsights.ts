import { PatternInsight } from '../types';

export const mockPatternInsights: PatternInsight[] = [
  {
    id: 'pat-01',
    title: 'Post-Dosa delayed fat absorption',
    eyebrow: 'Meal Timing Pattern',
    observation: 'When eating Masala Dosa with coconut chutney, your glucose rise peaks at ~2 hours instead of 45 minutes.',
    encouragementAdvice: 'The healthy fats from coconut chutney and roasted dal naturally slow stomach emptying. Consider discussing a dual-split bolus or taking part of your dose 30 minutes after eating with your educator.',
    impactMetric: '+14% post-meal stability',
    category: 'meal',
    confidence: 91,
    relatedFoodOrHabit: 'Masala Dosa, Parathas & coconut gravies',
    historicalContext: 'Observed across 7 logged dosa meals over the past 21 days in demo logs.',
    isDemo: true,
  },
  {
    id: 'pat-02',
    title: 'Post-dinner evening stroll effect',
    eyebrow: 'Activity Pattern',
    observation: 'On evenings with a 20–25 minute walk around 8:30 PM, your overnight glucose stays steady between 95 and 115 mg/dL.',
    encouragementAdvice: 'Light aerobic movement activates non-insulin-dependent muscle glucose uptake (GLUT4). Keep honoring this simple daily walk.',
    impactMetric: '-75% nighttime alarms',
    category: 'exercise',
    confidence: 88,
    relatedFoodOrHabit: 'Post-dinner 20-min neighborhood stroll',
    historicalContext: 'Observed on 9 out of 11 walk nights in the sample dataset.',
    isDemo: true,
  },
  {
    id: 'pat-03',
    title: 'Morning hepatic dawn curve (5:00 AM – 7:00 AM)',
    eyebrow: 'Circadian Pattern',
    observation: 'Between 5:15 AM and 6:45 AM, glucose drifts upward by ~25 mg/dL before breakfast or tea.',
    encouragementAdvice: 'This is the body’s natural liver cortisol/growth hormone wake-up cycle (the Dawn Phenomenon), not caused by anything you ate the night before. You did nothing wrong.',
    impactMetric: 'Predictable +25 mg/dL drift',
    category: 'timing',
    confidence: 86,
    relatedFoodOrHabit: 'Natural waking cortisol release',
    historicalContext: 'Consistent on both weekday and weekend demo CGM curves.',
    isDemo: true,
  },
  {
    id: 'pat-04',
    title: 'Rice vs Roti comparison',
    eyebrow: 'Carb Speed Observation',
    observation: 'Equal carb quantities of White Rice hit the bloodstream ~15–20 minutes faster than Whole Wheat Phulkas.',
    encouragementAdvice: 'White rice has a higher glycemic speed than high-fiber whole wheat. For rice meals, a 15–20 minute pre-bolus helps insulin peak closer to the glucose curve.',
    impactMetric: '15m earlier peak',
    category: 'meal',
    confidence: 94,
    relatedFoodOrHabit: 'Steamed White Rice vs Whole Wheat Chapati',
    historicalContext: 'Calculated from 12 comparative lunch events.',
    isDemo: true,
  },
];

export interface InsightComparisonDataset {
  dayName: string;
  tirPercent: number;
  meanGlucose: number;
  overnightMean: number;
  activeMinutes: number;
}

export const weeklyHistoricalComparisons: InsightComparisonDataset[] = [
  { dayName: 'Monday', tirPercent: 88, meanGlucose: 122, overnightMean: 104, activeMinutes: 30 },
  { dayName: 'Tuesday', tirPercent: 84, meanGlucose: 128, overnightMean: 108, activeMinutes: 20 },
  { dayName: 'Wednesday', tirPercent: 91, meanGlucose: 119, overnightMean: 101, activeMinutes: 40 },
  { dayName: 'Thursday', tirPercent: 86, meanGlucose: 125, overnightMean: 106, activeMinutes: 25 },
  { dayName: 'Friday', tirPercent: 82, meanGlucose: 132, overnightMean: 112, activeMinutes: 15 },
  { dayName: 'Saturday', tirPercent: 78, meanGlucose: 138, overnightMean: 115, activeMinutes: 35 },
  { dayName: 'Sunday', tirPercent: 89, meanGlucose: 120, overnightMean: 103, activeMinutes: 45 },
];

export const postMealResponseSamples = [
  {
    foodCategory: 'White Rice Lunch',
    fastCarbs: true,
    avgRiseMgDl: 54,
    peakTimeMin: 45,
    returnToBaselineMin: 140,
    observation: 'Rapid rise, sharp peak; pre-bolusing 15 min earlier flattens the curve by ~18 mg/dL.',
  },
  {
    foodCategory: 'Whole Wheat Chapati / Roti',
    fastCarbs: false,
    avgRiseMgDl: 38,
    peakTimeMin: 65,
    returnToBaselineMin: 120,
    observation: 'Gradual climb and steady descent due to wheat bran fiber.',
  },
  {
    foodCategory: 'Masala Dosa / Paratha with Chutney',
    fastCarbs: false,
    avgRiseMgDl: 42,
    peakTimeMin: 110,
    returnToBaselineMin: 210,
    observation: 'Delayed wave: stays flat for first hour, then gentle curve at hours 2–3 due to fat digestion.',
  },
  {
    foodCategory: 'Biryani (Mutton/Chicken)',
    fastCarbs: false,
    avgRiseMgDl: 62,
    peakTimeMin: 140,
    returnToBaselineMin: 260,
    observation: 'Extended dual-wave rise extending past 4 hours from high ghee, meat protein, and aged basmati rice.',
  },
];
