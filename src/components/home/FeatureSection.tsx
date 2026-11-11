'use client';

import Image from 'next/image';
import { type MouseEvent } from 'react';
import { ArrowUpRight, Utensils } from 'lucide-react';
import { features } from '@/data/features';
import { featureCopy } from '@/data/featureCopy';
import { CARBOHYDRATE_DISCLAIMER } from '@/data/disclaimers';
import { sectionFromHash } from '@/lib/navigation';
import type { NavigationSection } from '@/types';
import styles from './FeatureSection.module.css';

export default function FeatureSection({ onNavigate }: { onNavigate: (section: NavigationSection) => void }) {
  const navigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || href.includes('/')) return;
    const section = sectionFromHash(href);
    if (section) { event.preventDefault(); onNavigate(section); }
  };
  return <section id="discover" className={styles.features} aria-label={featureCopy.sectionLabel}>
    {features.map(({ id, title, description, href, icon: Icon, cta, PreviewComponent }) => {
      const food = id === 'food';
      return <a key={id} href={href} className={`${styles.card} ${food ? styles.foodCard : ''}`} onClick={event => navigate(event, href)}>
        {food && <div className={styles.foodImage}>
          <Image src="/images/indian-meal.webp" width={1254} height={1254} sizes="(max-width: 767px) 92vw, (max-width: 1440px) 46vw, 662px" loading="lazy" alt={featureCopy.foodAlt} />
          <span className={styles.caption}><Utensils size={17} aria-hidden="true" />{featureCopy.foodCaption}</span>
        </div>}
        <div className={styles.cardContent}>
          <div className={styles.cardTop}><span className={styles.icon}><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></span><ArrowUpRight className={styles.arrow} size={26} aria-hidden="true" /></div>
          {food && <p className={styles.eyebrow}>{featureCopy.foodEyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
          <PreviewComponent />
          {food && <p className={styles.disclaimer}>{CARBOHYDRATE_DISCLAIMER}</p>}
          <span className={styles.cta}>{cta}<ArrowUpRight size={17} aria-hidden="true" /></span>
        </div>
      </a>;
    })}
  </section>;
}
