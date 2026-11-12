export type DoctorSpecialty =
  | 'Endocrinologist'
  | 'Diabetologist'
  | 'Pediatric Endocrinologist'
  | 'Diabetes Educator'
  | 'Dietitian'
  | 'Ophthalmologist'
  | 'Other specialist';

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  qualifications?: string;
  city: string;
  state: string;
  hospitalOrClinic?: string;
  /** Only set for real clinics whose website has been checked. */
  clinicWebsite?: string;
  /** Initials are used as the avatar. No photos are shown for demo profiles. */
  initials: string;
  /** Fictional sample text. Real experiences are shown only with written permission. */
  communityExperience?: string;
  experienceIsSample: boolean;
  isDemo: boolean;
}
