export interface TirBreakdown {
  totalReadings: number;
  hasSufficientData: boolean;
  hasSufficientVariabilityData: boolean;
  hasSufficientGmiData: boolean;
  coverageMinutes: number;
  inRangePercent: number;
  timeAboveRangePercent: number;
  highPercent: number;
  veryHighPercent: number;
  timeBelowRangePercent: number;
  lowPercent: number;
  veryLowPercent: number;
  meanGlucose: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  gmiPercent: number;
  gmiExplanation: string;
  minReading: number;
  maxReading: number;
}

interface TimedReading {
  value: number;
  timestamp?: string;
}

function emptyBreakdown(): TirBreakdown {
  return {
    totalReadings: 0,
    hasSufficientData: false,
    hasSufficientVariabilityData: false,
    hasSufficientGmiData: false,
    coverageMinutes: 0,
    inRangePercent: 0,
    timeAboveRangePercent: 0,
    highPercent: 0,
    veryHighPercent: 0,
    timeBelowRangePercent: 0,
    lowPercent: 0,
    veryLowPercent: 0,
    meanGlucose: 0,
    standardDeviation: 0,
    coefficientOfVariation: 0,
    gmiPercent: 0,
    gmiExplanation: 'Not enough valid glucose readings to calculate metrics.',
    minReading: 0,
    maxReading: 0,
  };
}

// Rounds bucket shares so they always add to exactly 100 (largest-remainder method).
// Plain per-bucket rounding can make the range percentages total 99 or 101.
function roundBucketsToHundred(amounts: number[], total: number): number[] {
  if (total <= 0 || amounts.every((amount) => amount === 0)) return amounts.map(() => 0);
  const raw = amounts.map((amount) => (amount / total) * 100);
  const result = raw.map((value) => Math.floor(value));
  let remaining = 100 - result.reduce((sum, value) => sum + value, 0);
  const byFraction = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (const { index } of byFraction) {
    if (remaining <= 0) break;
    result[index] += 1;
    remaining -= 1;
  }
  return result;
}

export function calculateDetailedTIR(
  readings: TimedReading[],
  targetLow = 70,
  targetHigh = 180
): TirBreakdown {
  if (
    !Number.isFinite(targetLow) ||
    !Number.isFinite(targetHigh) ||
    targetLow < 20 ||
    targetHigh > 400 ||
    targetLow >= targetHigh
  ) {
    throw new Error('Target range must be between 20 and 400 mg/dL with a lower value below the upper value.');
  }
  const uniqueReadings = new Map<string, TimedReading>();
  (readings || []).forEach((reading, index) => {
    if (!Number.isFinite(reading.value) || reading.value < 20 || reading.value > 600) return;
    const timestamp = reading.timestamp ? Date.parse(reading.timestamp) : NaN;
    const key = Number.isFinite(timestamp) ? String(timestamp) : `reading-${index}`;
    if (!uniqueReadings.has(key)) uniqueReadings.set(key, reading);
  });

  const cleanReadings = [...uniqueReadings.values()].sort((first, second) => {
    const firstTime = first.timestamp ? Date.parse(first.timestamp) : NaN;
    const secondTime = second.timestamp ? Date.parse(second.timestamp) : NaN;
    return Number.isFinite(firstTime) && Number.isFinite(secondTime) ? firstTime - secondTime : 0;
  });
  if (cleanReadings.length === 0) return emptyBreakdown();

  const hasTimestamps = cleanReadings.length > 1 && cleanReadings.every(
    (reading) => reading.timestamp && Number.isFinite(Date.parse(reading.timestamp))
  );
  const weights = cleanReadings.map(() => 1);
  const statisticWeights = cleanReadings.map(() => 1);
  let coverageMinutes = 0;
  if (hasTimestamps) {
    weights.fill(0);
    statisticWeights.fill(0);
    for (let index = 0; index < cleanReadings.length - 1; index += 1) {
      const currentTime = Date.parse(cleanReadings[index].timestamp!);
      const nextTime = Date.parse(cleanReadings[index + 1].timestamp!);
      const intervalMinutes = (nextTime - currentTime) / 60000;
      if (intervalMinutes > 0 && intervalMinutes <= 15) {
        weights[index] = intervalMinutes;
        statisticWeights[index] += intervalMinutes / 2;
        statisticWeights[index + 1] += intervalMinutes / 2;
        coverageMinutes += intervalMinutes;
      }
    }
  }

  // When no interval is short enough to count (for example, fingerstick entries hours apart),
  // every weight would be zero and all percentages would show 0%. Count each reading once instead.
  if (weights.every((weight) => weight === 0)) weights.fill(1);

  const buckets = { veryLow: 0, low: 0, inRange: 0, high: 0, veryHigh: 0 };
  let weightedSum = 0;
  let minReading = Infinity;
  let maxReading = -Infinity;

  cleanReadings.forEach((reading, index) => {
    const value = reading.value;
    const weight = weights[index];
    weightedSum += value * statisticWeights[index];
    minReading = Math.min(minReading, value);
    maxReading = Math.max(maxReading, value);

    if (value < 54) buckets.veryLow += weight;
    else if (value < targetLow) buckets.low += weight;
    else if (value <= targetHigh) buckets.inRange += weight;
    else if (value <= 250) buckets.high += weight;
    else buckets.veryHigh += weight;
  });

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const statisticWeight = statisticWeights.reduce((sum, weight) => sum + weight, 0);
  const mean = Math.round(
    statisticWeight > 0
      ? weightedSum / statisticWeight
      : cleanReadings.reduce((sum, reading) => sum + reading.value, 0) / cleanReadings.length
  );
  const variance = statisticWeight > 0
    ? cleanReadings.reduce(
        (sum, reading, index) => sum + statisticWeights[index] * Math.pow(reading.value - mean, 2),
        0
      ) / statisticWeight
    : cleanReadings.reduce((sum, reading) => sum + Math.pow(reading.value - mean, 2), 0) / cleanReadings.length;
  const standardDeviation = Math.round(Math.sqrt(variance));
  const coefficientOfVariation = mean > 0 ? Math.round((standardDeviation / mean) * 100) : 0;
  const denominator = totalWeight || cleanReadings.length;
  const [veryLowPercent, lowPercent, inRangePercent, highPercent, veryHighPercent] = roundBucketsToHundred(
    [buckets.veryLow, buckets.low, buckets.inRange, buckets.high, buckets.veryHigh],
    denominator
  );

  return {
    totalReadings: cleanReadings.length,
    hasSufficientData: hasTimestamps
      ? coverageMinutes >= 12 * 60
      : cleanReadings.length >= 2,
    hasSufficientVariabilityData: hasTimestamps
      ? statisticWeight > 0 && cleanReadings.filter((_reading, index) => statisticWeights[index] > 0).length >= 2
      : cleanReadings.length >= 2,
    hasSufficientGmiData: hasTimestamps
      ? coverageMinutes >= 10 * 24 * 60
      : cleanReadings.length >= 2,
    coverageMinutes: Math.round(coverageMinutes),
    inRangePercent,
    timeAboveRangePercent: highPercent + veryHighPercent,
    highPercent,
    veryHighPercent,
    timeBelowRangePercent: lowPercent + veryLowPercent,
    lowPercent,
    veryLowPercent,
    meanGlucose: mean,
    standardDeviation,
    coefficientOfVariation,
    gmiPercent: Number((3.31 + 0.02392 * mean).toFixed(1)),
    gmiExplanation:
      'GMI is a CGM-derived estimate of your HbA1c based on average glucose over time. It is not interchangeable with a laboratory venous blood HbA1c test, but provides a helpful directional proxy.',
    minReading: minReading === Infinity ? 0 : minReading,
    maxReading: maxReading === -Infinity ? 0 : maxReading,
  };
}
