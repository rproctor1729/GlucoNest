import type { DoctorProfile, DoctorSpecialty } from '@/types/doctors';

// DEMO CONTENT ONLY. Every profile below is fictional. Names, cities, clinics and experiences are
// placeholders for layout and interaction testing. They do not describe any real person or practice.
// Replace with real entries only after written permission and independent verification.
export const DOCTORS_DISCLAIMER =
  'Doctors featured here reflect personal experiences shared by members of the GlucoNest community. Their inclusion does not represent an endorsement, ranking, or medical recommendation. Please independently verify credentials and choose healthcare professionals based on your individual needs.';

export const EXPERIENCE_NOTE =
  "This is an individual's personal experience, not a medical recommendation. Your experience may differ.";

export const doctorSpecialties: DoctorSpecialty[] = [
  'Endocrinologist',
  'Diabetologist',
  'Pediatric Endocrinologist',
  'Diabetes Educator',
  'Dietitian',
  'Ophthalmologist',
  'Other specialist',
];

export const doctorProfiles: DoctorProfile[] = [
  {
    id: 'demo-doctor-01', name: 'Dr. Demo One', initials: 'D1', specialty: 'Endocrinologist',
    qualifications: 'Sample qualification (demo)', city: 'Example City A', state: 'Demo State',
    hospitalOrClinic: 'Sample Diabetes Clinic (demo)', isDemo: true, experienceIsSample: true,
    communityExperience: 'SAMPLE TEXT (fictional). A community member describes how a first visit focused on reviewing readings together and agreeing on a follow-up plan.',
  },
  {
    id: 'demo-doctor-02', name: 'Dr. Demo Two', initials: 'D2', specialty: 'Diabetologist',
    qualifications: 'Sample qualification (demo)', city: 'Example City B', state: 'Demo State',
    hospitalOrClinic: 'Sample Care Centre (demo)', isDemo: true, experienceIsSample: true,
    communityExperience: 'SAMPLE TEXT (fictional). A community member describes a visit where the conversation covered travel planning and sick-day rules.',
  },
  {
    id: 'demo-doctor-03', name: 'Dr. Demo Three', initials: 'D3', specialty: 'Pediatric Endocrinologist',
    qualifications: 'Sample qualification (demo)', city: 'Example City A', state: 'Demo State',
    hospitalOrClinic: 'Sample Children’s Clinic (demo)', isDemo: true, experienceIsSample: true,
    communityExperience: 'SAMPLE TEXT (fictional). A parent describes how the team explained school routines and hypo plans in plain language.',
  },
  {
    id: 'demo-doctor-04', name: 'Demo Educator Four', initials: 'E4', specialty: 'Diabetes Educator',
    qualifications: 'Sample qualification (demo)', city: 'Example City C', state: 'Demo State',
    hospitalOrClinic: 'Sample Learning Hub (demo)', isDemo: true, experienceIsSample: true,
    communityExperience: 'SAMPLE TEXT (fictional). A community member describes practical sessions on carb counting and pump basics.',
  },
  {
    id: 'demo-doctor-05', name: 'Demo Dietitian Five', initials: 'N5', specialty: 'Dietitian',
    qualifications: 'Sample qualification (demo)', city: 'Example City B', state: 'Demo State',
    hospitalOrClinic: 'Sample Nutrition Practice (demo)', isDemo: true, experienceIsSample: true,
    communityExperience: 'SAMPLE TEXT (fictional). A community member describes meal-planning sessions built around everyday home food.',
  },
  {
    id: 'demo-doctor-06', name: 'Dr. Demo Six', initials: 'D6', specialty: 'Ophthalmologist',
    qualifications: 'Sample qualification (demo)', city: 'Example City C', state: 'Demo State',
    hospitalOrClinic: 'Sample Eye Clinic (demo)', isDemo: true, experienceIsSample: true,
    communityExperience: 'SAMPLE TEXT (fictional). A community member describes a routine retinal screening visit and how results were explained.',
  },
  {
    id: 'demo-doctor-07', name: 'Dr. Demo Seven', initials: 'D7', specialty: 'Endocrinologist',
    qualifications: 'Sample qualification (demo)', city: 'Example City A', state: 'Demo State',
    hospitalOrClinic: 'Sample Medical Centre (demo)', isDemo: true, experienceIsSample: true,
    communityExperience: 'SAMPLE TEXT (fictional). A community member describes a telephone follow-up after a difficult week of readings.',
  },
  {
    id: 'demo-doctor-08', name: 'Other Demo Eight', initials: 'O8', specialty: 'Other specialist',
    qualifications: 'Sample qualification (demo)', city: 'Example City B', state: 'Demo State',
    hospitalOrClinic: 'Sample Wellbeing Service (demo)', isDemo: true, experienceIsSample: true,
    communityExperience: 'SAMPLE TEXT (fictional). A community member describes a referral to a counsellor to talk through the emotional side of diagnosis.',
  },
];

export const doctorCities: string[] = Array.from(new Set(doctorProfiles.map(doctor => `${doctor.city}, ${doctor.state}`))).sort();
