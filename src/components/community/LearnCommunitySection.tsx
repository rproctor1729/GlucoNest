'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CommunityStory, EducationalGuide } from '@/types';
import {
  BookOpen,
  Heart,
  ShieldAlert,
  Clock,
  Thermometer,
  Sun,
  Train,
  CalendarCheck,
  CheckSquare,
  Square,
  ChevronRight,
  X,
  FileText,
  Printer,
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react';

export default function LearnCommunitySection() {
  const {
    stories,
    toggleStoryHeart,
    guides,
    triggerHypoEmergency,
    setIsReportModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'guides' | 'stories'>('guides');
  const [selectedStory, setSelectedStory] = useState<CommunityStory | null>(null);
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
            Lived experiences and practical everyday T1D guides for India. Sample peer wisdom, zero corporate speak.
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
                "I'm having a hypo — what do I do?" (Rule of 15)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={triggerHypoEmergency}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open 15-Minute Hypo Timer & SOS</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          The universal <strong>Rule of 15</strong>: Fast, simple steps when blood glucose falls below 70 mg/dL (3.9 mmol/L).
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

      {/* Doctor-Ready Report Banner */}
      <div className="bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-nest-100 dark:bg-nest-950 text-nest-700 dark:text-nest-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Doctor-ready report</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Ambulatory Glucose Profile (AGP) PDF Export
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
            Generate clean 14, 30, or 90-day clinical reports with TIR %, mean glucose, GMI estimate, CV %, and sample daily logs to hand to your care team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Generate Doctor Report</span>
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
              <div
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sample Community Lived Experiences
            </h3>
            <span className="text-xs text-slate-400">Sample peer narratives</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <article
                key={story.id}
                className="bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-subtle flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {story.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{story.readTime}</span>
                    </span>
                  </div>

                  <h4
                    onClick={() => setSelectedStory(story)}
                    className="text-lg font-bold text-slate-900 dark:text-white hover:text-nest-600 dark:hover:text-nest-400 cursor-pointer leading-snug transition-colors"
                  >
                    {story.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {story.summary}
                  </p>

                  {story.takeaways && story.takeaways.length > 0 && (
                    <div className="p-3 bg-nest-50/50 dark:bg-nest-950/20 rounded-xl border border-nest-100 dark:border-nest-900/30 text-xs text-nest-800 dark:text-nest-300">
                      <span className="font-semibold block uppercase tracking-wider text-[10px] text-nest-700 dark:text-nest-400 mb-0.5">
                        Lived Takeaway:
                      </span>
                      <p className="italic">"{story.takeaways[0]}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={story.authorAvatar}
                      alt={story.authorName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {story.authorName} {story.authorCity ? `(${story.authorCity})` : ''}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {story.authorT1DAge} · {story.authorGear}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStoryHeart(story.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        story.userLiked
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${story.userLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{story.hearts}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedStory(story)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                    >
                      Read
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
                    {selectedGuide.checklistItems.map((item, idx) => {
                      const isChecked = !!checkedItems[item];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleCheck(item)}
                          className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className={isChecked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                            {item}
                          </span>
                        </div>
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

            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0f161e] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Educational reference for people living with T1D
              </span>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Reader Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-nest-100 dark:bg-nest-950 text-nest-700 dark:text-nest-300">
                {selectedStory.category} · {selectedStory.readTime}
              </span>
              <button
                onClick={() => setSelectedStory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {selectedStory.title}
              </h2>

              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={selectedStory.authorAvatar}
                  alt={selectedStory.authorName}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedStory.authorName} {selectedStory.authorCity ? `(${selectedStory.authorCity})` : ''}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedStory.authorT1DAge} · {selectedStory.authorGear}
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedStory.fullStory.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0f161e] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-nest-600 dark:text-nest-400">
                  Key Lived Wisdom:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {selectedStory.takeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-nest-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0f161e] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleStoryHeart(selectedStory.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  selectedStory.userLiked
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${selectedStory.userLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{selectedStory.hearts} Hearts</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
