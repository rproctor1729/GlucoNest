import type { GlucoseReading, GlucoseUnit } from '@/types';
import { calculateAgpProfile } from '@/utils/agp';
import { convertGlucose } from '@/utils/glucoseUtils';

export default function ReportGlucoseProfile({ readings, unit, targetRange }: {
  readings: GlucoseReading[]; unit: GlucoseUnit; targetRange: { low: number; high: number };
}) {
  const profile = calculateAgpProfile(readings).filter(bucket => bucket.count >= 5);
  if (profile.length < 12) return null;
  const maximum = Math.max(300, targetRange.high + 20, ...readings.map(r => r.value));
  const x = (minute: number) => 45 + minute / 1440 * 850;
  const y = (value: number) => 250 - (value - 20) / (maximum - 20) * 210;
  const segments: typeof profile[] = [];
  for (const point of profile) {
    const last = segments.at(-1);
    if (!last || point.minuteOfDay - last[last.length - 1].minuteOfDay > 60) segments.push([point]);
    else last.push(point);
  }
  return <section className="space-y-2 break-inside-avoid">
    <h4 className="font-semibold">Time-of-day glucose profile</h4>
    <p className="text-xs text-slate-600 dark:text-slate-300">Median and 10th–90th percentiles in half-hour bins with at least five readings. An exploratory profile, not a clinical AGP.</p>
    <svg viewBox="0 0 930 290" className="w-full text-nest-700 dark:text-nest-200" role="img" aria-label="Median glucose and percentile band by time of day">
      <rect x="45" y={y(targetRange.high)} width="850" height={y(targetRange.low) - y(targetRange.high)} fill="currentColor" opacity=".06" />
      {[70, 180, 250].filter(value => value < maximum).map(value => <g key={value}><line x1="45" x2="895" y1={y(value)} y2={y(value)} stroke="currentColor" strokeDasharray="3 6" opacity=".2" /><text x="36" y={y(value) + 4} textAnchor="end" fontSize="10" fill="currentColor">{convertGlucose(value, unit)}</text></g>)}
      {[0, 360, 720, 1080, 1440].map(minute => <text key={minute} x={x(minute)} y="278" textAnchor={minute === 0 ? 'start' : minute === 1440 ? 'end' : 'middle'} fontSize="10" fill="currentColor">{String(minute / 60).padStart(2, '0')}:00</text>)}
      {segments.map(segment => <g key={segment[0].minuteOfDay}>
        {segment.length > 1 && <polygon points={[...segment.map(p => `${x(p.minuteOfDay)},${y(p.percentile90)}`), ...[...segment].reverse().map(p => `${x(p.minuteOfDay)},${y(p.percentile10)}`)].join(' ')} fill="currentColor" opacity=".15" />}
        <path d={segment.map((p, index) => `${index ? 'L' : 'M'}${x(p.minuteOfDay)} ${y(p.median)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2.5" />
      </g>)}
    </svg>
  </section>;
}
