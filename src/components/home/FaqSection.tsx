'use client';

import { useId } from 'react';
import { ArrowUpRight, Database, CircleSlash2, UserRound } from 'lucide-react';
import { faqCopy, faqItems } from '@/data/faq';
import { CARBOHYDRATE_DISCLAIMER } from '@/data/disclaimers';
import type { NavigationSection } from '@/types';
import styles from './FaqSection.module.css';

const icons = { dosing: CircleSlash2, data: Database, account: UserRound };

export default function FaqSection({ onNavigate }: { onNavigate?: (section: NavigationSection) => void }) {
  const prefix = useId();
  return <section className={styles.faq} aria-labelledby={`${prefix}-heading`}>
    <header className={styles.heading}>
      <p>{faqCopy.eyebrow}</p>
      <h2 id={`${prefix}-heading`}>{faqCopy.heading}</h2>
    </header>

    <div className={styles.cards} role="group" aria-label={faqCopy.cardsLabel}>
      {faqItems.map(item => {
        const Icon = icons[item.id];
        return <article key={item.id} className={`${styles.card} ${item.id === 'dosing' ? styles.dosing : ''}`}>
          <span className={styles.cardIcon}><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></span>
          <h3>{item.question}</h3>
          <p className={styles.summary}>{item.summary}</p>
          {item.id === 'dosing' && <p className={styles.disclaimer}>{CARBOHYDRATE_DISCLAIMER}</p>}
          {item.cta && <a className={styles.cta} href={item.cta.href} onClick={event => {
            if (!onNavigate || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onNavigate(item.cta!.section);
          }}>{item.cta.label}<ArrowUpRight size={17} aria-hidden="true" /></a>}
        </article>;
      })}
    </div>

  </section>;
}
