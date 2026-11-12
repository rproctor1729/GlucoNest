'use client';

import { MapPin } from 'lucide-react';
import type { DoctorProfile } from '@/types/doctors';
import styles from '../catalog/Catalog.module.css';

interface Props {
  doctor: DoctorProfile;
  onView: (doctor: DoctorProfile) => void;
}

export default function DoctorCard({ doctor, onView }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.media} aria-hidden="true" style={{ aspectRatio: '1 / 1', maxHeight: 150, justifySelf: 'stretch' }}>
        <span style={{ fontSize: '1.6rem', fontWeight: 600 }}>{doctor.initials}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className={`${styles.chip} ${styles.demoChip}`}>Demo profile</span>
        <span className={styles.chip}>{doctor.specialty}</span>
      </div>
      <h3 className={styles.cardTitle}>{doctor.name}</h3>
      <p className={styles.meta} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <MapPin size={14} aria-hidden="true" /> {doctor.city}, {doctor.state}
      </p>
      {doctor.hospitalOrClinic && <p className={styles.meta}>{doctor.hospitalOrClinic}</p>}
      <div className={styles.actions}>
        <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => onView(doctor)}>
          View Profile<span className="sr-only"> for {doctor.name}</span>
        </button>
      </div>
    </article>
  );
}
