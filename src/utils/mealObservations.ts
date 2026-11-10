import type { GlucoseReading, MealLogEntry } from '@/types';

export function findRepeatedMealObservation(meals: MealLogEntry[], readings: GlucoseReading[]) {
  const valid = readings.filter(r => !r.isDemo && Number.isFinite(Date.parse(r.timestamp)) && r.value >= 20 && r.value <= 600)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  const groups = new Map<string, { name: string; changes: number[] }>();
  for (const meal of meals) {
    if (meal.isDemo) continue;
    const time = Date.parse(meal.timestamp);
    if (!Number.isFinite(time)) continue;
    const before = valid.filter(r => Date.parse(r.timestamp) <= time && Date.parse(r.timestamp) >= time - 30 * 60000).at(-1);
    const after = valid.filter(r => Date.parse(r.timestamp) >= time + 60 * 60000 && Date.parse(r.timestamp) <= time + 180 * 60000);
    if (!before || !after.length) continue;
    const change = Math.max(...after.map(r => r.value)) - before.value;
    const names = new Map((meal.items.length ? meal.items.map(item => item.name) : [meal.name]).map(name => [name.trim().toLowerCase(), name.trim()]));
    for (const [key, name] of names) {
      if (!key) continue;
      const group = groups.get(key) ?? { name, changes: [] };
      group.changes.push(change);
      groups.set(key, group);
    }
  }
  const candidate = [...groups.values()].filter(group => group.changes.length >= 5).sort((a, b) => b.changes.length - a.changes.length)[0];
  return candidate ? { food: candidate.name, count: candidate.changes.length, averageChange: Math.round(candidate.changes.reduce((sum, value) => sum + value, 0) / candidate.changes.length) } : null;
}
