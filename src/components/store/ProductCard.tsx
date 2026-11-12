'use client';

import { ExternalLink } from 'lucide-react';
import type { StoreProduct } from '@/types/store';
import { buyLinkFor } from '@/utils/catalogFilters';
import { categoryIcons, fallbackIcon } from './productIcons';
import styles from '../catalog/Catalog.module.css';

interface Props {
  product: StoreProduct;
  categoryLabel: string;
  onView: (product: StoreProduct) => void;
}

export default function ProductCard({ product, categoryLabel, onView }: Props) {
  const Icon = categoryIcons[product.category] ?? fallbackIcon;
  return (
    <article className={styles.card}>
      <div className={styles.media} aria-hidden="true"><Icon size={44} strokeWidth={1.5} /></div>
      <span className={styles.chip}>{categoryLabel}</span>
      <h3 className={styles.cardTitle}>{product.name}</h3>
      <p className={styles.meta}>Brand: {product.brand}</p>
      <p className={styles.description}>{product.description}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => onView(product)}>View Details</button>
        <a className={`${styles.button} ${styles.primary}`} href={buyLinkFor(product)} target="_blank" rel="noopener noreferrer">
          Where to Buy <ExternalLink size={15} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
