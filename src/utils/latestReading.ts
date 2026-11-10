// Picks the most recent reading. Readings are compared by timestamp, so an array that
// was merged or appended out of order still gives the right answer.
// A reading with no valid timestamp is only used when no reading has one, and then the
// last one in array order wins. Ties go to the later array position.

export interface LatestCandidate {
  timestamp?: string;
}

export function getLatestReading<T extends LatestCandidate>(readings: readonly T[]): T | null {
  let latest: T | null = null;
  let latestTime = -Infinity;
  let fallback: T | null = null;

  for (const reading of readings) {
    const time = reading.timestamp ? Date.parse(reading.timestamp) : NaN;
    if (Number.isFinite(time)) {
      if (time >= latestTime) {
        latest = reading;
        latestTime = time;
      }
    } else {
      fallback = reading;
    }
  }

  return latest ?? fallback;
}
