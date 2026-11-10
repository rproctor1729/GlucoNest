'use client';

import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalFocus } from '@/components/common/useModalFocus';
import { useApp } from '@/context/AppContext';
import type { IndianFoodItem } from '@/types';
import styles from './FoodLibrary.module.css';

interface Props {
  food: IndianFoodItem;
  onClose: () => void;
  onAdded: () => void;
}

export default function FoodPortionDialog({ food, onClose, onAdded }: Props) {
  const { addToMealPlate } = useApp();
  const [quantity, setQuantity] = useState('1');
  const ref = useModalFocus(true, onClose);
  const servings = Number(quantity);
  const valid = Number.isFinite(servings) && servings >= 0.25 && servings <= 20;
  const carbs = Math.round(servings * food.carbsGrams);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    addToMealPlate({
      foodId: food.id, name: food.name, servings, servingDescription: food.servingDescription,
      carbsPerServing: food.carbsGrams, totalCarbs: carbs,
    });
    onAdded();
  }

  return createPortal(
    <div className={styles.overlay}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="dish-title" tabIndex={-1} className={styles.dialog}>
        <header><h2 id="dish-title">{food.name}</h2>
          <button type="button" className={styles.iconButton} aria-label="Close food details" onClick={onClose}><X size={20} /></button>
        </header>
        <p className={styles.alternates}>{[food.hindiName, food.regionalName].filter(Boolean).join(' · ')}</p>
        <p className={styles.portion}>{food.servingDescription} · {food.carbsGrams} g carbs per serving</p>
        <form onSubmit={submit}>
          <label className={styles.field}>Servings
            <input type="number" min="0.25" max="20" step="any" value={quantity} onChange={event => setQuantity(event.target.value)} required />
          </label>
          <div className={styles.presets} aria-label="Serving shortcuts" role="group">
            {[0.5, 1, 1.5, 2].map(q => <button type="button" key={q} aria-pressed={q === servings} onClick={() => setQuantity(String(q))}>{q}×</button>)}
          </div>
          <details className={styles.reference}>
            <summary>Nutrition &amp; source</summary>
            <dl className={styles.nutrients}>
              {Object.entries({Protein: food.proteinGrams, Fat: food.fatGrams, Fibre: food.fiberGrams}).map(([label, value]) =>
                <div key={label}><dt>{label} per serving</dt><dd>{value == null ? 'Unavailable' : `${value} g`}</dd></div>
              )}
            </dl>
            {food.t1dTip && <p>{food.t1dTip}</p>}
            <p>Source: {food.sourceOrVerification}</p>
          </details>
          <div className={styles.total}><span>Estimated carbs</span><output aria-live="polite">{valid ? `${carbs} g` : '—'}</output></div>
          {!valid && <p className={styles.hint}>Enter 0.25 to 20 servings.</p>}
          <button type="submit" className={styles.primary} disabled={!valid}>Add to plate</button>
        </form>
      </div>
    </div>, document.body
  );
}
