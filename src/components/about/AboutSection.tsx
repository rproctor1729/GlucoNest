'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, Heart, Utensils } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import styles from './AboutSection.module.css';
import TeamSection from './TeamSection';

const chapters = [
  { id: 'food', label: 'Familiar food', icon: Utensils, title: 'A place for the food you grew up with.', description: 'Indian meals, everyday portions, and carbohydrate estimates you can explore.' },
  { id: 'moments', label: 'Daily moments', icon: BookOpen, title: 'A day is made of little things.', description: 'Keep meals, readings, insulin, and movement together, with room for your notes.' },
  { id: 'perspective', label: 'More perspective', icon: ChartNoAxesCombined, title: 'See a little more of the story.', description: 'Explore glucose history and prepare a reading summary for your care team.' },
] as const;

function JournalArtwork() {
  return <svg viewBox="0 0 320 300" fill="none" aria-hidden="true" className={styles.journal}>
    <rect x="65" y="29" width="204" height="252" rx="18" fill="currentColor" opacity=".08" transform="rotate(7 167 155)" />
    <rect x="51" y="20" width="212" height="254" rx="17" className={styles.journalPage} stroke="currentColor" strokeWidth="1.5" />
    <path d="M81 21v252" stroke="currentColor" opacity=".2" />
    {[58, 104, 150, 196, 242].map(y => <path key={y} d={`M43 ${y}h18`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />)}
    <text x="103" y="66" fill="currentColor" fontSize="12" letterSpacing="2">LITTLE MOMENTS</text>
    <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="118" cy="111" r="13" opacity=".2" /><path d="M111 111l5 5 9-11" /><path d="M146 105h80M146 116h48" opacity=".4" />
      <circle cx="118" cy="157" r="13" opacity=".2" /><path d="M111 157l5 5 9-11" /><path d="M146 151h65M146 162h83" opacity=".4" />
      <circle cx="118" cy="203" r="13" opacity=".2" /><path d="M111 203l5 5 9-11" /><path d="M146 197h81M146 208h56" opacity=".4" />
    </g>
    <path d="M234 267c-30-33-16-64 18-71 2 32-5 54-18 71Z" className={styles.leafFill} /><path d="m234 267 14-58" stroke="currentColor" strokeWidth="1.5" />
  </svg>;
}

function PerspectiveArtwork() {
  return <svg viewBox="0 0 360 300" fill="none" aria-hidden="true" className={styles.curve}>
    <rect x="18" y="36" width="324" height="224" rx="22" className={styles.chartPaper} />
    <path d="M43 99h274M43 151h274M43 203h274" stroke="currentColor" strokeDasharray="3 7" opacity=".17" />
    <rect x="43" y="112" width="274" height="79" rx="7" fill="currentColor" opacity=".055" />
    <path d="M43 179C67 179 72 190 94 179S129 104 155 123s35 60 62 44 32-60 53-39 25 34 47 24v67H43Z" fill="currentColor" opacity=".08" />
    <path className={styles.drawCurve} pathLength="1" d="M43 179C67 179 72 190 94 179S129 104 155 123s35 60 62 44 32-60 53-39 25 34 47 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="217" cy="167" r="7" className={styles.chartPaper} stroke="currentColor" strokeWidth="2" />
    <path d="M210 68h83" stroke="currentColor" strokeWidth="3" opacity=".2" strokeLinecap="round" />
    <circle cx="49" cy="68" r="4" fill="currentColor" opacity=".6" /><circle cx="63" cy="68" r="4" fill="currentColor" opacity=".3" /><circle cx="77" cy="68" r="4" fill="currentColor" opacity=".15" />
    <text x="180" y="245" textAnchor="middle" fill="currentColor" fontSize="9" letterSpacing="2">CONTEXT, NOT A SCORE</text>
  </svg>;
}

export default function AboutSection() {
  const { setActiveSection, teamMembers } = useApp();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const chapter = chapters[active];
  const selectWithKeyboard = (event: React.KeyboardEvent, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % chapters.length;
    else if (event.key === 'ArrowLeft') next = (index + chapters.length - 1) % chapters.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = chapters.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return <div className={`${styles.about} animate-fadeIn`}>
    <section className={styles.story} aria-label="The idea behind GlucoNest">
      <div className={styles.copy}>
        <span className={styles.littleMark} aria-hidden="true">✳</span>
        <h2>Life first.<br /><em>Numbers in context.</em></h2>
        <p>GlucoNest brings familiar food, everyday moments, and glucose history into one thoughtful space for life with type 1.</p>
        <div className={styles.tabs} role="tablist" aria-label="Explore the idea">
          {chapters.map(({id, label, icon: Icon}, index) => <button key={id} ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`about-tab-${id}`} aria-controls="about-story-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => selectWithKeyboard(event, index)}><Icon size={16} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span></button>)}
        </div>
        <span className={styles.invitation}>Three small ways to make room for your day.</span>
      </div>
      <div role="tabpanel" id="about-story-panel" aria-labelledby={`about-tab-${chapter.id}`} tabIndex={0} className={styles.storyPanel}>
        <div key={chapter.id} className={styles.scene}>
          <div className={styles.artwork}>
            <div className={styles.orbit} aria-hidden="true" />
            <span className={styles.artSpark} aria-hidden="true">✳</span>
            {chapter.id === 'food' ? <div className={styles.plate}><Image src="/images/indian-meal.png" alt="Idli, dosa, pesarattu, rice, curd, and chutneys arranged on a South Indian plate" fill sizes="(max-width: 600px) 230px, 290px" className={styles.foodPhoto} /></div> : chapter.id === 'moments' ? <JournalArtwork /> : <PerspectiveArtwork />}
            <span className={`${styles.floatingLabel} ${styles.labelOne}`}>{chapter.id === 'food' ? 'Familiar flavours' : chapter.id === 'moments' ? 'A meal. A walk. A moment.' : 'The bigger picture'}</span>
            <span className={`${styles.floatingLabel} ${styles.labelTwo}`}>{chapter.id === 'food' ? 'Your kind of everyday' : chapter.id === 'moments' ? 'The details belong together' : 'Illustration · not glucose data'}</span>
          </div>
          <div className={styles.caption}><span className={styles.chapterNumber}>0{active + 1} / 03</span><h3>{chapter.title}</h3><p>{chapter.description}</p></div>
        </div>
      </div>
    </section>
    <div className={styles.closing}>
      <section className={styles.kindness}><Heart size={22} strokeWidth={1.4} aria-hidden="true" /><div><h2>A gentler kind of tracking.</h2><p>Glucose numbers are information. They don’t define your effort, your worth, or your day.</p></div></section>
      <section className={styles.community}><div><span className={styles.kicker}>STILL TAKING SHAPE, WITH YOU</span><p>Everyday experience makes better ideas.</p></div><button type="button" onClick={() => setActiveSection('feedback')}>Share an idea <ArrowUpRight size={17} aria-hidden="true" /></button></section>
    </div>
    <TeamSection members={teamMembers} />
  </div>;
}
