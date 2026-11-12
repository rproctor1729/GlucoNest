'use client';

import { useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import { STORE_DISCLAIMER, categoryLabel, storeCategories, storeProducts } from '@/data/store/productsData';
import { filterProducts } from '@/utils/catalogFilters';
import type { StoreCategoryId, StoreProduct } from '@/types/store';
import CategoryFilter from './CategoryFilter';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import styles from '../catalog/Catalog.module.css';

export default function StoreSection() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<StoreCategoryId | 'all'>('all');
  const [selected, setSelected] = useState<StoreProduct | null>(null);

  const results = useMemo(
    () => filterProducts(storeProducts, categoryLabel, { query, category }),
    [query, category],
  );
  const filtersActive = query.trim() !== '' || category !== 'all';
  const featured = storeProducts.filter(product => product.featured);
  const labelOf = (id: StoreCategoryId) => storeCategories.find(c => c.id === id)?.label ?? id;

  function clearFilters() {
    setQuery('');
    setCategory('all');
  }

  return (
    <div className={styles.page}>
      <section className={styles.banner} aria-label="Introduction">
        <p>A curated showcase of useful everyday products for living with Type 1 diabetes. Explore here, then visit the seller’s website to buy.</p>
      </section>

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <Search size={19} aria-hidden="true" />
          <input type="search" aria-label="Search products by name or category" placeholder="Search by product or category"
            value={query} onChange={event => setQuery(event.target.value)} />
          {query && <button type="button" className={styles.iconButton} style={{ width: 34, height: 34 }} aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}
        </label>
        <CategoryFilter value={category} onChange={setCategory} />
        {filtersActive && (
          <div className={styles.selectRow}>
            <span className={styles.resultCount} aria-live="polite">{results.length} {results.length === 1 ? 'product' : 'products'} shown</span>
            <button type="button" className={styles.linkButton} onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </div>

      {!filtersActive && (
        <section aria-labelledby="featured-title" style={{ display: 'grid', gap: 12 }}>
          <h2 id="featured-title" className={styles.sectionTitle}>Featured essentials</h2>
          <div className={styles.grid}>
            {featured.map(product => (
              <ProductCard key={product.id} product={product} categoryLabel={labelOf(product.category)} onView={setSelected} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="all-title" style={{ display: 'grid', gap: 12 }}>
        <h2 id="all-title" className={styles.sectionTitle}>{filtersActive ? 'Matching products' : 'All essentials'}</h2>
        {results.length ? (
          <div className={styles.grid}>
            {results.map(product => (
              <ProductCard key={product.id} product={product} categoryLabel={labelOf(product.category)} onView={setSelected} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <SearchX size={36} aria-hidden="true" />
            <h2>No products match that search</h2>
            <p>Try a shorter word, a different category, or clear the filters to see everything.</p>
            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>

      <p className={styles.disclaimer}>{STORE_DISCLAIMER}</p>

      {selected && (
        <ProductDetailModal product={selected} categoryLabel={labelOf(selected.category)} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
