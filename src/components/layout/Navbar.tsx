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
  Globe2,
  ChevronDown,
  Home,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import { APP_LANGUAGES, AppLanguage, translate } from '@/lib/i18n';

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
    language,
    setLanguage,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openNavGroup, setOpenNavGroup] = useState<string | null>(null);

  const navItems: Array<{ id: NavigationSection; label: string }> = [
    { id: 'my-day', label: translate(language, 'nav.myDay') },
    { id: 'devices', label: translate(language, 'nav.devices') },
    { id: 'quick-log', label: translate(language, 'nav.quickLog') },
    { id: 'insights', label: translate(language, 'nav.insights') },
    { id: 'food-library', label: translate(language, 'nav.food') },
    { id: 'learn-community', label: translate(language, 'nav.learn') },
    { id: 'about', label: translate(language, 'nav.about') },
    { id: 'feedback', label: translate(language, 'nav.feedback') },
  ];
  const navGroups = [
    { label: 'Track', items: navItems.filter((item) => ['my-day', 'devices', 'quick-log'].includes(item.id)) },
    { label: 'Understand', items: navItems.filter((item) => ['insights', 'food-library'].includes(item.id)) },
    { label: 'Community', items: navItems.filter((item) => ['learn-community', 'about', 'feedback'].includes(item.id)) },
  ];

  const handleNavClick = (id: NavigationSection) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-[#0c1218]/95 print:hidden">
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

        <nav className="hidden 2xl:flex flex-1 items-center justify-center gap-1" aria-label="Main navigation">
          {navGroups.map((group) => {
            const groupIsActive = group.items.some((item) => item.id === activeSection);
            const expanded = openNavGroup === group.label;
            return (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenNavGroup(expanded ? null : group.label)}
                  aria-expanded={expanded}
                  className={`inline-flex h-9 items-center gap-1 rounded-xl border px-3 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 ${
                    groupIsActive
                      ? 'border-nest-200 bg-nest-50 text-nest-800 dark:border-nest-800 dark:bg-nest-950/40 dark:text-nest-300'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {group.label}
                  <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleNavClick(item.id);
                          setOpenNavGroup(null);
                        }}
                        aria-current={activeSection === item.id ? 'page' : undefined}
                        className={`block min-h-10 w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                          activeSection === item.id
                            ? 'bg-nest-50 text-nest-800 dark:bg-nest-950/50 dark:text-nest-200'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <label className="hidden h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:flex">
            <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as AppLanguage)}
              className="max-w-[4.5rem] bg-transparent text-[11px] font-semibold outline-none"
              aria-label="Language"
            >
              {APP_LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>{item.shortLabel}</option>
              ))}
            </select>
          </label>
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
          <div className="grid grid-cols-1 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800 sm:grid-cols-3">
            {navGroups.map((group) => (
              <section key={group.label} aria-label={`${group.label} navigation`}>
                <h2 className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{group.label}</h2>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      aria-current={activeSection === item.id ? 'page' : undefined}
                      className={`min-h-10 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 ${
                        activeSection === item.id
                          ? 'bg-nest-600 text-white font-semibold'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>
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
          <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:hidden">
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            Language
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as AppLanguage)}
              className="ml-auto bg-transparent outline-none"
              aria-label="Language"
            >
              {APP_LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </header>
      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-[#0c1218]/95 xl:hidden">
        {[
          { id: 'my-day' as const, label: translate(language, 'nav.myDay'), Icon: Home },
          { id: 'quick-log' as const, label: translate(language, 'nav.quickLog'), Icon: ClipboardList },
          { id: 'insights' as const, label: translate(language, 'nav.insights'), Icon: TrendingUp },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleNavClick(id)}
            aria-current={activeSection === id ? 'page' : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 ${
              activeSection === id
                ? 'text-nest-700 dark:text-nest-300'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
