'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, Heart, Sparkles, Lock, ArrowUp } from 'lucide-react';

export default function Footer() {
  const { setActiveSection } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1218] transition-colors">
      {/* Community & Ethics Pledge Banner */}
      <div className="bg-nest-50/70 dark:bg-nest-950/20 border-b border-nest-100 dark:border-nest-900/40 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nest-500/10 text-nest-600 dark:text-nest-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Personal T1D Community Prototype (India-First)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Core tracking free forever · Zero advertisements · Health data is never sold or brokered.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('about')}
            className="text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline flex items-center gap-1"
          >
            Read our founding pledge & philosophy →
          </button>
        </div>
      </div>

      {/* Main Footer Links & Voice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-nest-500/20 text-nest-600 dark:text-nest-400 flex items-center justify-center font-bold text-xs font-mono">
                G
              </div>
              <span className="font-semibold text-base text-slate-900 dark:text-white">
                GlucoNest
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              "Your glucose tells a story. We help you read it."
              <br />
              Built by diabetics, for diabetics.
            </p>
            <div className="text-[11px] text-slate-400">
              India-first Type-1 Diabetes community preview. Written like a friend who also checks their sensor at 3am.
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Application Tools
            </h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setActiveSection('my-day')} className="hover:text-slate-900 dark:hover:text-white">
                  My Day (Dashboard)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('quick-log')} className="hover:text-slate-900 dark:hover:text-white">
                  Quick Log (Meals, Insulin, Walk)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('insights')} className="hover:text-slate-900 dark:hover:text-white">
                  My Insights & Trajectories
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('food-library')} className="hover:text-slate-900 dark:hover:text-white">
                  Indian Food & Carb Library
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Community & Safety
            </h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setActiveSection('learn-community')} className="hover:text-slate-900 dark:hover:text-white">
                  Hypo Rule of 15 (Indian Fast Carbs)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('learn-community')} className="hover:text-slate-900 dark:hover:text-white">
                  Insulin Storage in Summer Heat & Power Cuts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('learn-community')} className="hover:text-slate-900 dark:hover:text-white">
                  Doctor Visit Preparation
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('feedback')} className="hover:text-slate-900 dark:hover:text-white font-medium text-nest-600 dark:text-nest-400">
                  Help Shape GlucoNest (Feedback)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              A Warm Reminder
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Glucose numbers are neutral data points, never a reflection of your worth or effort. Highs happen, lows happen; we learn and make tomorrow a little easier together.
            </p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to top</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} GlucoNest v0.1 Community Preview. Non-commercial solo prototype for the Indian T1D community.
          </div>
          <div className="text-center sm:text-right">
            Medical disclaimer: Educational and peer prototype; not connected to live CGMs and does not provide clinical diagnoses.
          </div>
        </div>
      </div>
    </footer>
  );
}
