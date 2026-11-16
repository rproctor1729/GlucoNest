import { ArrowRight } from 'lucide-react';
import { ACTION_CLASS_LABELS, CATEGORY_LABELS, PENDING, STATUS_LABELS, insulinHref, valueOf, type InsulinRecord, type ProfileField } from '@/lib/insulinExplorer';
import styles from './InsulinExplorer.module.css';

function Fact({ label, field }: { label: string; field: ProfileField }) {
  const text = valueOf(field);
  return (
    <div>
      <dt>{label}</dt>
      <dd>{text ?? <span className={styles['pending-text']}>{PENDING}</span>}</dd>
    </div>
  );
}

const REVIEW_LABEL: Record<InsulinRecord['reviewStatus'], string> = {
  'label-verified': 'Label-verified',
  'partly-verified': 'Partly verified',
  'pending-review': 'Pending review',
};

export default function InsulinCard({ record }: { record: InsulinRecord }) {
  const names = record.brands.map(brand => brand.name).join(' · ');
  const india = record.marketAvailability.find(market => market.country === 'India');
  return (
    <li>
      <article className={styles.card} aria-labelledby={`card-${record.id}`}>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles[record.category]}`}>{CATEGORY_LABELS[record.category]}</span>
          <span className={`${styles.badge} ${styles.neutral}`}>{ACTION_CLASS_LABELS[record.actionClass]}</span>
        </div>
        <h3 id={`card-${record.id}`}>{names}</h3>
        <p className={styles.genericName}>{record.genericName} · {record.concentration}</p>
        <dl className={styles.facts}>
          <Fact label="Onset" field={record.onset} />
          <Fact label="Peak" field={record.peak} />
          <Fact label="Duration" field={record.duration} />
        </dl>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles.neutral}`}>{REVIEW_LABEL[record.reviewStatus]}</span>
          <span className={`${styles.badge} ${styles.pending}`}>
            India: {STATUS_LABELS[india?.status ?? 'availability-unverified']}
          </span>
        </div>
        <a className={styles.learnMore} href={insulinHref(record.id)} aria-label={`Learn more about ${names}, ${record.concentration}`}>
          Learn more <ArrowRight size={16} aria-hidden="true" />
        </a>
      </article>
    </li>
  );
}
