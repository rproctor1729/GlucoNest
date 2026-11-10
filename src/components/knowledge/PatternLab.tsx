'use client';

import { useId, useState } from 'react';
import { convertGlucose } from '@/utils/glucoseUtils';
import type { GlucoseUnit } from '@/types';
import styles from './KnowledgeHub.module.css';

const patterns = {
  day: { name: 'A sample day', description: 'Meals and activity can create several rises and falls over a day.', points: [114,110,105,101,98,96,100,105,140,168,144,127,121,165,199,166,136,106,101,133,163,145,124,118] },
  dawn: { name: 'Dawn rise', description: 'Look at the hours before breakfast. This example rises from 04:00 without an earlier low.', points: [108,105,102,101,104,117,140,169,166,145,135,122,119,148,159,140,128,117,114,135,146,130,119,114] },
  overnight: { name: 'Overnight low', description: 'This example dips below the band overnight. A later reading alone cannot establish why.', points: [110,90,72,61,66,85,106,135,149,140,132,123,117,150,159,141,124,113,109,127,146,132,123,117] },
  meal: { name: 'After a meal', description: 'A rise after lunch can differ in timing and duration with digestion, meal composition and insulin action.', points: [110,107,105,103,101,101,103,111,130,139,127,123,125,168,210,194,160,142,131,140,151,140,130,121] },
  exercise: { name: 'Activity and recovery', description: 'An example afternoon session is followed by a later low. This is one possible response, not a prediction.', points: [115,112,109,106,102,103,110,127,147,137,125,121,140,153,148,129,111,105,123,126,106,83,65,82] },
};
export type Pattern = keyof typeof patterns;
const hourLabel = (hour: number) => String(hour).padStart(2, '0') + ':00';
const x = (index: number) => 44 + index * 440 / 23;
const y = (value: number) => 164 - (value - 40) * 140 / 200;
const line = (points: number[]) => points.map((value, i) => x(i) + ',' + y(value)).join(' ');

export default function PatternLab({ initial = 'day', agp = false }: { initial?: Pattern; agp?: boolean }) {
  const [mode, setMode] = useState<Pattern>(initial);
  const [hour, setHour] = useState(initial === 'meal' ? 14 : initial === 'exercise' ? 22 : 5);
  const [unit, setUnit] = useState<GlucoseUnit>('mg/dL');
  const id = useId();
  const pattern = patterns[mode];
  const points = pattern.points;
  const band = points.map((value, i) => value + (i > 11 && i < 17 ? 30 : 10));
  const lower = points.map((value, i) => value - (i > 11 && i < 17 ? 22 : 8));
  const below = points.filter(value => value < 70).length;
  const above = points.filter(value => value > 180).length;
  const counts = [below, 24 - below - above, above];
  return <div className={styles.lab}>
    <h2>{agp ? 'Read an illustrative AGP' : 'Explore a glucose pattern'}</h2>
    <p className={styles.meta}>Illustrative data only · {agp ? 'schematic median and middle 50% band' : '24 equally weighted hourly examples'}</p>
    <div className={styles.labControls}>{!agp && <label>Pattern <select value={mode} onChange={e => setMode(e.target.value as Pattern)}>
      {Object.entries(patterns).map(([key, p]) => <option key={key} value={key}>{p.name}</option>)}</select></label>}
      <label>Units <select value={unit} onChange={e => setUnit(e.target.value as GlucoseUnit)}><option>mg/dL</option><option>mmol/L</option></select></label></div>
    <svg viewBox="0 0 505 192" role="img" aria-labelledby={id} className={styles.plot}>
      <title id={id}>{agp ? 'Illustrative median with a wider afternoon spread' : pattern.description}</title>
      <rect x="44" y={y(180)} width="440" height={y(70)-y(180)} fill="currentColor" opacity=".07" />
      {[70,180].map(v => <g key={v}><line x1="44" x2="484" y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".45" strokeDasharray="4 5" />
        <text x="39" y={y(v)+4} textAnchor="end">{convertGlucose(v,unit)}</text></g>)}
      {agp && <polygon points={line(band) + ' ' + lower.map((v,i) => x(i)+','+y(v)).reverse().join(' ')} fill="currentColor" opacity=".22" />}
      <polyline points={line(points)} fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx={x(hour)} cy={y(points[hour])} r="4" fill="currentColor" />
      {[0,4,8,12,16,20,23].map(h => <text key={h} x={x(h)} y="182" textAnchor="middle">{hourLabel(h)}</text>)}
    </svg>
    <label className={styles.slider}>Explore hour <input type="range" min="0" max="23" value={hour} onChange={e => setHour(Number(e.target.value))} />
      <output>{hourLabel(hour)} · {convertGlucose(points[hour], unit)} {unit}{agp ? ' median' : ''}</output></label>
    {agp ? <p>At {hourLabel(hour)} the illustrative middle half spans {convertGlucose(lower[hour],unit)}–{convertGlucose(band[hour],unit)} {unit}. These bands describe variation across days.</p> :
      <><p>{pattern.description}</p><div className={styles.rangeBar} aria-hidden="true">{counts.map((count,i) => <i key={i} style={{flexGrow:count}} />)}</div>
        <p className={styles.meta}>{['Below','In range','Above'].map((name,i) => name + ' ' + Math.round(counts[i]/24*100) + '%').join(' · ')} · Example band {convertGlucose(70,unit)}–{convertGlucose(180,unit)} {unit}</p></>}
  </div>;
}
