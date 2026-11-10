import { featureCopy } from '@/data/featureCopy';
import styles from '../FeatureSection.module.css';

export default function PreviewMessage({ status, empty }: { status: 'loading' | 'empty' | 'error'; empty: string }) {
  return <div className={styles.previewMessage} role="status" aria-live="polite" aria-busy={status === 'loading'}>
    <span className={styles.messageMark} aria-hidden="true" />
    <p>{status === 'loading' ? featureCopy.loading : status === 'error' ? featureCopy.error : empty}</p>
  </div>;
}
