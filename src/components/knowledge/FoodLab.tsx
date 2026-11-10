'use client';

import { useState } from 'react';
import { indianFoodDatabase } from '@/data/indianFoods';
import { CARBOHYDRATE_DISCLAIMER } from '@/data/disclaimers';
import styles from './KnowledgeHub.module.css';

export default function FoodLab() {
  const [first, setFirst] = useState(indianFoodDatabase[0].id);
  const [second, setSecond] = useState('');
  const [portion, setPortion] = useState('1');
  const [secondPortion, setSecondPortion] = useState('1');
  const foods = [first, second].map(id => indianFoodDatabase.find(food => food.id === id));
  const amounts = [Number(portion), Number(secondPortion)];
  const valid = (i: number) => Number.isFinite(amounts[i]) && amounts[i] >= .25 && amounts[i] <= 20;
  const validMeal = foods.every((food,i) => !food || valid(i));
  return <section className={styles.lab}><h2>Compare portions</h2>
    <p>Choose foods from the existing Indian Food Library. Values are recipe estimates derived from its entries, not measurements of your meal.</p>
    <div className={styles.foodCompare}>{foods.map((food,i) => <div key={i}>
      <label>{i === 0 ? 'First food' : 'Second food (optional)'}<select value={i ? second : first} onChange={e => (i ? setSecond : setFirst)(e.target.value)}>
        {i === 1 && <option value="">None</option>}{indianFoodDatabase.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
      {food && <><p>{food.servingDescription}</p>
        <label>Servings <input type="number" min=".25" max="20" step="any" value={i ? secondPortion : portion} onChange={e => (i ? setSecondPortion : setPortion)(e.target.value)} /></label>
        {valid(i) ? <dl>{Object.entries({Weight:food.servingWeightGrams, Carbohydrate:food.carbsGrams, Fibre:food.fiberGrams, Protein:food.proteinGrams, Fat:food.fatGrams}).map(([name,value]) =>
          <div key={name}><dt>{name}</dt><dd>{value === undefined ? 'Unavailable' : Number((value*amounts[i]).toFixed(1)) + ' g'}</dd></div>)}</dl> : <p>Enter between 0.25 and 20 servings.</p>}
        <small>Library source: {food.sourceOrVerification}</small></>}
    </div>)}</div>
    <p aria-live="polite"><strong>Estimated meal carbohydrate · {validMeal ? Number(foods.reduce((sum,f,i) => sum + (f ? f.carbsGrams*amounts[i] : 0),0).toFixed(1))+' g' : '—'}</strong></p>
    <p>{CARBOHYDRATE_DISCLAIMER}</p><a href="#food-library">Search the full food library and build a plate</a>
  </section>;
}
