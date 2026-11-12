'use client';

import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalFocus } from '@/components/common/useModalFocus';
import { doctorSpecialties } from '@/data/doctors/doctorsData';
import { EXPERIENCE_LIMITS, validateExperienceDraft, type ExperienceDraft, type ExperienceField } from '@/utils/catalogFilters';
import styles from '../catalog/Catalog.module.css';

interface Props {
  onClose: () => void;
}

const emptyDraft: ExperienceDraft = {
  doctorName: '', specialty: '', city: '', hospitalOrClinic: '', experience: '', anonymous: true, consent: false,
};

// UI preview only. Nothing is sent, stored or saved, and no success state is shown.
export default function ShareExperienceModal({ onClose }: Props) {
  const ref = useModalFocus(true, onClose);
  const [draft, setDraft] = useState<ExperienceDraft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<ExperienceField, string>>>({});
  const [previewNotice, setPreviewNotice] = useState(false);

  function update<K extends keyof ExperienceDraft>(key: K, value: ExperienceDraft[K]) {
    setDraft(current => ({ ...current, [key]: value }));
    setPreviewNotice(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = validateExperienceDraft(draft, doctorSpecialties);
    setErrors(result.errors);
    setPreviewNotice(result.valid);
  }

  const errorId = (field: ExperienceField) => `share-${field}-error`;

  return createPortal(
    <div className={styles.overlay} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="share-dialog-title" tabIndex={-1} className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <div>
            <h2 id="share-dialog-title" className={styles.dialogTitle}>Share Your Experience</h2>
            <p className={styles.hint}>Describe a visit in your own words. Please leave out personal medical details, dates of birth, and contact information.</p>
          </div>
          <button type="button" className={styles.iconButton} aria-label="Close share form" onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.notice} style={{ marginTop: 14 }} role="note">
          <strong>UI preview.</strong> Submissions are not available yet. Nothing you enter here is sent or saved.
        </div>

        <form onSubmit={submit} noValidate>
          <label className={styles.field}>Doctor name
            <input className={styles.input} value={draft.doctorName} maxLength={EXPERIENCE_LIMITS.nameMax} aria-invalid={!!errors.doctorName} aria-describedby={errors.doctorName ? errorId('doctorName') : undefined}
              onChange={event => update('doctorName', event.target.value)} />
            {errors.doctorName && <span id={errorId('doctorName')} className={styles.error}>{errors.doctorName}</span>}
          </label>

          <label className={styles.field}>Specialty
            <select className={styles.select} value={draft.specialty} aria-invalid={!!errors.specialty} aria-describedby={errors.specialty ? errorId('specialty') : undefined}
              onChange={event => update('specialty', event.target.value)}>
              <option value="">Choose a specialty</option>
              {doctorSpecialties.map(specialty => <option key={specialty} value={specialty}>{specialty}</option>)}
            </select>
            {errors.specialty && <span id={errorId('specialty')} className={styles.error}>{errors.specialty}</span>}
          </label>

          <label className={styles.field}>City
            <input className={styles.input} value={draft.city} maxLength={EXPERIENCE_LIMITS.cityMax} aria-invalid={!!errors.city} aria-describedby={errors.city ? errorId('city') : undefined}
              onChange={event => update('city', event.target.value)} />
            {errors.city && <span id={errorId('city')} className={styles.error}>{errors.city}</span>}
          </label>

          <label className={styles.field}>Hospital or clinic <span className={styles.hint}>(optional)</span>
            <input className={styles.input} value={draft.hospitalOrClinic} maxLength={EXPERIENCE_LIMITS.hospitalMax} aria-invalid={!!errors.hospitalOrClinic} aria-describedby={errors.hospitalOrClinic ? errorId('hospitalOrClinic') : undefined}
              onChange={event => update('hospitalOrClinic', event.target.value)} />
            {errors.hospitalOrClinic && <span id={errorId('hospitalOrClinic')} className={styles.error}>{errors.hospitalOrClinic}</span>}
          </label>

          <label className={styles.field}>Your experience
            <textarea className={styles.textarea} value={draft.experience} maxLength={EXPERIENCE_LIMITS.experienceMax} aria-invalid={!!errors.experience} aria-describedby={`${errorId('experience')} experience-hint`}
              onChange={event => update('experience', event.target.value)} />
            <span id="experience-hint" className={styles.hint}>{draft.experience.length} / {EXPERIENCE_LIMITS.experienceMax} characters</span>
            {errors.experience && <span id={errorId('experience')} className={styles.error}>{errors.experience}</span>}
          </label>

          <div className={styles.field} style={{ gap: 10 }}>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={draft.anonymous} onChange={event => update('anonymous', event.target.checked)} />
              <span>Keep my submission anonymous</span>
            </label>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={draft.consent} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? errorId('consent') : undefined}
                onChange={event => update('consent', event.target.checked)} />
              <span>I have permission to share this experience, and it contains no personal medical details.</span>
            </label>
            {errors.consent && <span id={errorId('consent')} className={styles.error}>{errors.consent}</span>}
          </div>

          {previewNotice && (
            <p className={styles.notice} role="status" style={{ marginTop: 14 }}>
              Submissions are not available yet. This is a UI preview, so nothing was sent or saved.
            </p>
          )}

          <div className={styles.dialogFooter}>
            <button type="submit" className={`${styles.button} ${styles.primary}`}>Submit</button>
            <button type="button" className={styles.button} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
