import { ArrowRight } from 'lucide-react';
import ActionProfileChart from './ActionProfileChart';
import { ACTION_CLASS_LABELS, CATEGORY_LABELS, PENDING, STATUS_LABELS, insulinHref, insulinSources, insulins, sourceFor, valueOf, type InsulinRecord, type ProfileField } from '@/lib/insulinExplorer';
import styles from './InsulinExplorer.module.css';

const REVIEW_TEXT: Record<InsulinRecord['reviewStatus'], string> = {
  'label-verified': 'Label-verified (US prescribing information reviewed)',
  'partly-verified': 'Partly verified. Some fields are still pending review.',
  'pending-review': 'Pending review. Clinical fields are not yet source-checked.',
};

// Shows the verified value with a link to its source, or "Pending review". Never zero, never "not applicable".
function Field({ label, field }: { label: string; field: ProfileField }) {
  const text = valueOf(field);
  const source = sourceFor(field);
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {text ?? <span className={styles['pending-text']}>{PENDING}</span>}
        {source && <> <small>(<a href={source.url} rel="noopener noreferrer" target="_blank">{source.title}</a>)</small></>}
      </dd>
    </div>
  );
}

// Risks shared by all insulins. These are general points, not product claims.
const GENERAL_SAFETY = [
  'Hypoglycaemia (low glucose) is the most common risk with any insulin. Know the signs and your care team’s low-glucose plan.',
  'Injection-site reactions can occur. Rotate sites and report persistent problems.',
  'Lipohypertrophy (lumps under the skin) can change how insulin is absorbed. Check injection sites regularly.',
  'Device and concentration confusion can cause dosing errors. Check the product name and concentration on every pen or vial.',
];

export default function InsulinDetail({ record }: { record: InsulinRecord }) {
  const names = record.brands.map(brand => brand.name).join(' · ');
  const related = insulins.filter(other => other.id !== record.id && other.category === record.category).slice(0, 3);
  const sources = record.sources.map(id => insulinSources[id]).filter(Boolean);

  return (
    <article className={styles.explorer}>
      <header className={styles.section}>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles[record.category]}`}>{CATEGORY_LABELS[record.category]}</span>
          <span className={`${styles.badge} ${styles.neutral}`}>{ACTION_CLASS_LABELS[record.actionClass]}</span>
          <span className={`${styles.badge} ${styles.neutral}`}>{record.concentration}</span>
        </div>
        <h1 tabIndex={-1}>{names}</h1>
        <p className={styles.genericName}>{record.genericName}</p>
        <p className={styles.lede}>{record.overview}</p>
      </header>

      <p className={styles.notice + ' ' + styles.warn} role="note">
        <strong>Important:</strong> insulin switching and dose changes require guidance from a qualified healthcare professional.
        This page is education only and does not calculate or recommend doses.
      </p>

      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="profile-heading">
          <h2 id="profile-heading">Action profile</h2>
          <dl className={styles.facts}>
            <Field label="Onset" field={record.onset} />
            <Field label="Peak" field={record.peak} />
            <Field label="Duration" field={record.duration} />
          </dl>
          <p className={styles.notice}>
            Onset, peak and duration are study ranges from the label, not predictions for any person. They vary with dose, site and individual factors.
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="formulation-heading">
          <h2 id="formulation-heading">Formulation</h2>
          <dl className={styles.facts}>
            <div><dt>Active ingredient</dt><dd>{record.genericName}</dd></div>
            <div><dt>Concentration</dt><dd>{record.concentration}</dd></div>
            <div>
              <dt>Presentations</dt>
              <dd>{record.presentations.length ? <ul>{record.presentations.map(item => <li key={item}>{item}</li>)}</ul> : <span className={styles['pending-text']}>{PENDING}</span>}</dd>
            </div>
            <div><dt>Delivery devices</dt><dd>{record.deliveryMethods.join(', ') || <span className={styles['pending-text']}>{PENDING}</span>}</dd></div>
            <Field label="Differences" field={record.formulationDifferences} />
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="handling-heading">
          <h2 id="handling-heading">Administration and handling</h2>
          <dl className={styles.facts}>
            <Field label="Routes" field={record.routes} />
            <Field label="Pump use" field={record.pumpCompatibility} />
            <Field label="Storage" field={record.storage} />
            <Field label="Mixing" field={record.mixing} />
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="safety-heading">
          <h2 id="safety-heading">Important safety information</h2>
          <ul>
            {GENERAL_SAFETY.map(item => <li key={item}>{item}</li>)}
          </ul>
          {record.safetyNotes.length > 0 && <>
            <h3>Product-specific notes</h3>
            <ul>{record.safetyNotes.map(item => <li key={item}>{item}</li>)}</ul>
          </>}
        </section>
      </div>

      <section className={styles.section} aria-labelledby="chart-heading">
        <h2 id="chart-heading">Action-shape illustration</h2>
        <ActionProfileChart records={[record]} />
      </section>

      <section className={styles.section} aria-labelledby="markets-heading">
        <h2 id="markets-heading">Availability by country</h2>
        <ul className={styles.facts}>
          {record.marketAvailability.map(market => (
            <li key={market.country}>
              <strong>{market.country}:</strong> {STATUS_LABELS[market.status] ?? PENDING}.
              {' '}Manufacturer: <span className={styles['pending-text']}>Not yet verified</span>.
              {' '}Last verified: <span className={styles['pending-text']}>{market.verifiedOn ?? 'not yet verified'}</span>.
            </li>
          ))}
        </ul>
        <p className={styles.notice}>
          An availability status is shown only when a dated official source confirms it. Historical brand lists are not used.
        </p>
      </section>

      {related.length > 0 && (
        <section className={styles.section} aria-labelledby="related-heading">
          <h2 id="related-heading">Related insulins</h2>
          <p>Educational entries in the same category. They are not medical substitutes.</p>
          <ul className={styles.nav}>
            {related.map(item => (
              <li key={item.id}>
                <a className={styles.tab} href={insulinHref(item.id)}>
                  {item.brands.map(brand => brand.name).join(' · ')} · {item.concentration} <ArrowRight size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section} aria-labelledby="sources-heading">
        <h2 id="sources-heading">Sources and last reviewed</h2>
        <p>
          Last reviewed: {record.lastReviewed ?? <span className={styles['pending-text']}>not yet reviewed</span>}.
          {' '}Review status: {REVIEW_TEXT[record.reviewStatus]}
        </p>
        {sources.length ? (
          <ul className={styles.sources}>
            {sources.map(source => (
              <li key={source.url}>
                <a href={source.url} rel="noopener noreferrer" target="_blank">{source.title}</a>, {source.org}. Retrieved {source.verified}.
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles['pending-text']}>No source has been confirmed for this record yet.</p>
        )}
        <p className={styles.notice}>
          Educational disclaimer: this information does not replace advice from your diabetes care team. Verify product details against the current label.
        </p>
      </section>
    </article>
  );
}
