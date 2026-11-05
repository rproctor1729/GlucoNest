'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const { setActiveSection } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white pb-16 transition-colors dark:border-slate-800/80 dark:bg-[#0c1218] xl:pb-0 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              A community-driven T1D companion built with the Indian Type-1 diabetes community in mind.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Application
            </h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setActiveSection('my-day')} className="hover:text-slate-900 dark:hover:text-white">
                  My Day
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('quick-log')} className="hover:text-slate-900 dark:hover:text-white">
                  Quick Log
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('insights')} className="hover:text-slate-900 dark:hover:text-white">
                  My Insights
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('food-library')} className="hover:text-slate-900 dark:hover:text-white">
                  Food Library
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Community & Resources
            </h5>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setActiveSection('learn-community')} className="hover:text-slate-900 dark:hover:text-white">
                  Learn & Community
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('feedback')} className="hover:text-slate-900 dark:hover:text-white">
                  Help Shape GlucoNest
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('about')} className="hover:text-slate-900 dark:hover:text-white">
                  About GlucoNest
                </button>
              </li>
              <li>
                <button onClick={() => setActiveSection('legal')} className="hover:text-slate-900 dark:hover:text-white">
                  Privacy, terms &amp; contact
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
            © {new Date().getFullYear()} GlucoNest · v0.1
          </div>
          <div className="text-center sm:text-right">
            Educational only; not a substitute for professional medical advice or care.
          </div>
        </div>
      </div>
    </footer>
  );
}
