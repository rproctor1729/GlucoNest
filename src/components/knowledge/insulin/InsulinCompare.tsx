'use client';

import { useState, type ReactNode } from 'react';
import ActionProfileChart from './ActionProfileChart';
import { CATEGORY_LABELS, PENDING, insulinById, insulins, valueOf, type InsulinRecord, type ProfileField } from '@/lib/insulinExplorer';
import styles from './InsulinExplorer.module.css';

const MAX_CURVES = 3;

function cell(field: ProfileField) {
  const text = valueOf(field);
  return text ?? <span className={styles['pending-text']}>{PENDING}</span>;
}

function brandsOf(record: InsulinRecord) {
  return record.brands.map(brand => brand.name).join(' · ');
}

export default function InsulinCompare() {
  const [leftId, setLeftId] = useState('insulin-glargine-u100');
  const [rightId, setRightId] = useState('insulin-degludec-u100');
  const [curveIds, setCurveIds] = useState<string[]>(['insulin-glargine-u100', 'insulin-degludec-u100']);
  const left = insulinById.get(leftId);
  const right = insulinById.get(rightId);

  const toggleCurve = (id: string) => setCurveIds(previous => {
    if (previous.includes(id)) return previous.filter(item => item !== id);
    return previous.length >= MAX_CURVES ? previous : [...previous, id];
  });

  const rows: { label: string; render: (record: InsulinRecord) => ReactNode }[] = [
    { label: 'Generic ingredient', render: record => record.genericName },
    { label: 'Brand', render: brandsOf },
    { label: 'Category', render: record => `${CATEGORY_LABELS[record.category]}, ${record.actionClass}` },
    { label: 'Concentration', render: record => record.concentration },
    { label: 'Onset', render: record => cell(record.onset) },
    { label: 'Peak', render: record => cell(record.peak) },
    { label: 'Duration', render: record => cell(record.duration) },
    { label: 'Delivery methods', render: record => record.deliveryMethods.length ? record.deliveryMethods.join(', ') : <span className={styles['pending-text']}>{PENDING}</span> },
    { label: 'Pump compatibility', render: record => cell(record.pumpCompatibility) },
    { label: 'Storage', render: record => cell(record.storage) },
    { label: 'Key formulation differences', render: record => cell(record.formulationDifferences) },
    { label: 'Safety notes', render: record => record.safetyNotes.length
      ? <ul>{record.safetyNotes.map(note => <li key={note}>{note}</li>)}</ul>
      : <span className={styles['pending-text']}>{PENDING}</span> },
  ];

  const picker = (label: string, value: string, onChange: (id: string) => void) => (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}>
        {insulins.map(record => (
          <option key={record.id} value={record.id}>{brandsOf(record)} · {record.concentration}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className={styles.section}>
      <h2>Compare two insulins</h2>
      <p className={styles.notice}>
        Factual differences only. This table does not recommend one insulin over another. Products with different
        concentrations are not interchangeable, so do not read unit numbers across them as equal.
      </p>

      <div className={styles.controls} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {picker('First insulin', leftId, setLeftId)}
        {picker('Second insulin', rightId, setRightId)}
      </div>

      {left && right && (
        <div className={styles.tableWrap}>
          <table className={styles.compare}>
            <caption className="sr-only">Side-by-side comparison of {brandsOf(left)} and {brandsOf(right)}</caption>
            <thead>
              <tr>
                <th scope="col">Factor</th>
                <th scope="col">{brandsOf(left)}</th>
                <th scope="col">{brandsOf(right)}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.render(left)}</td>
                  <td>{row.render(right)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.section}>
        <h2>Action-profile comparison</h2>
        <p>
          Choose up to {MAX_CURVES} products. Curves are conceptual shapes for each action class, shown on the same axes
          without dose normalisation.
        </p>
        <fieldset className={styles.controls} style={{ gridTemplateColumns: '1fr' }}>
          <legend className="sr-only">Products to show on the action-profile chart</legend>
          <div className={styles.badges}>
            {insulins.map(record => {
              const on = curveIds.includes(record.id);
              const full = !on && curveIds.length >= MAX_CURVES;
              return (
                <button key={record.id} type="button" className={styles.tab} aria-pressed={on} disabled={full}
                  onClick={() => toggleCurve(record.id)}>
                  {brandsOf(record)} · {record.concentration}
                </button>
              );
            })}
          </div>
          {curveIds.length >= MAX_CURVES && <small>Three products selected. Deselect one to add another.</small>}
        </fieldset>
        {curveIds.length > 0
          ? <ActionProfileChart records={curveIds.map(id => insulinById.get(id)).filter((item): item is InsulinRecord => Boolean(item))} />
          : <p className={styles.empty}>Select at least one product to show its conceptual curve.</p>}
      </div>
    </div>
  );
}
