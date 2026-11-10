'use client';

import { featureCopy as copy } from '@/data/featureCopy';
import { loadFoodPreview } from '@/lib/featurePreviews';
import type { IndianFoodItem } from '@/types';
import { usePreview, type PreviewLoader } from './usePreview';
import PreviewMessage from './PreviewMessage';
import styles from '../FeatureSection.module.css';

export default function FoodPreview({ load = loadFoodPreview }: { load?: PreviewLoader<IndianFoodItem> }) {
  const state = usePreview(load);
  if (state.status !== 'data') return <PreviewMessage status={state.status} empty={copy.foodEmpty} />;
  const food = state.data;
  const names = [food.hindiName, ...(food.regionalName?.split(' / ') ?? [])].filter(Boolean);
  return <div className={styles.foodPreview}>
    <p className={styles.previewMeta}>{copy.foodLabel}</p><h3>{food.name}</h3><p className={styles.portion}>{food.servingDescription}</p>
    <dl className={styles.nutrients}>
      <div><dt>{copy.carbs}</dt><dd>{food.carbsGrams}{copy.grams}</dd></div>
      {food.proteinGrams !== undefined && <div><dt>{copy.protein}</dt><dd>{food.proteinGrams}{copy.grams}</dd></div>}
      {food.fiberGrams !== undefined && <div><dt>{copy.fiber}</dt><dd>{food.fiberGrams}{copy.grams}</dd></div>}
    </dl>
    {names.length > 0 && <ul className={styles.languageChips} aria-label={copy.languages}>{names.map(name => <li key={name}>{name}</li>)}</ul>}
  </div>;
}
