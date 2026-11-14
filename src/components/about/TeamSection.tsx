'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalFocus } from '@/components/common/useModalFocus';
import type { TeamMember } from '@/data/teamMembers';
import TeamCarousel from './TeamCarousel';
import styles from './TeamSection.module.css';

function Avatar({ member }: { member: TeamMember }) {
  const [failedPhoto, setFailedPhoto] = useState<string>();
  return <span className={styles.avatar}>
    {member.photo && member.photo !== failedPhoto
      ? <Image src={member.photo} alt={`Portrait of ${member.firstName}`} width={56} height={56} onError={() => setFailedPhoto(member.photo)} />
      : <span aria-hidden="true">{Array.from(member.firstName.trim())[0]}</span>}
  </span>;
}

function MemberTags({ member }: { member: TeamMember }) {
  return <div className={styles.tags}><span>{member.role}</span><span>{member.diagnosedNote}</span></div>;
}

function StoryModal({ member, onClose, onStep }: {
  member: TeamMember;
  onClose: () => void;
  onStep?: (direction: number) => void;
}) {
  const ref = useModalFocus(true, onClose);
  const titleId = useId();
  const { whoIAm, myJourney, whatHelped, adviceForNewlyDiagnosed } = member.story;
  return createPortal(
    <div className={styles.backdrop} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.dialog} ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className={styles.dialogHeader}>
          <div className={styles.identity}><Avatar member={member} />
            <h2 id={titleId} aria-live="polite">{member.firstName}<span className="sr-only">’s story</span></h2>
          </div>
          <button type="button" className={styles.close} aria-label="Close story" onClick={onClose}><X size={20} /></button>
        </div>
        <div key={member.id} className={styles.pages} tabIndex={0} role="region" aria-label="Story text">
          <MemberTags member={member} />
          <h3>Who I am</h3><p>{whoIAm}</p>
          <h3>My journey</h3><p>{myJourney}</p>
          <h3>What helped</h3><p>{whatHelped}</p>
          <div className={styles.quote}><h3>For someone newly diagnosed</h3><blockquote>{adviceForNewlyDiagnosed}</blockquote></div>
        </div>
        {onStep && <nav className={styles.storyNav} aria-label="Member stories">
          <button type="button" onClick={() => onStep(-1)}><ArrowLeft size={16} aria-hidden="true" /> Previous story</button>
          <button type="button" onClick={() => onStep(1)}>Next story <ArrowRight size={16} aria-hidden="true" /></button>
        </nav>}
      </div>
    </div>, document.body
  );
}

export default function TeamSection({ members }: { members: readonly TeamMember[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const titleId = useId();
  if (!members.length) return null;
  const index = members.findIndex(member => member.id === activeId);
  return <section className={styles.team} aria-labelledby={titleId}>
    <p className="section-kicker">THE PEOPLE BEHIND IT</p>
    <h2 id={titleId} className={styles.heading}>Built with people who <em>live with type 1</em>.</h2>
    <p className={styles.intro}>Real stories from the community that shaped GlucoNest.</p>
    <TeamCarousel members={members} onExplore={id => setActiveId(id)} />
    <p className={styles.note}>Personal experiences, not medical advice.</p>
    {index >= 0 && <StoryModal member={members[index]} onClose={() => setActiveId(null)}
      onStep={members.length > 1 ? direction => setActiveId(members[(index + direction + members.length) % members.length].id) : undefined} />}
  </section>;
}
