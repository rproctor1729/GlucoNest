'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, Minus, Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { MealLogEntry } from '@/types';
import styles from './FoodLibrary.module.css';

export default function MealPlate({ onSave }: { onSave: (persisted: boolean) => void }) {
  const { mealPlate, updateMealPlateItem, removeFromMealPlate, clearMealPlate, addMealLog } = useApp();
  const [mealType, setMealType] = useState<MealLogEntry['mealType']>('snack');
  const [expanded, setExpanded] = useState(false);
  const total = mealPlate.reduce((sum, item) => sum + item.totalCarbs, 0);
  const count = mealPlate.length;
  function save() {
    if (!count) return;
    const name = count === 1 ? mealPlate[0].name : `${mealPlate[0].name} + ${count - 1} item${count > 2 ? 's' : ''}`;
    const persisted = addMealLog({
      timestamp: new Date().toISOString(), mealType, name, items: mealPlate, totalCarbs: total,
      notes: 'Logged from Indian Food Library Plate Builder', isDemo: false,
    });
    // addMealLog retains the session entry even when browser persistence fails.
    clearMealPlate();
    setExpanded(false);
    onSave(persisted);
  }

  return <aside className={styles.plate} aria-label="Your plate">
    <div className={styles.platePhoto}><Image src="/images/indian-meal.webp" fill sizes="(max-width: 1000px) 56px, 320px" alt="" /></div>
    <div className={styles.plateHeader}>
      <h2>Your plate</h2>
      <button type="button" className={styles.plateToggle} aria-expanded={expanded} aria-controls="plate-content" onClick={() => setExpanded(!expanded)}>
        <span>Your plate</span><small>{count ? `${count} food${count === 1 ? '' : 's'} · ${total} g carbs` : 'Empty'}</small><ChevronDown size={17} />
      </button>
    </div>
    <div id="plate-content" className={styles.plateContent} data-expanded={expanded}>
      {!count ? <p className={styles.hint}>Choose a dish and set your portion to start a meal.</p> : <>
        <ul className={styles.plateItems}>{mealPlate.map(item => <li key={item.foodId}>
          <div><strong>{item.name.split(' (')[0]}</strong><span>{item.totalCarbs} g</span></div>
          <div><div className={styles.stepper}>
            <button type="button" aria-label={`Decrease servings of ${item.name}`} onClick={() => updateMealPlateItem(item.foodId, item.servings - 0.5)}><Minus size={14} /></button>
            <span>{item.servings}×</span>
            <button type="button" aria-label={`Increase servings of ${item.name}`} onClick={() => updateMealPlateItem(item.foodId, item.servings + 0.5)}><Plus size={14} /></button>
          </div><button type="button" className={styles.iconButton} aria-label={`Remove ${item.name}`} onClick={() => removeFromMealPlate(item.foodId)}><Trash2 size={15} /></button></div>
        </li>)}</ul>
        <label className={styles.field}>Meal type
          <select value={mealType} onChange={event => setMealType(event.target.value as MealLogEntry['mealType'])}>
            <option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option>
          </select>
        </label>
        <div className={styles.total}><span>Estimated carbs</span><strong>{total} g</strong></div>
        <button type="button" className={styles.primary} onClick={save}>Save meal to Quick Log</button>
        <button type="button" className={styles.clear} onClick={clearMealPlate}>Clear plate</button>
      </>}
    </div>
  </aside>;
}
