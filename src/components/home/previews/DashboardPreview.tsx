'use client';

import { featureCopy as copy } from '@/data/featureCopy';
import { loadDashboardPreview, sparklinePoints, type DashboardPreviewData } from '@/lib/featurePreviews';
import { usePreview, type PreviewLoader } from './usePreview';
import PreviewMessage from './PreviewMessage';
import styles from '../FeatureSection.module.css';

export default function DashboardPreview({ load = loadDashboardPreview }: { load?: PreviewLoader<DashboardPreviewData> }) {
  const state = usePreview(load);
  if (state.status !== 'data') return <PreviewMessage status={state.status} empty={copy.dashboardEmpty} />;
  const { readings, meals, sample } = state.data;
  const latest = readings.at(-1);
  const average = readings.length ? Math.round(readings.reduce((sum, reading) => sum + reading.value, 0) / readings.length) : null;
  const points = sparklinePoints(readings);
  return <div className={styles.dashboardPreview}>
    <div className={styles.previewMeta}><span>{sample ? copy.sample : copy.yourDay}</span><span>{latest?.timeLabel}</span></div>
    {latest ? <>
      <div className={styles.stats}><div><span>{copy.latest}</span><strong>{latest.value} <small>{copy.glucoseUnit}</small></strong></div><div><span>{copy.average}</span><strong>{average} <small>{copy.glucoseUnit}</small></strong></div></div>
      <svg className={styles.sparkline} viewBox="0 0 320 80" role="img" aria-label={copy.chartLabel} preserveAspectRatio="none">
        <path d="M8 72H312" className={styles.chartBaseline} />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {readings.length === 1 && <circle cx="160" cy="40" r="3" fill="currentColor" />}
      </svg>
      <span className={styles.srOnly}>{copy.readingList} {readings.map(reading => `${reading.timeLabel} ${reading.value} ${copy.glucoseUnit}`).join('; ')}</span>
    </> : <p className={styles.emptyDetail}>{copy.noReadings}</p>}
    <div className={styles.meals}><p className={styles.previewMeta}>{sample ? copy.sampleMeals : copy.todayMeals}</p>
      {meals.length ? <ul>{meals.slice(0, 2).map(meal => <li key={meal.id}><span className={styles.mealDot} aria-hidden="true" />{meal.name}</li>)}</ul> : <p>{copy.noMeals}</p>}
    </div>
  </div>;
}
