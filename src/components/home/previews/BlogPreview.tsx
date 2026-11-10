'use client';

import { BookOpen, Clock } from 'lucide-react';
import { featureCopy as copy } from '@/data/featureCopy';
import { loadBlogPreview } from '@/lib/featurePreviews';
import type { EducationalGuide } from '@/types';
import { usePreview, type PreviewLoader } from './usePreview';
import PreviewMessage from './PreviewMessage';
import styles from '../FeatureSection.module.css';

export default function BlogPreview({ load = loadBlogPreview }: { load?: PreviewLoader<EducationalGuide> }) {
  const state = usePreview(load);
  if (state.status !== 'data') return <PreviewMessage status={state.status} empty={copy.blogEmpty} />;
  const guide = state.data;
  return <div className={styles.blogPreview}>
    <div className={styles.bookArtwork} aria-hidden="true"><BookOpen size={72} strokeWidth={1} /><span /><span /></div>
    <div><p className={styles.previewMeta}>{copy.blogLabel}</p><h3 className={styles.postTitle}>{guide.title}</h3>
      <p className={styles.postMeta}><span>{guide.category}</span><span><Clock size={14} aria-hidden="true" />{guide.readTime}</span></p>
    </div>
  </div>;
}
