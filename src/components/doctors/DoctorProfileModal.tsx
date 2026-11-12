'use client';

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalFocus } from '@/components/common/useModalFocus';
import { EXPERIENCE_NOTE } from '@/data/doctors/doctorsData';
import type { DoctorProfile } from '@/types/doctors';
import styles from '../catalog/Catalog.module.css';

interface Props {
  doctor: DoctorProfile;
  onClose: () => void;
}

export default function DoctorProfileModal({ doctor, onClose }: Props) {
  const ref = useModalFocus(true, onClose);
  return createPortal(
    <div className={styles.overlay} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="doctor-dialog-title" tabIndex={-1} className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <div>
            <span className={`${styles.chip} ${styles.demoChip}`}>Demo profile · fictional</span>
            <h2 id="doctor-dialog-title" className={styles.dialogTitle} style={{ marginTop: 8 }}>{doctor.name}</h2>
          </div>
          <button type="button" className={styles.iconButton} aria-label="Close doctor profile" onClick={onClose}><X size={20} /></button>
        </div>

        <h3>Doctor information</h3>
        <ul>
          <li>Specialty: {doctor.specialty}</li>
          {doctor.qualifications && <li>Qualifications: {doctor.qualifications}</li>}
          <li>City: {doctor.city}, {doctor.state}</li>
          <li>Hospital or clinic: {doctor.hospitalOrClinic ?? 'Not listed'}</li>
          <li>Clinic website: {doctor.clinicWebsite ? 'Available' : 'Not listed for this demo profile'}</li>
        </ul>

        <h3>What Our Community Shared</h3>
        {doctor.experienceIsSample ? (
          <p className={styles.notice} style={{ marginTop: 8 }}>
            <strong>Sample text, not a real experience.</strong> {doctor.communityExperience}
          </p>
        ) : (
          <p>{doctor.communityExperience}</p>
        )}
        <p className={styles.hint} style={{ marginTop: 10 }}>{EXPERIENCE_NOTE}</p>

        <div className={styles.dialogFooter}>
          <button type="button" className={styles.button} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
