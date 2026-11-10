// Sample records are shown only until the user has a real record of the same kind.
// This only changes what is returned. It never removes or rewrites stored records.
export function visibleRecords<T extends { isDemo?: boolean }>(records: readonly T[]): T[] {
  const real = records.filter((record) => !record.isDemo);
  return real.length > 0 ? real : [...records];
}
