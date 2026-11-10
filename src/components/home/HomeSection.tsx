'use client';

import { useApp } from '@/context/AppContext';
import HeroCarousel from './HeroCarousel';
import FaqSection from './FaqSection';
import FeatureSection from './FeatureSection';

export default function HomeSection() {
  const { setActiveSection } = useApp();
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="section-kicker"><span className="status-dot" /> A LITTLE CLARITY. A LOT MORE LIVING.</p>
          <h1 id="home-title">Life is bigger<br />than your<br /><em>glucose numbers.</em></h1>
          <p className="hero-description">Meet your everyday type 1 companion. A thoughtful space to track, understand, and make room for everything else that makes you, you.</p>
        </div>
        <HeroCarousel />
      </section>
      <FeatureSection onNavigate={setActiveSection} />

      <FaqSection onNavigate={setActiveSection} />
    </div>
  );
}
