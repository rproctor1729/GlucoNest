// Parses short plain-text entries such as "2u 15m ago", "45g carbs", "run 30m" or "basal 18u".
// The parser only records what the user typed. It never calculates a dose or suggests one.

export type QuickEntry =
  | { kind: 'insulin'; units: number; subType: 'rapid' | 'basal'; minutesAgo: number; raw: string }
  | { kind: 'carbs'; grams: number; label: string; minutesAgo: number; raw: string }
  | { kind: 'exercise'; minutes: number; label: string; minutesAgo: number; raw: string };

export interface QuickEntryResult {
  entries: QuickEntry[];
  errors: string[];
}

export const QUICK_ENTRY_LIMITS = {
  insulinMax: 100,
  carbsMax: 300,
  exerciseMaxMinutes: 600,
  minutesAgoMax: 24 * 60,
} as const;

const AGO = /\b(\d+(?:\.\d+)?)\s*(minutes?|mins?|m|hours?|hrs?|h)\s+ago\b/i;
const INSULIN_UNITS = /(\d+(?:\.\d+)?)\s*(?:u|units?|iu)\b/i;
const CARBS_GRAMS = /(\d+(?:\.\d+)?)\s*(?:g|grams?)\b/i;
const CARBS_WORD = /\b(?:carbs?|carbohydrates?)\s*(\d+(?:\.\d+)?)\b|\b(\d+(?:\.\d+)?)\s*carbs?\b/i;
const MINUTES = /(\d+(?:\.\d+)?)\s*(minutes?|mins?|m|hours?|hrs?|h)\b/i;
const BASAL_WORDS = /\b(basal|lantus|tresiba|glargine|levemir|degludec)\b/i;
const EXERCISE_WORDS = /\b(run|running|walk|walking|cycle|cycling|swim|swimming|gym|yoga|workout|exercise|cricket|football|dance|hike|jog|sport|sports)\b/i;

function toMinutes(amount: number, unit: string): number {
  return /^h/i.test(unit) ? Math.round(amount * 60) : Math.round(amount);
}

function leftoverLabel(text: string): string {
  return text.replace(/[\d.]+/g, ' ').replace(/\b(u|units?|iu|g|grams?|carbs?|carbohydrates?|minutes?|mins?|m|hours?|hrs?|h|of|and)\b/gi, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, 40);
}

function parseSegment(segment: string): { entry?: QuickEntry; error?: string } {
  let rest = segment.trim();
  let minutesAgo = 0;
  const ago = rest.match(AGO);
  if (ago) {
    minutesAgo = toMinutes(Number(ago[1]), ago[2]);
    rest = rest.replace(AGO, ' ').trim();
  } else if (/\bago\b/i.test(rest)) {
    return { error: `“${segment}”: the time was not understood. Use a form like “15m ago” or “1h ago”.` };
  }
  if (!rest) return { error: `“${segment}”: add what it was, such as 2u, 45g or run 30m.` };
  if (minutesAgo < 0 || minutesAgo > QUICK_ENTRY_LIMITS.minutesAgoMax) {
    return { error: `“${segment}”: the time must be within the last 24 hours.` };
  }

  const insulin = rest.match(INSULIN_UNITS);
  if (insulin) {
    const units = Number(insulin[1]);
    if (!(units > 0) || units > QUICK_ENTRY_LIMITS.insulinMax) return { error: `“${segment}”: enter insulin between 0.1 and ${QUICK_ENTRY_LIMITS.insulinMax} units.` };
    if (!/^\d+(\.\d)?$/.test(insulin[1])) return { error: `“${segment}”: use at most one decimal place for units.` };
    const subType = BASAL_WORDS.test(rest) ? 'basal' : 'rapid';
    return { entry: { kind: 'insulin', units, subType, minutesAgo, raw: segment } };
  }

  const grams = rest.match(CARBS_GRAMS) ?? rest.match(CARBS_WORD);
  if (grams) {
    const value = Number(grams[1] ?? grams[2]);
    if (!(value >= 1) || value > QUICK_ENTRY_LIMITS.carbsMax) return { error: `“${segment}”: enter carbs between 1 and ${QUICK_ENTRY_LIMITS.carbsMax} g.` };
    return { entry: { kind: 'carbs', grams: value, label: leftoverLabel(rest), minutesAgo, raw: segment } };
  }

  const minutes = rest.match(MINUTES);
  if (EXERCISE_WORDS.test(rest) || minutes) {
    if (!minutes) return { error: `“${segment}”: add a duration, such as 30m or 1h.` };
    const value = toMinutes(Number(minutes[1]), minutes[2]);
    if (value < 1 || value > QUICK_ENTRY_LIMITS.exerciseMaxMinutes) return { error: `“${segment}”: enter activity between 1 and ${QUICK_ENTRY_LIMITS.exerciseMaxMinutes} minutes.` };
    const exerciseWord = rest.match(EXERCISE_WORDS)?.[0];
    return { entry: { kind: 'exercise', minutes: value, label: exerciseWord ?? leftoverLabel(rest) ?? 'activity', minutesAgo, raw: segment } };
  }

  if (/^\d+(\.\d+)?$/.test(rest) || /\d/.test(rest)) {
    return { error: `“${segment}”: add a unit. Use u for insulin, g for carbs, or m for minutes of activity.` };
  }
  return { error: `“${segment}”: not understood. Try “2u 15m ago”, “45g carbs” or “run 30m”.` };
}

export function parseQuickEntry(input: string): QuickEntryResult {
  const segments = input.split(/[,;\n]+|\s+and\s+|\s+\+\s+/i).map(part => part.trim()).filter(Boolean);
  const entries: QuickEntry[] = [];
  const errors: string[] = [];
  if (!segments.length) return { entries, errors: ['Type an entry first, for example “2u 15m ago”.'] };
  for (const segment of segments) {
    const result = parseSegment(segment);
    if (result.entry) entries.push(result.entry);
    if (result.error) errors.push(result.error);
  }
  return { entries, errors };
}

// The timestamp for an entry that happened `minutesAgo` before `now`.
export function timestampFor(entry: Pick<QuickEntry, 'minutesAgo'>, now: number = Date.now()): string {
  return new Date(now - entry.minutesAgo * 60_000).toISOString();
}

export function describeEntry(entry: QuickEntry): string {
  const when = entry.minutesAgo === 0 ? 'now' : entry.minutesAgo < 60 ? `${entry.minutesAgo} min ago` : `${Math.round(entry.minutesAgo / 60 * 10) / 10} h ago`;
  if (entry.kind === 'insulin') return `${entry.units} u ${entry.subType} insulin, ${when}`;
  if (entry.kind === 'carbs') return `${entry.grams} g carbs${entry.label ? ` (${entry.label})` : ''}, ${when}`;
  return `${entry.minutes} min ${entry.label}, ${when}`;
}

// Maps the exercise word the user typed onto the activity types the activity log supports.
export function activityTypeFor(label: string): 'walk' | 'run' | 'gym' | 'cycling' | 'yoga' | 'sports' | 'other' {
  const word = label.toLowerCase();
  if (/run|jog/.test(word)) return 'run';
  if (/walk|hike/.test(word)) return 'walk';
  if (/cycl|bike/.test(word)) return 'cycling';
  if (/gym|strength|weight/.test(word)) return 'gym';
  if (/yoga/.test(word)) return 'yoga';
  if (/swim|cricket|football|sport|dance/.test(word)) return 'sports';
  return 'other';
}
