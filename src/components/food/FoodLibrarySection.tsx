'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { indianFoodDatabase } from '@/data/indianFoods';
import { CARBOHYDRATE_DISCLAIMER } from '@/data/disclaimers';
import { useApp } from '@/context/AppContext';
import type { IndianFoodItem } from '@/types';
import FoodPortionDialog from './FoodPortionDialog';
import MealPlate from './MealPlate';
import styles from './FoodLibrary.module.css';

const categories = Array.from(new Set(indianFoodDatabase.map(food => food.category)));
const pageSize = 6;

export default function FoodLibrarySection() {
  const { setActiveSection } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<IndianFoodItem | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [saveResult, setSaveResult] = useState<'saved' | 'session' | null>(null);
  const search = query.trim().normalize().toLowerCase();
  const results = indianFoodDatabase.filter(food =>
    (!category || food.category === category) &&
    [food.name, food.hindiName, food.regionalName, food.servingDescription].some(value =>
      value?.normalize().toLowerCase().includes(search)
    )
  );
  const start = page * pageSize;
  const visible = results.slice(start, start + pageSize);

  return (
    <section className={styles.library} aria-labelledby="food-title">
      <h1 id="food-title" className={styles.title}>Food library</h1>
      <MealPlate onSave={persisted => {
        setSaveResult(persisted ? 'saved' : 'session');
        setAnnouncement('');
      }} />
      <div className={styles.catalogue}>
        {saveResult && <div role="status" className={styles.notice}>
          {saveResult === 'saved' ? 'Meal saved.' : 'Meal is only in this session. Export a backup before leaving.'}
          <button type="button" className={styles.link} onClick={() => setActiveSection(saveResult === 'saved' ? 'quick-log' : 'devices')}>
            {saveResult === 'saved' ? 'View in Quick Log' : 'Open Devices & Data'}
          </button>
        </div>}
        <div className={styles.filterContainer}>
          <div className={styles.filters}>
            <label className={styles.search}>
              <Search size={19} aria-hidden="true" />
              <input type="search" aria-label="Search Indian foods" placeholder="Search a dish or regional name"
                value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} />
            </label>
          </div>
          <div className={styles.categoryPills} role="radiogroup" aria-label="Filter foods by category">
            <button
              type="button"
              role="radio"
              aria-checked={category === ''}
              className={`${styles.categoryPill} ${category === '' ? styles.categoryPillActive : ''}`}
              onClick={() => { setCategory(''); setPage(0); }}
            >
              All
            </button>
            {categories.map(item => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={category === item}
                className={`${styles.categoryPill} ${category === item ? styles.categoryPillActive : ''}`}
                onClick={() => { setCategory(item === category ? '' : item); setPage(0); }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.columns}><span>Dish &amp; serving</span><span>Est. carbs</span></div>
        <ul className={styles.menu}>
          {visible.map(food => (
            <li key={food.id}>
              <button type="button" className={styles.dish} aria-haspopup="dialog" onClick={() => setSelected(food)}>
                <span><strong>{food.name.split(' (')[0]}</strong><small>{food.servingDescription}</small></span>
                <span className={styles.amount}>{food.carbsGrams} g</span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        {!results.length && <div className={styles.empty}><p>No foods match your search.</p>
          <button type="button" className={styles.link} onClick={() => { setQuery(''); setCategory(''); setPage(0); }}>Show all foods</button>
        </div>}
        <div className={styles.pager}>
          <span role="status">{results.length ? `${start + 1}–${start + visible.length} of ${results.length} foods` : '0 foods'}</span>
          {results.length > pageSize && <nav aria-label="Food pages">
            <button type="button" aria-label="Previous foods" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Next foods" disabled={start + pageSize >= results.length} onClick={() => setPage(page + 1)}><ChevronRight size={18} /></button>
          </nav>}
        </div>
        <details className={styles.reference}>
          <summary>{CARBOHYDRATE_DISCLAIMER}</summary>
          <p>General reference estimates, not laboratory-verified or dietitian-reviewed values. Portions and recipes vary.</p>
        </details>
      </div>
      <span className="sr-only" role="status">{announcement}</span>
      {selected && <FoodPortionDialog food={selected} onClose={() => setSelected(null)} onAdded={() => {
        setAnnouncement(`${selected.name} added to your plate.`);
        setSaveResult(null);
        setSelected(null);
      }} />}
    </section>
  );
}
