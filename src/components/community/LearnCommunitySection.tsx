'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { EducationalGuide } from '@/types';
import {
  BookOpen,
  ShieldAlert,
  Clock,
  ChevronRight,
  X,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react';

export default function LearnCommunitySection() {
  const { guides, setActiveSection } = useApp();

  const [activeTab, setActiveTab] = useState<'guides' | 'stories'>('guides');
  const [selectedGuide, setSelectedGuide] = useState<EducationalGuide | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const emergencyGuide = guides.find((g) => g.isEmergency) || guides[0];
  const clinicalGuides = guides.filter((g) => !g.isEmergency);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-nest-500/10 text-nest-600 dark:text-nest-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Learn & Community
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Practical everyday T1D guides. Your diabetes care team makes treatment decisions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('guides')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'guides'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Practical Guides
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'stories'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Lived-Experience Stories
          </button>
        </div>
      </div>

      {/* Pinned Hypo Emergency Protocol Card */}
      <div className="bg-rose-50/70 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Pinned Emergency Protocol
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                &quot;I&apos;m having a hypo — what do I do?&quot; (Rule of 15)
              </h3>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          The universal <strong>Rule of 15</strong>: Fast, simple steps when blood glucose falls below 70 mg/dL (3.9 mmol/L). If someone is confused, choking, or unconscious, do not give food or drink by mouth. Call emergency services.
        </p>

        {/* 5-step quick ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-900/40">
            <span className="font-bold text-rose-600 block mb-0.5">1. Pause</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">Sit down and halt all physical effort.</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-900/40">
            <span className="font-bold text-rose-600 block mb-0.5">2. 15g Fast</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">1 tbsp Glucon-D or small Frooti pack.</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-900/40">
            <span className="font-bold text-rose-600 block mb-0.5">3. 15 Min</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">Wait before eating more food.</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-900/40">
            <span className="font-bold text-rose-600 block mb-0.5">4. Recheck</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">Verify if above 70 mg/dL.</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-900/40">
            <span className="font-bold text-rose-600 block mb-0.5">5. Snack</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">Complex carb if meal &gt;1h away.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedGuide(emergencyGuide)}
          className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Read complete hypoglycaemia guide & glucagon helper rules</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TAB CONTENT: GUIDES */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Practical Lived & Educational Guides
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinicalGuides.map((guide) => (
              <button
                type="button"
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className="text-left bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {guide.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{guide.readTime}</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-nest-600 dark:group-hover:text-nest-400 transition-colors">
                    {guide.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {guide.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-nest-600 dark:text-nest-400">
                  <span>Read full guide & checklist</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STORIES (placeholder until real, consented stories exist) */}
      {activeTab === 'stories' && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131b24] p-6 sm:p-8 space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No stories published yet</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Lived-experience stories will appear here only after their authors have written them and approved them for publication. This prototype does not show example or placeholder stories.
          </p>
          <button
            type="button"
            onClick={() => setActiveSection('feedback')}
            className="text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline"
          >
            Tell us if you would like to contribute
          </button>
        </div>
      )}

      {/* Guide Details Reader Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedGuide.category} · {selectedGuide.readTime}
              </span>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {selectedGuide.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedGuide.summary}
                </p>
              </div>

              {/* Interactive Checklist if present */}
              {selectedGuide.checklistItems && selectedGuide.checklistItems.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f161e] border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Interactive Checklist:
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedGuide.checklistItems.map((item) => {
                      const isChecked = !!checkedItems[item];
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleCheck(item)}
                          className="w-full text-left flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className={isChecked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Body Sections */}
              <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedGuide.bodySections.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {sec.heading}
                    </h3>
                    <p className="whitespace-pre-line">{sec.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0f161e] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Educational reference only. Confirm dosing and sick-day decisions with your care team.
              </span>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="shrink-0 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
