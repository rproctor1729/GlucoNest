'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { NavigationSection } from '@/types';
import {
  Sun,
  Moon,
  ShieldAlert,
  Plus,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const {
    activeSection,
    setActiveSection,
    darkMode,
    toggleDarkMode,
    glucoseUnit,
    toggleGlucoseUnit,
    triggerHypoEmergency,
    setIsOneTapModalOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: NavigationSection; label: string }> = [
    { id: 'my-day', label: 'My Day' },
    { id: 'devices', label: 'Devices & Data Sources' },
    { id: 'quick-log', label: 'Quick Log' },
    { id: 'insights', label: 'My Insights' },
    { id: 'food-library', label: 'Food Library' },
    { id: 'learn-community', label: 'Learn & Community' },
    { id: 'about', label: 'About GlucoNest' },
    { id: 'feedback', label: 'Feedback' },
  ];

  const handleNavClick = (id: NavigationSection) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0c1218]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center shrink-0 mr-2 xl:mr-4">
          <button
            type="button"
            onClick={() => handleNavClick('my-day')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 rounded-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-nest-500/15 dark:bg-nest-500/20 text-nest-600 dark:text-nest-400 flex items-center justify-center border border-nest-500/30 group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg font-mono">G</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
              GlucoNest
            </span>
          </button>
        </div>

        <nav className="hidden 2xl:flex flex-1 items-center justify-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`h-9 px-3 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 ${
                  isActive
                    ? 'bg-nest-50 dark:bg-nest-950/40 text-nest-800 dark:text-nest-300 border border-nest-200 dark:border-nest-800 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsOneTapModalOpen(true)}
            className="hidden 2xl:flex items-center gap-1 px-3 h-9 rounded-xl bg-nest-50 dark:bg-nest-950/40 text-nest-700 dark:text-nest-300 border border-nest-200 dark:border-nest-800 hover:bg-nest-100 dark:hover:bg-nest-950/60 text-xs font-semibold transition-all whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
            title="One-tap log: Carbs, insulin, or exercise in under 3 seconds"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>One-tap</span>
          </button>

          <button
            type="button"
            onClick={toggleGlucoseUnit}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
            title={`Toggle glucose unit: currently ${glucoseUnit}`}
          >
            {glucoseUnit}
          </button>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
            title={darkMode ? 'Switch to calm light mode' : 'Switch to soothing dark mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            type="button"
            onClick={triggerHypoEmergency}
            className="h-9 flex items-center gap-1.5 px-2 sm:px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold tracking-tight shadow-sm hover:shadow transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            title="One-tap Hypo SOS: Rule of 15, fast carbs, timer"
            aria-label="Hypo SOS"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline tracking-wide">Hypo SOS</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 flex items-center justify-center rounded-lg 2xl:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="2xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1218] p-4 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
                className={`h-10 py-2 px-3 rounded-xl text-xs text-left font-medium flex items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 ${
                  activeSection === item.id
                    ? 'bg-nest-600 text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOneTapModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full h-10 rounded-xl bg-nest-50 dark:bg-nest-950/40 text-nest-700 dark:text-nest-300 font-semibold text-xs border border-nest-200 dark:border-nest-800 flex items-center justify-center gap-1.5 hover:bg-nest-100 dark:hover:bg-nest-950/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
            >
              <Plus className="w-4 h-4" />
              <span>One-tap log (Carbs / Insulin / Activity)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
