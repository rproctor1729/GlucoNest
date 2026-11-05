export interface AgpBucket {
  minuteOfDay: number;
  count: number;
  percentile10: number;
  median: number;
  percentile90: number;
}

interface Reading {
  timestamp: string;
  value: number;
}

function percentile(sortedValues: number[], fraction: number): number {
  const position = (sortedValues.length - 1) * fraction;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const weight = position - lowerIndex;
  return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
}

export function calculateAgpProfile(readings: Reading[]): AgpBucket[] {
  const bins = new Map<number, number[]>();
  for (const reading of readings) {
    const timestamp = Date.parse(reading.timestamp);
    if (!Number.isFinite(timestamp) || !Number.isFinite(reading.value) || reading.value < 20 || reading.value > 600) {
      continue;
    }
    const date = new Date(timestamp);
    const minuteOfDay = Math.floor((date.getHours() * 60 + date.getMinutes()) / 30) * 30;
    bins.set(minuteOfDay, [...(bins.get(minuteOfDay) ?? []), reading.value]);
  }

  return [...bins.entries()]
    .sort(([first], [second]) => first - second)
    .map(([minuteOfDay, values]) => {
      const sorted = values.sort((first, second) => first - second);
      return {
        minuteOfDay,
        count: sorted.length,
        percentile10: percentile(sorted, 0.1),
        median: percentile(sorted, 0.5),
        percentile90: percentile(sorted, 0.9),
      };
    });
}
