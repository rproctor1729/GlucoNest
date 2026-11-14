'use client';

import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import type { TeamMember } from '@/data/teamMembers';
import { carouselIndex } from '@/utils/carousel';
import styles from './TeamCarousel.module.css';

const AUTOPLAY_MS = 6000;
const RESUME_AFTER_INTERACTION_MS = 9000;
const SWIPE_PX = 40;
const DRAG_GUARD_PX = 8;
// Depth from the centre: 0 = active, 1 = immediate neighbours, 2 = outer cards.
const SCALE_BY_DEPTH = [1, 0.8, 0.62];
const OPACITY_BY_DEPTH = [1, 0.7, 0.34];
// Background glow cycles through the palette so neighbouring profiles look different.
const GLOWS = ['rgba(139, 92, 246, 0.38)', 'rgba(59, 130, 246, 0.32)', 'rgba(245, 158, 11, 0.3)'];

// Signed distance from the active card, wrapped so the carousel loops without visible jumps.
function offsetFrom(index: number, active: number, count: number) {
  let offset = index - active;
  const half = count / 2;
  if (offset > half) offset -= count;
  if (offset < -half) offset += count;
  return offset;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function TeamCarousel({ members, onExplore }: {
  members: readonly TeamMember[];
  onExplore: (id: string) => void;
}) {
  const count = members.length;
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [resting, setResting] = useState(false);
  const reduced = usePrefersReducedMotion();
  const restTimer = useRef(0);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);

  useEffect(() => () => window.clearTimeout(restTimer.current), []);

  const current = carouselIndex(active, count);
  const go = (step: number) => setActive(value => carouselIndex(value + step, count));

  // Any manual move pauses autoplay for a while, so it never fights the visitor.
  const pauseBriefly = () => {
    setResting(true);
    window.clearTimeout(restTimer.current);
    restTimer.current = window.setTimeout(() => setResting(false), RESUME_AFTER_INTERACTION_MS);
  };

  const playing = count > 1 && !reduced && !hovered && !focused && !resting;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive(value => carouselIndex(value + 1, count)), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing, count]);

  if (count === 0) return null;

  const step = (direction: number) => {
    pauseBriefly();
    go(direction);
  };

  const bringToCentre = (index: number) => {
    pauseBriefly();
    setActive(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  };

  // Mouse drag and touch swipe share pointer events.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientX;
    dragged.current = false;
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== null && Math.abs(event.clientX - dragStart.current) > DRAG_GUARD_PX) dragged.current = true;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (start === null) return;
    const dx = event.clientX - start;
    if (Math.abs(dx) >= SWIPE_PX) step(dx < 0 ? 1 : -1);
  };

  // A drag that ends on a side card must not also count as a click on it.
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (dragged.current) {
      event.preventDefault();
      event.stopPropagation();
      dragged.current = false;
    }
  };

  const glow = GLOWS[current % GLOWS.length];

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Community profiles"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.glow} style={{ '--glow': glow } as CSSProperties} aria-hidden="true" />

      <div
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragStart.current = null; }}
        onClickCapture={onClickCapture}
      >
        {members.map((member, index) => {
          const offset = offsetFrom(index, current, count);
          const depth = Math.abs(offset);
          const hidden = depth > 2;
          const isCentre = offset === 0;
          const initial = Array.from(member.firstName.trim())[0];
          const style = {
            '--d': offset,
            '--abs': depth,
            '--scale': hidden ? 0.5 : SCALE_BY_DEPTH[depth],
            '--opacity': hidden ? 0 : OPACITY_BY_DEPTH[depth],
            zIndex: 10 - depth,
          } as CSSProperties;

          return (
            <article
              key={member.id}
              className={styles.card}
              style={style}
              data-abs={depth}
              data-centre={isCentre ? '' : undefined}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${member.firstName}`}
              aria-hidden={hidden || undefined}
              inert={hidden}
            >
              <div className={styles.portrait}>
                {member.photo
                  ? <Image src={member.photo} fill sizes="(max-width: 719px) 72vw, 310px"
                      alt={isCentre ? `Portrait of ${member.firstName}` : ''} draggable={false} />
                  : <span className={styles.monogram} aria-hidden="true">{initial}</span>}
                <span className={styles.shade} aria-hidden="true" />
              </div>

              {!hidden && (isCentre ? (
                <div className={styles.info}>
                  <h3>{member.firstName}</h3>
                  <p className={styles.tagline}>{member.tagline}</p>
                  <div className={styles.tags}><span>{member.role}</span><span>{member.diagnosedNote}</span></div>
                  <button type="button" className={styles.explore} aria-haspopup="dialog" onClick={event => { event.currentTarget.focus(); onExplore(member.id); }}>
                    Explore story <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <>
                  <span className={styles.sideName} aria-hidden="true">{member.firstName}</span>
                  <button type="button" className={styles.hit} aria-label={`Bring ${member.firstName} to the centre`} onClick={() => bringToCentre(index)} />
                </>
              ))}
            </article>
          );
        })}
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.arrow} aria-label="Previous profile" onClick={() => step(-1)}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <ol className={styles.dots} aria-label="Choose a profile">
          {members.map((member, index) => (
            <li key={member.id}>
              <button
                type="button"
                className={styles.dot}
                aria-label={`Show ${member.firstName}`}
                aria-current={index === current ? 'true' : undefined}
                onClick={() => bringToCentre(index)}
              />
            </li>
          ))}
        </ol>
        <button type="button" className={styles.arrow} aria-label="Next profile" onClick={() => step(1)}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
