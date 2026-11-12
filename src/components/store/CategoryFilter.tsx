'use client';

import { LayoutGrid } from 'lucide-react';
import { storeCategories } from '@/data/store/productsData';
import type { StoreCategoryId } from '@/types/store';
import { categoryIcons } from './productIcons';
import styles from '../catalog/Catalog.module.css';

interface Props {
  value: StoreCategoryId | 'all';
  onChange: (value: StoreCategoryId | 'all') => void;
}

export default function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className={styles.pillRow} role="group" aria-label="Filter products by category">
      <button type="button" className={styles.pill} aria-pressed={value === 'all'} onClick={() => onChange('all')}>
        <LayoutGrid size={16} aria-hidden="true" /> All
      </button>
      {storeCategories.map(category => {
        const Icon = categoryIcons[category.id];
        return (
          <button key={category.id} type="button" className={styles.pill} aria-pressed={value === category.id} onClick={() => onChange(category.id)}>
            <Icon size={16} aria-hidden="true" /> {category.label}
          </button>
        );
      })}
    </div>
  );
}
