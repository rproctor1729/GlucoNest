'use client';

import { useApp } from '@/context/AppContext';
import TeamSection from './TeamSection';

export default function AboutSection() {
  const { teamMembers } = useApp();
  return <TeamSection members={teamMembers} />;
}
