'use client';

// Adapted from React Bits ProfileCard. See licenses/react-bits.txt.
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { TeamMember } from '@/data/teamMembers';
import { springFrame } from '@/utils/carousel';
import styles from './ProfileCard.module.css';

function useProfileTilt() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const card = ref.current;
    if (!card || !window.matchMedia) return;
    const style = card.style;
    const motion = window.matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)');
    let x = { position: 0, velocity: 0, settled: true };
    let y = { ...x };
    let targetX = 0, targetY = 0, frame = 0, last = 0;

    function paint(now: number) {
      const seconds = (now - last) / 1000;
      last = now;
      x = springFrame(x.position, x.velocity, targetX, seconds);
      y = springFrame(y.position, y.velocity, targetY, seconds);
      style.setProperty('--tilt-x', String(x.position));
      style.setProperty('--tilt-y', String(y.position));
      frame = x.settled && y.settled ? 0 : requestAnimationFrame(paint);
    }
    function aim(horizontal: number, vertical: number) {
      targetX = horizontal;
      targetY = vertical;
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(paint);
      }
    }
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const axis = (offset: number, size: number) => Math.max(-1, Math.min(1, 2 * offset / size - 1));
      aim(axis(event.clientX - rect.left, rect.width), axis(event.clientY - rect.top, rect.height));
    };
    const release = () => { if (motion.matches && (frame || targetX || targetY)) aim(0, 0); };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = targetX = targetY = 0;
      x = { position: 0, velocity: 0, settled: true };
      y = { ...x };
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    };
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', release);
    card.addEventListener('pointercancel', release);
    motion.addEventListener('change', reset);
    return () => {
      reset();
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', release);
      card.removeEventListener('pointercancel', release);
      motion.removeEventListener('change', reset);
    };
  }, []);
  return ref;
}

export default function ProfileCard({ member, onOpen, children }: {
  member: TeamMember; onOpen: () => void; children: ReactNode;
}) {
  const ref = useProfileTilt();
  const [failedPhoto, setFailedPhoto] = useState<string>();
  return <article ref={ref} className={styles.profile}>
    <div className={styles.frame}>
      <div className={styles.tile}>
        <div className={styles.portrait}>
          {member.photo && member.photo !== failedPhoto
            ? <Image src={member.photo} fill sizes="(max-width: 600px) 94vw, (max-width: 1050px) 46vw, 360px"
                alt={`Portrait of ${member.firstName}`} draggable={false} onError={() => setFailedPhoto(member.photo)} />
            : <span className={styles.monogram} aria-hidden="true">{Array.from(member.firstName.trim())[0]}</span>}
        </div>
        <span className={styles.foil} aria-hidden="true" />
        <div className={styles.caption}><h3>{member.firstName}</h3><p>{member.tagline}</p></div>
      </div>
      <div className={styles.footer}>
        {children}
        <button type="button" aria-haspopup="dialog" aria-label={`Read my story — ${member.firstName}`}
          onClick={event => { event.currentTarget.focus(); onOpen(); }} className={styles.read}>
          Read my story <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  </article>;
}
