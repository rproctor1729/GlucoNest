'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import InsulinBasics from './InsulinBasics';
import InsulinCompare from './InsulinCompare';
import InsulinCard from './InsulinCard';
import { ACTION_CLASS_LABELS, countries, filterInsulins, insulins, uniqueValues, type ActionClass, type InsulinCategory, type InsulinFilters } from '@/lib/insulinExplorer';
import styles from './InsulinExplorer.module.css';

type Tab = 'all' | InsulinCategory | 'compare' | 'basics';
const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All insulins' },
  { id: 'bolus', label: 'Bolus insulins' },
  { id: 'basal', label: 'Basal insulins' },
  { id: 'premixed', label: 'Premixed insulins' },
  { id: 'compare', label: 'Compare insulins' },
  { id: 'basics', label: 'Insulin basics' },
];
const EMPTY_FILTERS: InsulinFilters = { query: '', category: '', actionClass: '', concentration: '', deliveryMethod: '', country: '' };

// Pen illustration. Decorative; the page text carries the meaning.
function PenIllustration() {
  return (
    <svg className={styles.pen} viewBox="0 0 220 180" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="pen-body" x1="0" x2="1">
          <stop offset="0" stopColor="#5eead4" /><stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect x="40" y="46" width="120" height="30" rx="8" fill="url(#pen-body)" opacity="0.92" />
      <rect x="40" y="82" width="120" height="22" rx="6" fill="#ffffff" opacity="0.7" />
      <rect x="160" y="50" width="30" height="22" rx="6" fill="#4338ca" opacity="0.85" />
      <rect x="24" y="36" width="20" height="50" rx="5" fill="#a5b4fc" opacity="0.8" />
      <rect x="40" y="104" width="120" height="8" rx="3" fill="#1f2440" opacity="0.5" />
      <rect x="150" y="32" width="6" height="16" fill="#1f2440" opacity="0.6" />
    </svg>
  );
}

export default function InsulinExplorer() {
  const [tab, setTab] = useState<Tab>('all');
  const [filters, setFilters] = useState<InsulinFilters>(EMPTY_FILTERS);
  const concentrations = useMemo(() => uniqueValues(record => [record.concentration]), []);
  const deliveries = useMemo(() => uniqueValues(record => record.deliveryMethods), []);
  const countryOptions = useMemo(() => countries(), []);
  const categoryFilter: InsulinCategory | '' = tab === 'bolus' || tab === 'basal' || tab === 'premixed' ? tab : '';
  const results = useMemo(() => filterInsulins({ ...filters, category: categoryFilter }), [filters, categoryFilter]);
  const listing = tab === 'all' || tab === 'bolus' || tab === 'basal' || tab === 'premixed';
  const set = (key: keyof InsulinFilters) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters(previous => ({ ...previous, [key]: event.target.value }));
  const filtersActive = Object.values(filters).some(Boolean);

  return (
    <div className={styles.explorer}>
      <header className={styles.hero}>
        <div>
          <p className="section-kicker">INSULIN EXPLORER</p>
          <h1 tabIndex={-1}>Insulin Explorer – Know Your Insulin</h1>
          <p className={styles.lede}>
            From mealtime bolus to background basal, discover how different insulins work and what makes them unique.
            This is education only. GlucoNest does not recommend doses, substitutions or switches.
          </p>
        </div>
        <PenIllustration />
      </header>

      <nav aria-label="Insulin categories">
        <ul className={styles.nav}>
          {TABS.map(item => (
            <li key={item.id}>
              <button type="button" className={styles.tab} aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <p className={styles.notice}>
        Medical education only. Insulin switching and dose changes need guidance from a qualified healthcare professional.
        Indian availability is not verified for any product yet, so every brand is marked “availability unverified”.
      </p>

      {tab === 'premixed' && (
        <p className={styles.notice}>
          Premixed insulins contain fixed combinations of insulin components. They are not simply another basal or bolus
          category. A co-formulation, such as degludec with aspart, is a different kind of combined product.
        </p>
      )}

      {tab === 'compare' && <InsulinCompare />}
      {tab === 'basics' && <InsulinBasics />}

      {listing && <>
        <section className={styles.controls} aria-label="Search and filter insulins">
          <label className={styles.field}>
            <span>Search brand, ingredient, category or concentration</span>
            <input type="search" value={filters.query} onChange={set('query')} placeholder="e.g. Tresiba, glargine, U-300" />
          </label>
          <label className={styles.field}>
            <span>Action</span>
            <select value={filters.actionClass} onChange={set('actionClass')}>
              <option value="">Any action</option>
              {(Object.keys(ACTION_CLASS_LABELS) as ActionClass[]).map(value => <option key={value} value={value}>{ACTION_CLASS_LABELS[value]}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>Concentration</span>
            <select value={filters.concentration} onChange={set('concentration')}>
              <option value="">Any concentration</option>
              {concentrations.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>Delivery method</span>
            <select value={filters.deliveryMethod} onChange={set('deliveryMethod')}>
              <option value="">Any delivery</option>
              {deliveries.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>Verified availability</span>
            <select value={filters.country} onChange={set('country')}>
              <option value="">Any country</option>
              {countryOptions.map(value => <option key={value} value={value}>Verified available in {value}</option>)}
            </select>
          </label>
          <button type="button" className={styles.button} onClick={() => setFilters(EMPTY_FILTERS)} disabled={!filtersActive}>
            Reset filters
          </button>
        </section>

        <p role="status" aria-live="polite">
          Showing {results.length} of {insulins.filter(record => !categoryFilter || record.category === categoryFilter).length} products.
        </p>

        {results.length ? (
          <ul className={styles.grid}>
            {results.map(record => <InsulinCard key={record.id} record={record} />)}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>
              {filters.country
                ? `No product in this explorer has verified availability in ${filters.country} yet. Availability is pending review.`
                : 'No products match these filters. Try a different word, or reset the filters.'}
            </p>
          </div>
        )}
      </>}

      <section className={styles.section} aria-labelledby="sources-heading">
        <h2 id="sources-heading">Sources and review</h2>
        <p>
          Product facts come from the US FDA prescribing information versions linked on each product page. Those label
          versions may not be the latest. Indian availability, regional brands and pricing are not included until a
          dated official source confirms them. Records marked “Pending review” have not been source-checked.
        </p>
      </section>
    </div>
  );
}
