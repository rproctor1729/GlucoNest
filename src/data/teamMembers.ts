export interface TeamMember {
  id: string;
  firstName: string;
  tagline: string;
  role: string;
  diagnosedNote: string;
  photo?: string;
  story: {
    whoIAm: string;
    myJourney: string;
    whatHelped: string;
    adviceForNewlyDiagnosed: string;
  };
  consent: boolean;
}

// Entries are drafts. consent stays false until each person has given written consent to their
// name, role, photo and story being published, and the story text has been written by them.
// Placeholder text and roles (for example a clinical role) must never be published unverified.
const members: TeamMember[] = [
  {
    id: 'member-1',
    firstName: 'Vamshi',
    tagline: 'Add tagline here',
    role: 'Developer',
    diagnosedNote: 'Diagnosed in 2016',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: true,
  },
  {
    id: 'member-2',
    firstName: 'Gayathri',
    tagline: 'Add tagline here',
    role: 'Hypo SOS advisor',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: false,
  },
  {
    id: 'member-3',
    firstName: 'Girish',
    tagline: 'Add tagline here',
    role: 'Guide contributor',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: false,
  },
  {
    id: 'member-4',
    firstName: 'Varun',
    tagline: 'Add tagline here',
    role: 'Community contributor',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: false,
  },
  {
    id: 'member-5',
    firstName: 'Ramya',
    tagline: 'Add tagline here',
    role: 'Community contributor',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: false,
  },
  {
    id: 'builder',
    firstName: 'Goutham',
    tagline: 'T1 since ___',
    role: 'Builder',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: false,
  },
];

export function getPublishedMembers(entries: readonly TeamMember[] = members) {
  return entries.filter(member => member.consent === true);
}
