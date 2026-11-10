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

// Synthetic examples. Set consent to false while drafting a real person's entry.
const members: TeamMember[] = [
  {
    id: 'member-1',
    firstName: 'Member 1',
    tagline: 'Add tagline here',
    role: 'Food contributor',
    diagnosedNote: 'Diagnosed at ___',
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
    firstName: 'Member 2',
    tagline: 'Add tagline here',
    role: 'Hypo SOS advisor',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: true,
  },
  {
    id: 'member-3',
    firstName: 'Member 3',
    tagline: 'Add tagline here',
    role: 'Guide contributor',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: true,
  },
  {
    id: 'member-4',
    firstName: 'Member 4',
    tagline: 'Add tagline here',
    role: 'Community contributor',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: true,
  },
  {
    id: 'member-5',
    firstName: 'Member 5',
    tagline: 'Add tagline here',
    role: 'Community contributor',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: true,
  },
  {
    id: 'builder',
    firstName: 'Builder',
    tagline: 'Solo developer, T1 since ___',
    role: 'Builder',
    diagnosedNote: 'Diagnosed at ___',
    story: {
      whoIAm: 'Add story here',
      myJourney: 'Add story here',
      whatHelped: 'Add story here',
      adviceForNewlyDiagnosed: 'Add story here',
    },
    consent: true,
  },
];

export function getPublishedMembers(entries: readonly TeamMember[] = members) {
  return entries.filter(member => member.consent === true);
}
