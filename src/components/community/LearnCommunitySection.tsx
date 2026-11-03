'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { EducationalGuide } from '@/types';
import {
  BookOpen,
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
  ArrowRight,
} from 'lucide-react';

const communityProfiles = [
  { id: 'goutham', name: 'Goutham Ravulapally', initials: 'GR', location: 'Hyderabad', avatarClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200' },
  { id: 'gayathri', name: 'Gayathri Gandrakota', initials: 'GG', location: 'Hyderabad', avatarClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' },
  { id: 'girish', name: 'Girish Jain', initials: 'GJ', location: 'Hyderabad', avatarClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-200' },
  { id: 'varun', name: 'Varun Rudra', initials: 'VR', location: 'Hyderabad', avatarClass: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200' },
];

export default function LearnCommunitySection() {
  const {
    guides,
    triggerHypoEmergency,
    setIsReportModalOpen,
    setActiveSection,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'guides' | 'stories'>('guides');
  const [selectedProfile, setSelectedProfile] = useState<(typeof communityProfiles)[number] | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<EducationalGuide | null>(null);
  const [isShareStoryOpen, setIsShareStoryOpen] = useState(false);
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
            Practical everyday T1D guides and a thoughtful space for community stories.
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
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Living with T1D — Hyderabad Community
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Different journeys. Shared experiences. A community that understands.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsShareStoryOpen(true)}
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-nest-500 hover:text-nest-700 dark:hover:text-nest-300 transition-colors"
            >
              Share your story
            </button>
          </div>

          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Living with Type-1 diabetes looks different for everyone. Explore experiences from people around you, learn from one another and remember that you are not alone.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityProfiles.map((profile) => (
              <article
                key={profile.id}
                className="flex min-h-[190px] flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131b24] p-5 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${profile.avatarClass}`}
                    >
                      {profile.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{profile.name}</h4>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{profile.location}</p>
                    </div>
                    <span className="ml-auto shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                      Sample profile
                    </span>
                  </div>
                  <h5 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    A story to be shared
                  </h5>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    No personal story has been provided or approved for publication yet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProfile(profile)}
                  className="mt-4 self-start text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
                >
                  Read story
                </button>
              </article>
            ))}
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            These are sample profile placeholders, not testimonials. Stories and categories will appear only after each person has reviewed and approved their content.
          </p>
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

      {/* Sample Profile Story Placeholder */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div
            className="w-full max-w-xl bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-story-title"
          >
            <div className="px-5 py-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                Sample profile · Category not assigned
              </span>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close story placeholder"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${selectedProfile.avatarClass}`}
                >
                  {selectedProfile.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedProfile.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedProfile.location}</p>
                </div>
              </div>
              <div>
                <h2 id="community-story-title" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  A story to be shared
                </h2>
                <span className="mt-2 inline-flex rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                  Illustrative placeholder — not a testimonial
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-[#0f161e] p-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                This space is reserved for words the author chooses to share. No personal experience or medical details have been supplied for this sample profile, so there is no story to display yet.
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Personal takeaway</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  No takeaway will be shown unless the author provides and approves one.
                </p>
              </div>
            </div>

            <div className="px-5 py-4 sm:px-6 bg-slate-50 dark:bg-[#0f161e] border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isShareStoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-story-title"
          >
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
              <div>
                <h2 id="share-story-title" className="text-lg font-bold">Share your story</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  This prototype does not collect or publish stories here. You can use Help Shape GlucoNest to express interest in contributing. A story would be shared only after its author reviews and approves it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareStoryOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close share story information"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f161e] p-4 sm:px-6">
              <button
                type="button"
                onClick={() => setIsShareStoryOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Maybe later
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsShareStoryOpen(false);
                  setActiveSection('feedback');
                }}
                className="px-4 py-2 rounded-xl bg-nest-600 hover:bg-nest-700 text-white text-xs font-semibold"
              >
                Go to Help Shape GlucoNest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
