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
  Sparkles,
  Heart,
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

  const navItems: Array<{ id: NavigationSection; label: string; badge?: string }> = [
    { id: 'my-day', label: 'My Day' },
    { id: 'quick-log', label: 'Quick Log' },
    { id: 'insights', label: 'My Insights' },
    { id: 'food-library', label: 'Food Library' },
    { id: 'learn-community', label: 'Learn & Community' },
    { id: 'about', label: 'About GlucoNest' },
    { id: 'feedback', label: 'Feedback', badge: 'Shape App' },
  ];

  const handleNavClick = (id: NavigationSection) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0c1218]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Eyebrow */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('my-day')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-nest-500/15 dark:bg-nest-500/20 text-nest-600 dark:text-nest-400 flex items-center justify-center border border-nest-500/30 group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg font-mono">G</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">
                  GlucoNest
                </span>
                <span className="hidden xl:inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-nest-50 dark:bg-nest-950/60 text-nest-700 dark:text-nest-300 font-medium border border-nest-200 dark:border-nest-800">
                  Built by diabetics, for diabetics
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
                Your glucose tells a story. We help you read it.
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-nest-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Controls & Emergency Pin */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* One-Tap Quick Log Shortcut */}
          <button
            type="button"
            onClick={() => setIsOneTapModalOpen(true)}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-nest-50 dark:bg-nest-950/40 text-nest-700 dark:text-nest-300 border border-nest-200 dark:border-nest-800 hover:bg-nest-100 dark:hover:bg-nest-950/60 text-xs font-semibold transition-all"
            title="One-tap log: Carbs, insulin, or exercise in under 3 seconds"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>One-tap</span>
          </button>

          {/* Unit Toggle: mg/dL <-> mmol/L */}
          <button
            type="button"
            onClick={toggleGlucoseUnit}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 transition-colors"
            title={`Toggle glucose unit: currently ${glucoseUnit}`}
          >
            {glucoseUnit}
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={darkMode ? 'Switch to calm light mode' : 'Switch to soothing dark mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Pinned Hypo Emergency Button */}
          <button
            type="button"
            onClick={triggerHypoEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold tracking-tight shadow-sm hover:shadow transition-all active:scale-95"
            title="One-tap Hypo SOS: Rule of 15, fast carbs, timer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="tracking-wide">Hypo SOS</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1218] p-4 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-2 px-3 rounded-xl text-xs text-left font-medium flex items-center justify-between ${
                  activeSection === item.id
                    ? 'bg-nest-600 text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 rounded bg-amber-400 text-slate-900 font-bold">
                    {item.badge}
                  </span>
                )}
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
              className="w-full py-2.5 rounded-xl bg-nest-50 dark:bg-nest-950/40 text-nest-700 dark:text-nest-300 font-semibold text-xs border border-nest-200 dark:border-nest-800 flex items-center justify-center gap-1.5"
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
