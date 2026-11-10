'use client';

import { useState } from 'react';
import { sources, type Topic } from '@/lib/knowledge';
import { convertGlucose, parseGlucoseInput } from '@/utils/glucoseUtils';
import type { GlucoseUnit } from '@/types';
import PatternLab, { type Pattern } from './PatternLab';
import FoodLab from './FoodLab';
import styles from './KnowledgeHub.module.css';

const patterns: Record<string, Pattern> = {
  'dawn-phenomenon': 'dawn', 'somogyi-effect': 'overnight', 'time-in-range-tir': 'day',
  'time-below-range-tbr': 'overnight', 'time-above-range-tar': 'meal', 'what-is-a-cgm': 'day',
  'high-fat-and-high-protein-meals': 'meal', 'bolus-timing': 'meal', 'hypoglycemia': 'overnight',
  'delayed-hypoglycemia-after-activity': 'exercise', 'nighttime-lows-after-exercise': 'exercise',
};
function Walkthrough({ correction }: { correction: boolean }) {
  const [step, setStep] = useState(0);
  const steps = correction ? [
    'Read the example factor: 50 mg/dL per unit.',
    'For a fictional 50 mg/dL difference, the classroom expression is 50 mg/dL ÷ 50 mg/dL per unit.',
    'The units cancel to one unit on paper. This arithmetic omits active insulin and the other factors a clinician considers.',
  ] : [
    'Read 1:10 as ten grams of carbohydrate per unit of mealtime insulin.',
    'For a fictional 20 grams of carbohydrate, the classroom expression is 20 grams ÷ 10 grams per unit.',
    'The arithmetic gives two units in this example. A real meal decision requires your agreed plan.',
  ];
  return <section className={styles.lab}><h2>{correction ? 'Correction factor' : 'Carbohydrate ratio'} walkthrough</h2>
    <p className={styles.meta}>Educational mode · fixed hypothetical values · never use this example to dose</p>
    <ol>{steps.slice(0,step+1).map(s => <li key={s}>{s}</li>)}</ol>
    <button className={styles.control} onClick={() => setStep(step === 2 ? 0 : step+1)}>{step === 2 ? 'Start again' : 'Show next step'}</button></section>;
}
function ActionTimeline() {
  const [stage,setStage] = useState(0);
  const phases = [
    ['Just delivered','Insulin is present at the delivery site. Its glucose-lowering effect takes time to develop.'],
    ['Action building','Insulin is being absorbed. A glucose rise shortly after a meal can overlap with active insulin.'],
    ['Strongest action','The effect can be significant even if the original dose is no longer recent. Preparations differ in peak and shape.'],
    ['Action fading','Some effect may remain as a device estimate declines. A model cannot directly measure remaining insulin.'],
  ];
  return <section className={styles.lab}><h2>Follow one illustrative bolus</h2><p>Conceptual action curve. The stages are not a clock or an individual IOB estimate.</p>
    <svg viewBox="0 0 320 86" role="img" aria-label="Conceptual bolus action rising from delivery, peaking and then fading" className={styles.timeline}>
      <path d="M12 74 C52 74 62 48 97 26 S160 10 182 20 S254 67 306 72" fill="none" stroke="currentColor" strokeWidth="3"/>
      <circle cx={[12,75,151,279][stage]} cy={[74,43,13,66][stage]} r="6" fill="currentColor" />
    </svg><label className={styles.slider}>Stage <input type="range" min="0" max="3" value={stage} onChange={e => setStage(Number(e.target.value))} /></label>
    <p aria-live="polite"><strong>{phases[stage][0]}.</strong> {phases[stage][1]}</p></section>;
}
const comparisons = {
  delivery: { title:'Compare delivery methods', rows: [
    ['MDI','A long-acting or intermediate insulin covers background needs, with separate injections for meals. The written plan identifies each preparation.'],
    ['Pump','A pump generally uses rapid-acting insulin in small ongoing amounts and boluses. A delivery interruption needs a prompt backup plan.'],
  ]},
  monitoring: { title:'Compare device roles', rows:[
    ['Fingerstick','One blood sample gives a spot reading. A meter does not continuously observe the hours between tests.'],
    ['CGM','A wearable sensor estimates tissue glucose over time. It can display direction and alerts but does not deliver insulin.'],
    ['AID','The sensor, control algorithm and pump exchange information to adjust insulin delivery. User tasks depend on the system.'],
  ]},
  regulation: { title:'Follow a hormone signal', rows:[
    ['After food','Beta cells normally respond to rising glucose with insulin. Insulin promotes uptake and storage and restrains liver output.'],
    ['When glucose falls','Alpha cells release glucagon, signalling the liver to release glucose. This protective response can be impaired in T1D.'],
    ['During stress','Adrenaline can increase liver glucose release. Stress and activity can produce different net effects in different situations.'],
  ]},
  storage: { title:'Check the storage situation', rows:[
    ['Unopened','Check the carton. Many unopened insulins require refrigeration at 2–8°C, away from freezing surfaces.'],
    ['In use','Check the exact pen or vial leaflet for temperature limit and time after opening. Write down the opening date.'],
    ['Heat or freezing','Ask a pharmacist about temperature exposure. Do not use insulin that has frozen or assume appearance proves effectiveness.'],
  ]},
  training: { title:'Compare activity and recovery', rows:[
    ['Steady movement','Working muscles may use glucose faster during sustained aerobic activity. Recent bolus insulin can increase the risk of a fall.'],
    ['Intense effort','Stress hormones can briefly raise glucose during a sprint or hard set. A rise is possible, not guaranteed.'],
    ['Recovery','Sensitivity and muscle refuelling may continue for hours. A late session can affect glucose during sleep.'],
  ]},
  arrows: { title:'Try a trend arrow', rows:[
    ['↗ Rising','In this fictional trace, glucose moved from 100 to 125 mg/dL over 15 minutes. The arrow summarises recent movement.'],
    ['→ Steady','In this fictional trace, three readings stayed near 120 mg/dL. A steady arrow does not guarantee glucose will remain there.'],
    ['↘ Falling','In this fictional trace, glucose moved from 140 to 110 mg/dL over 15 minutes. Check the thresholds for the specific sensor.'],
  ]},
};
function Compare({ kind }: { kind: keyof typeof comparisons }) {
  const [index,setIndex] = useState(0);
  const {title,rows} = comparisons[kind];
  return <section className={styles.lab}><h2>{title}</h2><div className={styles.choices}>{rows.map(([name],i) =>
    <button key={name} aria-pressed={i === index} onClick={() => setIndex(i)}>{name}</button>)}</div>
    {kind === 'regulation' && <ol className={styles.flow} aria-label="Sequence of signals">
      {[
        ['Rising glucose', 'Beta cells release insulin', 'Tissues take up glucose'],
        ['Falling glucose', 'Alpha cells release glucagon', 'Liver releases glucose'],
        ['Stress signal', 'Adrenaline increases', 'Liver can release glucose'],
      ][index].map((label, i) => <li key={label}>{i > 0 && <span aria-hidden="true">→ </span>}{label}</li>)}
    </ol>}
    {(kind === 'training' || kind === 'arrows') && <DirectionPlot kind={kind} index={index} />}
    <p aria-live="polite">{rows[index][1]}</p></section>;
}
const trendExamples = [
  [100, 107, 115, 125], [119, 120, 121, 120], [140, 132, 120, 110],
];
const activityExamples = [
  [145, 139, 132, 120], [118, 126, 138, 150], [134, 125, 112, 96],
];
function DirectionPlot({ kind, index }: { kind: 'training' | 'arrows'; index: number }) {
  const exercise = kind === 'training';
  const values = (exercise ? activityExamples : trendExamples)[index];
  const labels = exercise ? ['Start', 'Later'] : ['0 min', '15 min'];
  return <figure><figcaption className={styles.meta}>Illustrative glucose readings · mg/dL</figcaption>
    <svg className={styles.timeline} viewBox="0 0 320 98" role="img"
      aria-label={labels.join(' to ') + ': ' + values.join(', ') + ' mg/dL'}>
      <polyline points={values.map((v, i) => (30 + 85 * i) + ',' + (175 - v)).join(' ')} fill="none" stroke="currentColor" strokeWidth="2" />
      {values.map((v, i) => <g key={i}><circle cx={30 + 85 * i} cy={175 - v} r="3" fill="currentColor" />
        <text x={30 + 85 * i} y={167 - v} textAnchor="middle" fill="currentColor" fontSize="12">{v}</text></g>)}
      <text x="12" y="95" fill="currentColor" fontSize="12">{labels[0]}</text>
      <text x="300" y="95" textAnchor="end" fill="currentColor" fontSize="12">{labels[1]}</text>
    </svg></figure>;
}
function Checklist() {
  return <section className={styles.lab}><h2>Before an activity</h2><p>Practise checking your kit. These ticks last only while this lesson is open.</p>
    {['I can reach my monitoring supplies and backup meter.','Fast carbohydrate and my agreed rescue supplies are accessible.',
      'My companion knows how to get help.','I have a recovery and overnight plan if needed.'].map(label =>
      <label key={label} className={styles.check}><input type="checkbox" />{label}</label>)}</section>;
}
function Rotation() {
  const [area,setArea] = useState(0);
  return <section className={styles.lab}><h2>Explore site rotation</h2>
    <a href={sources.sites.url}>See the clinical illustration of injection sites (NHS leaflet, page 5)</a>
    <p>This grid represents a sequence within an area already approved by your educator. It does not show anatomical sites or injection depth.</p>
    <div className={styles.rotation}>{['A','B','C','D'].map((name,i) => <button key={name} aria-pressed={area === i} onClick={() => setArea(i)}>Area {name}</button>)}</div>
    <p aria-live="polite">Example area {String.fromCharCode(65+area)}. Follow the spacing and rotation pattern your clinician demonstrates.</p></section>;
}
const quizzes: Record<string,[string,string[],number,string]> = {
  'hypoglycemia-unawareness': ['Can a low occur without the usual shaking or sweating?', ['Yes','No'],0,'Early warnings can diminish. Discuss repeated or unnoticed lows with your diabetes team.'],
  'insulin-to-carbohydrate-ratio-icr': ['What does an example 1:10 ratio express?', ['Ten units per gram','Ten grams per unit'],1,'The denominator here is grams of carbohydrate covered by one unit.'],
  'insulin-on-board-iob': ['What is insulin stacking?', ['Overlapping effects of repeated doses','Storing spare pens together'],0,'Earlier doses can still be active when another dose begins to act.'],
  'trend-arrows': ['What does a trend arrow describe?', ['A guaranteed future value','Recent direction and rate'],1,'It summarises recent measurements. It cannot guarantee the next reading.'],
};
export function KnowledgeQuiz({ id }: { id: string }) {
  const [choice,setChoice] = useState<number | null>(null);
  const quiz = quizzes[id];
  if (!quiz) return null;
  const [question,answers,correct,explanation] = quiz;
  return <section className={styles.lab}><h2>Check your understanding</h2><p>{question}</p>
    <div className={styles.choices}>{answers.map((label,i) => <button key={label} aria-pressed={choice===i} onClick={() => setChoice(i)}>{label}</button>)}</div>
    {choice !== null && <p role="status">{choice === correct ? 'Yes.' : 'Try again.'} {explanation}</p>}</section>;
}
function UnitExample() {
  const [unit, setUnit] = useState<GlucoseUnit>('mg/dL');
  const [value, setValue] = useState('90');
  const number = Number(value);
  const otherUnit = unit === 'mg/dL' ? 'mmol/L' : 'mg/dL';
  const result = number > 0 && Number.isFinite(number)
    ? convertGlucose(unit === 'mg/dL' ? number : parseGlucoseInput(number, unit), otherUnit)
    : null;
  return <section className={styles.lab}><h2>One concentration, two units</h2>
    <div className={styles.labControls}><label>Example value<input type="number" min="0" step="any" value={value} onChange={event => setValue(event.target.value)} /></label>
      <label>Starting unit<select value={unit} onChange={event => {
        setValue(result ?? ''); setUnit(event.target.value as GlucoseUnit);
      }}><option>mg/dL</option><option>mmol/L</option></select></label></div>
    <output aria-live="polite">{result === null ? 'Enter a positive example value.' : result + ' ' + otherUnit}</output>
  </section>;
}
export default function LearningActivity({topic}: {topic: Topic}) {
  const id = topic.id;
  if (id === 'interstitial-versus-blood-glucose') return <UnitExample />;
  if (patterns[id] || id === 'ambulatory-glucose-profile-agp') return <PatternLab initial={patterns[id]} agp={id === 'ambulatory-glucose-profile-agp'} />;
  if (id === 'insulin-to-carbohydrate-ratio-icr' || id === 'insulin-sensitivity-factor-isf') return <Walkthrough correction={id === 'insulin-sensitivity-factor-isf'} />;
  if (['insulin-on-board-iob','types-of-insulin','rage-bolusing'].includes(id)) return <ActionTimeline />;
  if (['carbohydrate-counting','portion-estimation','restaurant-and-street-food-estimates','reading-food-labels-in-india'].includes(id)) return <FoodLab />;
  if (['injection-sites','site-rotation'].includes(id)) return <Rotation />;
  if (['insulin-storage-and-temperature','hot-weather','cold-weather'].includes(id)) return <Compare kind="storage" />;
  if (['basal-bolus-insulin-therapy','multiple-daily-injections-mdi','insulin-pump-delivery'].includes(id)) return <Compare kind="delivery" />;
  if (['fingerstick-confirmation','automated-insulin-delivery-aid'].includes(id)) return <Compare kind="monitoring" />;
  if (id === 'trend-arrows') return <Compare kind="arrows" />;
  if (id === 'glucagon-and-counter-regulatory-hormones' || id === 'pancreatic-alpha-and-beta-cells') return <Compare kind="regulation" />;
  if (['aerobic-versus-anaerobic-activity','strength-training','high-intensity-exercise'].includes(id)) return <Compare kind="training" />;
  if (id === 'sports-safety-preparation' || id === 'trekking-and-endurance') return <Checklist />;
  if (id === 'diabetes-distress' || id === 'diabetes-burnout') return <section className={styles.lab}><h2>A moment to reflect</h2>
    <label>What feels hardest today, and who could help with one part?<textarea rows={3} autoComplete="off" /></label>
    <p className={styles.meta}>Optional private scratchpad. The app discards this text when you leave the lesson.</p></section>;
  return null;
}
