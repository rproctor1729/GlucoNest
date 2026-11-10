'use client';

import { useEffect, useState } from 'react';
import { Menu, Plus, ShieldAlert, X } from 'lucide-react';
import BrandMark from '@/components/brand/BrandMark';
import Sidebar from './Sidebar';
import { workspaceNavigation } from '@/data/workspaceNavigation';
import { useApp } from '@/context/AppContext';
import type { NavigationSection } from '@/types';
import Preferences from './Preferences';

export default function Navbar({ collapsed, onToggleCollapsed }: { collapsed: boolean; onToggleCollapsed: () => void }) {
  const { activeSection, setActiveSection, triggerHypoEmergency, language } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = activeSection === 'home';
  useEffect(() => { setMenuOpen(false); }, [activeSection]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const navigation = workspaceNavigation(language);
  const items = [...navigation.main, ...navigation.bottom];
  const go = (section: NavigationSection) => { setActiveSection(section); setMenuOpen(false); };
  return <>
    <a href="#main-content" className="skip-link" onClick={event => {
      event.preventDefault();
      const main = document.getElementById('main-content');
      main?.focus({ preventScroll: true });
      main?.scrollIntoView({ block: 'start' });
    }}>Skip to content</a>
    <header className={`site-header ${isHome ? 'landing-header' : 'workspace-header'}`}>
      <button className={`brand-button ${!isHome ? 'workspace-header-brand' : ''}`} onClick={() => go('home')} aria-label="GlucoNest home"><BrandMark className="h-9 w-9" /><span>GlucoNest<span className="brand-period">.</span></span></button>
      {isHome ? <nav className="landing-nav" aria-label="Main navigation"><button onClick={() => go('food-library')}>Food Library</button><button onClick={() => go('knowledge-hub')}>Knowledge Hub</button><button onClick={() => go('about')}>Our Story</button></nav> : <div className="header-breadcrumb"><strong>{items.find(item => item.id === activeSection)?.label || (activeSection === 'quick-log' ? 'Log' : 'Privacy & terms')}</strong></div>}
      <div className="header-controls">
        <Preferences />
        <button type="button" className="sos-button" aria-label="Hypo SOS" onClick={triggerHypoEmergency}><ShieldAlert size={16} /><span>Hypo SOS</span></button>
        <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="workspace-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
    {menuOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <Sidebar collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} open={menuOpen} onClose={() => setMenuOpen(false)} home={isHome} />
    {!isHome && <nav className="mobile-bottom-nav" aria-label="Quick navigation">{navigation.main.slice(0, 3).map(({ id, label, icon: Icon }) => <button key={id} aria-current={activeSection === id ? 'page' : undefined} onClick={() => go(id)}><Icon size={18} strokeWidth={1.5} /><span>{label}</span></button>)}<button type="button" aria-label="Log" aria-current={activeSection === 'quick-log' ? 'page' : undefined} onClick={() => go('quick-log')}><Plus size={18} strokeWidth={1.5} aria-hidden="true" /><span>Log</span></button></nav>}
  </>;
}
