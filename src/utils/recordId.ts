export function recordId(prefix: 'meal' | 'ins' | 'act' | 'g-manual' | 'fb' | 'csv'): string {
  const suffix = globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}
