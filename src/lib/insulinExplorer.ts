import explorer from '@/data/knowledge/insulin-explorer.json';

// Educational data only. No function here calculates or suggests a dose.
export type InsulinCategory = 'bolus' | 'basal' | 'premixed';
export type ActionClass =
  | 'ultra-rapid' | 'rapid-acting' | 'short-acting' | 'intermediate-acting'
  | 'long-acting' | 'ultra-long-acting' | 'premixed' | 'co-formulation';

// A value is either verified (display text plus a source id) or null, which means pending review.
export interface ProfileField { display: string | null; sourceId: string | null }
export interface Market { country: string; status: string; verifiedOn: string | null; sourceId: string | null }
export interface InsulinRecord {
  id: string;
  genericName: string;
  category: InsulinCategory;
  actionClass: ActionClass;
  concentration: string;
  brands: { name: string; manufacturer: string | null }[];
  overview: string;
  presentations: string[];
  deliveryMethods: string[];
  onset: ProfileField;
  peak: ProfileField;
  duration: ProfileField;
  routes: ProfileField;
  pumpCompatibility: ProfileField;
  storage: ProfileField;
  mixing: ProfileField;
  formulationDifferences: ProfileField;
  safetyNotes: string[];
  marketAvailability: Market[];
  sources: string[];
  lastReviewed: string | null;
  reviewStatus: 'label-verified' | 'partly-verified' | 'pending-review';
}
export interface InsulinSource { org: string; title: string; url: string; verified: string }

export const insulinSources: Record<string, InsulinSource> = explorer.sources;
export const insulins: InsulinRecord[] = explorer.insulins as InsulinRecord[];
export const insulinById = new Map(insulins.map(record => [record.id, record]));

export const INSULIN_HUB = '#knowledge-hub/insulin';
export const insulinHref = (id: string) => `${INSULIN_HUB}/${id}`;

export const CATEGORY_LABELS: Record<InsulinCategory, string> = {
  bolus: 'Bolus (mealtime)',
  basal: 'Basal (background)',
  premixed: 'Premixed',
};
// Accent colours also carry a text label, so category is never shown by colour alone.
export const CATEGORY_ACCENT: Record<InsulinCategory, string> = {
  bolus: 'teal',
  basal: 'indigo',
  premixed: 'amber',
};

export const ACTION_CLASS_LABELS: Record<ActionClass, string> = {
  'ultra-rapid': 'Ultra-rapid acting',
  'rapid-acting': 'Rapid acting',
  'short-acting': 'Short acting',
  'intermediate-acting': 'Intermediate acting',
  'long-acting': 'Long acting',
  'ultra-long-acting': 'Ultra-long acting',
  premixed: 'Premixed mixture',
  'co-formulation': 'Co-formulation (basal + bolus)',
};

export const STATUS_LABELS: Record<string, string> = {
  'verified-available': 'Verified available',
  discontinued: 'Discontinued',
  'being-phased-out': 'Being phased out',
  'availability-unverified': 'Availability unverified',
};

export const PENDING = 'Pending review';

// Verified text, or null. Callers show PENDING for null, never zero or "not applicable".
export function valueOf(field: ProfileField): string | null {
  return field.display && field.display.trim() ? field.display : null;
}

export function sourceFor(field: ProfileField): InsulinSource | null {
  return field.sourceId ? insulinSources[field.sourceId] ?? null : null;
}

export function isVerifiedInCountry(record: InsulinRecord, country: string) {
  return record.marketAvailability.some(market => market.country === country && market.status === 'verified-available');
}

export function countries(): string[] {
  return [...new Set(insulins.flatMap(record => record.marketAvailability.map(market => market.country)))].sort();
}

function normalize(text: string) {
  return text.normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

const searchIndex = new Map(insulins.map(record => [record.id, normalize([
  record.genericName,
  ...record.brands.map(brand => brand.name),
  CATEGORY_LABELS[record.category],
  ACTION_CLASS_LABELS[record.actionClass],
  record.concentration,
  ...record.presentations,
].join(' '))]));

export interface InsulinFilters {
  query?: string;
  category?: InsulinCategory | '';
  actionClass?: ActionClass | '';
  concentration?: string;
  deliveryMethod?: string;
  country?: string;
}

// Every typed word must appear somewhere in the searchable text.
export function filterInsulins(filters: InsulinFilters): InsulinRecord[] {
  const words = normalize(filters.query ?? '').split(' ').filter(Boolean);
  return insulins.filter(record => {
    if (filters.category && record.category !== filters.category) return false;
    if (filters.actionClass && record.actionClass !== filters.actionClass) return false;
    if (filters.concentration && record.concentration !== filters.concentration) return false;
    if (filters.deliveryMethod && !record.deliveryMethods.includes(filters.deliveryMethod)) return false;
    if (filters.country && !isVerifiedInCountry(record, filters.country)) return false;
    const text = searchIndex.get(record.id) ?? '';
    return words.every(word => text.includes(word));
  });
}

export function uniqueValues(pick: (record: InsulinRecord) => string[]): string[] {
  return [...new Set(insulins.flatMap(pick))].sort();
}
