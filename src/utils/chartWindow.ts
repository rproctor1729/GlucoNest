export interface ReadingWindow { startIndex: number; endIndex: number }

// A shorter time preset can render before the previous brush state is reset.
// Keep both handles inside the new data to avoid invalid SVG coordinates.
export function getReadingWindow(window: ReadingWindow | null, count: number): ReadingWindow {
  const last = Math.max(0, count - 1);
  const start = window && Number.isFinite(window.startIndex) ? Math.trunc(window.startIndex) : 0;
  const end = window && Number.isFinite(window.endIndex) ? Math.trunc(window.endIndex) : last;
  const startIndex = Math.min(last, Math.max(0, start));
  return { startIndex, endIndex: Math.min(last, Math.max(startIndex, end)) };
}
