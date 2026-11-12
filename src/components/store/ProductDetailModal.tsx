'use client';

import { createPortal } from 'react-dom';
import { ExternalLink, X } from 'lucide-react';
import { useModalFocus } from '@/components/common/useModalFocus';
import type { StoreProduct } from '@/types/store';
import { buyLinkFor } from '@/utils/catalogFilters';
import { categoryIcons, fallbackIcon } from './productIcons';
import styles from '../catalog/Catalog.module.css';

interface Props {
  product: StoreProduct;
  categoryLabel: string;
  onClose: () => void;
}

export default function ProductDetailModal({ product, categoryLabel, onClose }: Props) {
  const ref = useModalFocus(true, onClose);
  const Icon = categoryIcons[product.category] ?? fallbackIcon;
  return createPortal(
    <div className={styles.overlay} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" tabIndex={-1} className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <div>
            <span className={styles.chip}>{categoryLabel}</span>
            <h2 id="product-dialog-title" className={styles.dialogTitle} style={{ marginTop: 8 }}>{product.name}</h2>
            <p className={styles.meta}>Brand: {product.brand}</p>
          </div>
          <button type="button" className={styles.iconButton} aria-label="Close product details" onClick={onClose}><X size={20} /></button>
        </div>
        <div className={styles.media} style={{ marginTop: 16 }} aria-hidden="true"><Icon size={56} strokeWidth={1.5} /></div>
        <p>{product.description}</p>
        <h3>Key features</h3>
        <ul>{product.keyFeatures.map(item => <li key={item}>{item}</li>)}</ul>
        <h3>Common use cases</h3>
        <ul>{product.useCases.map(item => <li key={item}>{item}</li>)}</ul>
        <h3>Important limitations and compatibility</h3>
        <ul>{product.limitations.map(item => <li key={item}>{item}</li>)}</ul>
        <div className={styles.dialogFooter}>
          <a className={`${styles.button} ${styles.primary}`} href={buyLinkFor(product)} target="_blank" rel="noopener noreferrer">
            Where to Buy <ExternalLink size={15} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button type="button" className={styles.button} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
