import type { DoctorProfile, DoctorSpecialty } from '@/types/doctors';
import type { StoreProduct, StoreCategoryId } from '@/types/store';

function normalise(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function filterProducts(
  products: readonly StoreProduct[],
  labelFor: (id: StoreCategoryId) => string,
  { query, category }: { query: string; category: StoreCategoryId | 'all' },
): StoreProduct[] {
  const q = normalise(query);
  return products.filter(product => {
    if (category !== 'all' && product.category !== category) return false;
    if (!q) return true;
    const haystack = normalise([product.name, product.brand, labelFor(product.category), product.description].join(' '));
    return haystack.includes(q);
  });
}

export function filterDoctors(
  doctors: readonly DoctorProfile[],
  { query, city, specialty }: { query: string; city: string; specialty: DoctorSpecialty | 'all' },
): DoctorProfile[] {
  const q = normalise(query);
  return doctors.filter(doctor => {
    if (specialty !== 'all' && doctor.specialty !== specialty) return false;
    if (city !== 'all' && `${doctor.city}, ${doctor.state}` !== city) return false;
    return !q || normalise(doctor.name).includes(q);
  });
}

export interface ExperienceDraft {
  doctorName: string;
  specialty: string;
  city: string;
  hospitalOrClinic: string;
  experience: string;
  anonymous: boolean;
  consent: boolean;
}

export type ExperienceField = 'doctorName' | 'specialty' | 'city' | 'hospitalOrClinic' | 'experience' | 'consent';

export const EXPERIENCE_LIMITS = { nameMin: 2, nameMax: 80, cityMax: 80, hospitalMax: 120, experienceMin: 40, experienceMax: 800 } as const;

// Blocks contact details and long digit strings, so the form does not collect personal identifiers.
const CONTACT_PATTERN = /[\w.+-]+@[\w-]+\.[\w.]+|(\+?\d[\d\s-]{8,}\d)/;

export function validateExperienceDraft(
  draft: ExperienceDraft,
  allowedSpecialties: readonly string[],
): { valid: boolean; errors: Partial<Record<ExperienceField, string>> } {
  const errors: Partial<Record<ExperienceField, string>> = {};
  const name = draft.doctorName.trim();
  const city = draft.city.trim();
  const hospital = draft.hospitalOrClinic.trim();
  const experience = draft.experience.trim();

  if (name.length < EXPERIENCE_LIMITS.nameMin || name.length > EXPERIENCE_LIMITS.nameMax) errors.doctorName = `Enter the doctor’s name (${EXPERIENCE_LIMITS.nameMin}–${EXPERIENCE_LIMITS.nameMax} characters).`;
  if (!allowedSpecialties.includes(draft.specialty)) errors.specialty = 'Choose a specialty.';
  if (!city || city.length > EXPERIENCE_LIMITS.cityMax) errors.city = `Enter the city (up to ${EXPERIENCE_LIMITS.cityMax} characters).`;
  if (hospital.length > EXPERIENCE_LIMITS.hospitalMax) errors.hospitalOrClinic = `Keep the hospital or clinic name under ${EXPERIENCE_LIMITS.hospitalMax} characters.`;
  if (experience.length < EXPERIENCE_LIMITS.experienceMin || experience.length > EXPERIENCE_LIMITS.experienceMax) {
    errors.experience = `Share your experience in ${EXPERIENCE_LIMITS.experienceMin}–${EXPERIENCE_LIMITS.experienceMax} characters.`;
  } else if (CONTACT_PATTERN.test(experience)) {
    errors.experience = 'Remove phone numbers or email addresses. Please do not share personal contact or medical details.';
  }
  if (!draft.consent) errors.consent = 'Please confirm you have permission to share this and that it contains no personal medical details.';

  return { valid: Object.keys(errors).length === 0, errors };
}

// Neutral "Where to Buy" target. Uses a verified manufacturer or retailer page when one is set,
// otherwise a shopping search, so no unverified product URLs are shown.
export function buyLinkFor(product: Pick<StoreProduct, 'buyUrl' | 'searchTerm'>): string {
  if (product.buyUrl) return product.buyUrl;
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(product.searchTerm)}`;
}
