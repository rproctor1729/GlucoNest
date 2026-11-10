'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import ReactBitsCarousel from './ReactBitsCarousel';
import { useApp } from '@/context/AppContext';
import styles from './HeroCarousel.module.css';

const DURATION = 6500;
const slides = [
  { id: 'insulin', image: '/images/hero/insulin.jpg', alt: 'A person administering insulin into their abdomen as part of their daily routine', eyebrow: 'THE EVERYDAY ROUTINE', title: 'A little care.\nThen back to living.', position: '50% 58%', label: 'Insulin and everyday life' },
  { id: 'checking', image: '/images/hero/checking.jpg', alt: 'A woman holding a glucometer and checking her blood glucose at home', eyebrow: 'A MOMENT TO CHECK IN', title: 'Your numbers.\nYour next moment.', position: '66% 50%', label: 'Checking glucose at home' },
  { id: 'unicorn', image: '/images/hero/meter.jpg', alt: 'Hands holding a glucometer in a sunlit room, with diabetes supplies on a nearby table', eyebrow: 'THE LITTLE WINS, TOO', title: 'Caught a unicorn.\nTake the little win.', position: '50% 54%', label: 'The 100 mg/dL unicorn moment' },
] as const;

export default function HeroCarousel() {
  const { darkMode } = useApp();
  const [active, setActive] = useState(0);
  const [requested, setRequested] = useState(false);
  const [loaded, setLoaded] = useState<boolean[]>([false, false, false]);
  const rotationBeforePointerFocus = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { if (motion.matches) setRequested(false); };
    setRequested(!motion.matches);
    motion.addEventListener('change', updateMotion);
    return () => motion.removeEventListener('change', updateMotion);
  }, []);

  const items = slides.map((slide, index) => <div key={slide.id} className={`${styles.scene} ${slide.id === 'unicorn' ? styles.unicorn : ''}`}>
    <Image src={slide.image} alt={slide.alt} fill priority={index === 0} loading={index === 0 ? undefined : 'eager'} sizes="(max-width: 767px) 88vw, (max-width: 1150px) 45vw, 520px" className={styles.photo} style={{ objectPosition: slide.position }} draggable={false}
      onLoad={() => setLoaded(previous => previous[index] ? previous : previous.map((value, i) => i === index ? true : value))} />
    {slide.id === 'unicorn' && <div className={styles.unicornReading} aria-label="Illustrative reading of 100 milligrams per deciliter">
      <span className={styles.unicornLabel}><span aria-hidden="true">🦄</span> THE UNICORN MOMENT</span>
      <div><strong>100</strong><span>mg/dL</span></div>
      <small>Illustrative reading</small>
    </div>}
    <div className={styles.shade} />
    <div className={styles.caption}><span>{slide.eyebrow}</span><p>{slide.title}</p></div>
  </div>);

  return <div className={styles.carousel} onFocusCapture={() => setRequested(false)}>
    <ReactBitsCarousel items={items} baseWidth="100%" aspectRatio={1.08} viewportAspectRatio="var(--hero-carousel-ratio)"
      effect="tilt" indicator="bars" radius={24} frame arrows loop draggable
      autoplay={requested && loaded.every(Boolean)} autoplayDelay={DURATION} pauseOnHover
      theme={darkMode ? 'dark' : 'light'} ariaLabel="Everyday life with type 1"
      onChange={setActive} onInteraction={() => setRequested(false)}
      rotationControl={<button type="button" data-rotation-control className="rb-carousel-arrow"
        aria-label={requested ? 'Pause slideshow' : 'Play slideshow'}
        onPointerDown={() => { rotationBeforePointerFocus.current = requested; }}
        onClick={event => setRequested(event.detail > 0 ? !rotationBeforePointerFocus.current : !requested)}>
        {requested ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
      </button>} />
    <span className="sr-only" role="status" aria-live={requested ? 'off' : 'polite'}>{`Photo ${active + 1} of ${slides.length}: ${slides[active].label}`}</span>
  </div>;
}
