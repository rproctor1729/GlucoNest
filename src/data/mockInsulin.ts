import { InsulinLogEntry } from '../types';

export const initialMockInsulin: InsulinLogEntry[] = [
  {
    id: 'ins-01',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    type: 'rapid',
    units: 4.0,
    brandName: 'Novorapid / Humalog',
    deliveryMethod: 'pen',
    notes: 'Breakfast meal pre-bolus (15 min lead time)',
    isDemo: true,
  },
  {
    id: 'ins-02',
    timestamp: new Date(Date.now() - 8.3 * 3600 * 1000).toISOString(),
    type: 'rapid',
    units: 4.5,
    brandName: 'Novorapid / Humalog',
    deliveryMethod: 'pen',
    notes: 'Lunch bolus for 2 chapatis + dal',
    isDemo: true,
  },
  {
    id: 'ins-03',
    timestamp: new Date(Date.now() - 1.0 * 3600 * 1000).toISOString(),
    type: 'rapid',
    units: 4.0,
    brandName: 'Novorapid / Humalog',
    deliveryMethod: 'pen',
    notes: 'Dinner bolus for brown rice & paneer',
    isDemo: true,
  },
  {
    id: 'ins-04',
    timestamp: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
    type: 'basal',
    units: 14.0,
    brandName: 'Lantus / Tresiba',
    deliveryMethod: 'pen',
    notes: 'Bedtime long-acting basal dose',
    isDemo: true,
  },
];
