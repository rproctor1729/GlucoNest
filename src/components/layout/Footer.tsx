'use client';

import { ArrowRight, ShieldCheck } from 'lucide-react';
import BrandMark from '@/components/brand/BrandMark';
import { useApp } from '@/context/AppContext';
import { NavigationSection } from '@/types';

export default function Footer() {
  const { setActiveSection, activeSection } = useApp();
  const home = activeSection === 'home';
  const links: { label: string; section: NavigationSection }[] = [{ label: 'Our story', section: 'about' }, { label: 'Help shape GlucoNest', section: 'feedback' }, { label: 'Privacy & terms', section: 'legal' }];
  return <footer className={`site-footer ${home ? 'home-footer' : 'app-footer'}`}>
    {home && <div className="footer-top"><div><div className="flex items-center gap-3"><BrandMark className="h-10 w-10" /><span className="text-2xl font-semibold tracking-tight">GlucoNest.</span></div><p>A little clarity for your numbers.<br />A little more room for your life.</p></div><button onClick={() => setActiveSection('my-day')}>Make yourself at home <ArrowRight size={21} /></button></div>}
    <div className="footer-bottom"><span>© {new Date().getFullYear()} GlucoNest</span><nav aria-label="Footer navigation">{links.map(link => <button key={link.section} onClick={() => setActiveSection(link.section)}>{link.label}</button>)}</nav></div>
    <p className="footer-disclaimer"><ShieldCheck size={14} /> Educational self-tracking only. Not a medical device or a replacement for your care team or CGM alarms.</p>
  </footer>;
}
