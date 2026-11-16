'use client';

import { useState } from 'react';
import { PENDING, valueOf, type InsulinRecord } from '@/lib/insulinExplorer';
import styles from './InsulinExplorer.module.css';

const W = 640;
const H = 280;
const PAD = { left: 56, right: 16, top: 18, bottom: 48 };
const COLORS = ['#0f766e', '#4338ca', '#b45309'];
const DASHES = ['none', '9 5', '3 4'];
const STEPS = 80;

// Conceptual shapes only: one generic template per action class.
// They are not fitted to any product's onset, peak or duration numbers.
function shape(actionClass: string, x: number): number {
  const bell = (mu: number, sigma: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
  switch (actionClass) {
    case 'ultra-rapid': return bell(0.16, 0.1);
    case 'rapid-acting': return bell(0.27, 0.14);
    case 'short-acting': return bell(0.38, 0.2);
    case 'intermediate-acting': return bell(0.55, 0.27);
    case 'premixed': return 0.55 * bell(0.2, 0.1) + 0.45 * bell(0.6, 0.18);
    default: {
      // Long, ultra-long and co-formulation: a broad, flatter shape with no sharp peak.
      const rise = Math.min(1, x / 0.25);
      const fall = Math.min(1, (1 - x) / 0.3);
      return 0.85 * Math.min(rise, fall);
    }
  }
}

function pathFor(actionClass: string) {
  const points: string[] = [];
  for (let step = 0; step <= STEPS; step += 1) {
    const x = step / STEPS;
    const y = shape(actionClass, x);
    const px = PAD.left + x * (W - PAD.left - PAD.right);
    const py = PAD.top + (1 - y) * (H - PAD.top - PAD.bottom);
    points.push(`${step === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return points.join(' ');
}

export default function ActionProfileChart({ records }: { records: InsulinRecord[] }) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) => setHidden(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const baseY = H - PAD.bottom;

  return (
    <figure className={styles.chartFigure}>
      <figcaption>
        <strong>Conceptual illustration.</strong> Each curve is a generic shape for an action class. It is not a measured
        profile, is not to scale, and is not normalised to dose. Do not read doses from it, and it does not predict
        anyone&apos;s glucose or insulin on board.
      </figcaption>
      <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label="Conceptual insulin action shapes over time. Illustration only, not measured data.">
        {[0.25, 0.5, 0.75, 1].map(level => {
          const y = PAD.top + (1 - level) * (H - PAD.top - PAD.bottom);
          return <line key={level} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.12" />;
        })}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={baseY} stroke="currentColor" strokeOpacity="0.5" />
        <line x1={PAD.left} x2={W - PAD.right} y1={baseY} y2={baseY} stroke="currentColor" strokeOpacity="0.5" />
        <text x={PAD.left - 8} y={PAD.top + 4} textAnchor="end" fontSize="12" fill="currentColor">High</text>
        <text x={PAD.left - 8} y={baseY} textAnchor="end" fontSize="12" fill="currentColor">Low</text>
        <text x={(PAD.left + W - PAD.right) / 2} y={H - 22} textAnchor="middle" fontSize="12" fill="currentColor">
          Time after dose (conceptual, not to scale)
        </text>
        <text x={PAD.left} y={H - 6} fontSize="12" fill="currentColor">Start</text>
        <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize="12" fill="currentColor">Later</text>
        <text x={18} y={PAD.top + 90} fontSize="12" fill="currentColor" transform={`rotate(-90 18 ${PAD.top + 90})`}>
          Relative activity (conceptual)
        </text>
        {records.map((record, index) => !hidden.has(record.id) && (
          <path key={record.id} d={pathFor(record.actionClass)} fill="none" stroke={COLORS[index % 3]}
            strokeWidth="3" strokeDasharray={DASHES[index % 3] === 'none' ? undefined : DASHES[index % 3]} strokeLinejoin="round">
            <title>{`${record.brands[0].name} (${record.concentration}), conceptual shape`}</title>
          </path>
        ))}
      </svg>
      {records.length > 0 && (
        <ul className={styles.chartLegend} aria-label="Show or hide curves">
          {records.map((record, index) => {
            const on = !hidden.has(record.id);
            return (
              <li key={record.id}>
                <button type="button" className={styles.tab} aria-pressed={on} onClick={() => toggle(record.id)}>
                  <span className={styles.swatch} style={{ borderColor: COLORS[index % 3], borderTopStyle: DASHES[index % 3] === 'none' ? 'solid' : 'dashed' }} aria-hidden="true" />
                  {' '}{record.brands[0].name} · {record.concentration}
                </button>
                <span className="sr-only">: </span>
                <small>
                  Onset {valueOf(record.onset) ?? PENDING}; peak {valueOf(record.peak) ?? PENDING}; duration {valueOf(record.duration) ?? PENDING}.
                </small>
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}
