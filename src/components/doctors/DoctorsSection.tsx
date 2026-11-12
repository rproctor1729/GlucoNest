'use client';

import { useMemo, useState } from 'react';
import { Search, SearchX, Share2, X } from 'lucide-react';
import { DOCTORS_DISCLAIMER, doctorCities, doctorProfiles, doctorSpecialties } from '@/data/doctors/doctorsData';
import { filterDoctors } from '@/utils/catalogFilters';
import type { DoctorProfile, DoctorSpecialty } from '@/types/doctors';
import DoctorCard from './DoctorCard';
import DoctorProfileModal from './DoctorProfileModal';
import ShareExperienceModal from './ShareExperienceModal';
import styles from '../catalog/Catalog.module.css';

export default function DoctorsSection() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('all');
  const [specialty, setSpecialty] = useState<DoctorSpecialty | 'all'>('all');
  const [selected, setSelected] = useState<DoctorProfile | null>(null);
  const [sharing, setSharing] = useState(false);

  const results = useMemo(
    () => filterDoctors(doctorProfiles, { query, city, specialty }),
    [query, city, specialty],
  );
  const filtersActive = query.trim() !== '' || city !== 'all' || specialty !== 'all';

  function clearFilters() {
    setQuery('');
    setCity('all');
    setSpecialty('all');
  }

  return (
    <div className={styles.page}>
      <section className={styles.banner} aria-label="Introduction">
        <p>Living with Type 1 Diabetes is a lifelong journey, and the healthcare professionals we meet along the way can become an important part of our stories.</p>
        <p style={{ marginTop: 10 }}>Here, we share doctors that members of our T1D community have personally consulted. These are individual experiences and opinions, not professional recommendations or endorsements.</p>
        <button type="button" className={`${styles.button} ${styles.primary}`} style={{ marginTop: 16 }} onClick={() => setSharing(true)}>
          <Share2 size={16} aria-hidden="true" /> Share Your Experience
        </button>
      </section>

      <div className={styles.notice} role="note">
        <strong>Demo content.</strong> All profiles on this page are fictional placeholders for previewing the layout. They are not real doctors, practices or experiences.
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <Search size={19} aria-hidden="true" />
          <input type="search" aria-label="Search doctors by name" placeholder="Search by doctor name"
            value={query} onChange={event => setQuery(event.target.value)} />
          {query && <button type="button" className={styles.iconButton} style={{ width: 34, height: 34 }} aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}
        </label>
        <div className={styles.selectRow}>
          <label className={styles.field} style={{ marginTop: 0 }}>
            <span className={styles.hint}>City</span>
            <select className={styles.select} value={city} onChange={event => setCity(event.target.value)}>
              <option value="all">All cities</option>
              {doctorCities.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className={styles.field} style={{ marginTop: 0 }}>
            <span className={styles.hint}>Specialty</span>
            <select className={styles.select} value={specialty} onChange={event => setSpecialty(event.target.value as DoctorSpecialty | 'all')}>
              <option value="all">All specialties</option>
              {doctorSpecialties.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
        {filtersActive && (
          <div className={styles.selectRow}>
            <span className={styles.resultCount} aria-live="polite">{results.length} {results.length === 1 ? 'profile' : 'profiles'} shown</span>
            <button type="button" className={styles.linkButton} onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </div>

      {results.length ? (
        <div className={styles.grid}>
          {results.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} onView={setSelected} />)}
        </div>
      ) : (
        <div className={styles.empty}>
          <SearchX size={36} aria-hidden="true" />
          <h2>No profiles match these filters</h2>
          <p>Try a different name, city or specialty, or clear the filters to see every demo profile.</p>
          <button type="button" className={`${styles.button} ${styles.primary}`} onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      <p className={styles.disclaimer}>{DOCTORS_DISCLAIMER}</p>

      {selected && <DoctorProfileModal doctor={selected} onClose={() => setSelected(null)} />}
      {sharing && <ShareExperienceModal onClose={() => setSharing(false)} />}
    </div>
  );
}
