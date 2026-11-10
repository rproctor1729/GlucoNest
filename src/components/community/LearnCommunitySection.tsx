'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { EducationalGuide } from '@/types';
import {
  BookOpen,
  Clock,
  ChevronRight,
  X,
  CheckSquare,
  Square,
  ShieldAlert,
  Thermometer,
  Stethoscope,
  Compass,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function LearnCommunitySection() {
  const { guides, setActiveSection } = useApp();

  const [activeTab, setActiveTab] = useState<'guides' | 'stories'>('guides');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGuide, setSelectedGuide] = useState<EducationalGuide | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  // Distinct category filters
  const categories = useMemo(() => {
    const cats = ['All'];
    guides.forEach((g) => {
      if (!cats.includes(g.category)) {
        cats.push(g.category);
      }
    });
    return cats;
  }, [guides]);

  const filteredGuides = useMemo(() => {
    if (selectedCategory === 'All') return guides;
    return guides.filter((g) => g.category === selectedCategory);
  }, [guides, selectedCategory]);

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'Climate & Storage':
        return {
          badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60',
          hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
          takeawayBg: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/40 text-amber-900 dark:text-amber-200',
          takeaway: 'Traditional unglazed matka evaporative cooling keeps insulin safe at 20°C in 42°C Indian heat during power cuts.',
          Icon: Thermometer,
        };
      case 'Clinic & Endo':
        return {
          badge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/60',
          hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700',
          takeawayBg: 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200/60 dark:border-teal-800/40 text-teal-900 dark:text-teal-200',
          takeaway: 'Moving past single HbA1c tests: Time-In-Range (>70%) and CV (<36%) evaluate daily glycemic quality of life.',
          Icon: Stethoscope,
        };
      case 'Emergency':
        return {
          badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60',
          hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
          takeawayBg: 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/40 text-rose-900 dark:text-rose-200',
          takeaway: 'Rule of 15: 15g fast dextrose, pause 15 minutes before retesting to avoid dangerous rebound spikes.',
          Icon: ShieldAlert,
        };
      case 'Daily Life':
      default:
        return {
          badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60',
          hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
          takeawayBg: 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-200',
          takeaway: 'Critical sick-day rule: Never stop basal insulin during fever/infection even when fasting.',
          Icon: Compass,
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nest-500/20 to-teal-500/20 text-nest-600 dark:text-nest-400 flex items-center justify-center border border-nest-500/30 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-nest-700 dark:text-nest-300">
              Field-Tested Knowledge
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Practical Lived &amp; Educational Guides
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Distilled practical insights from endocrinologists and Type-1 veterans living with diabetes in India. Real life, Indian climates, food, and daily routines.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 text-xs border border-slate-200/80 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('guides')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'guides'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Practical Guides ({guides.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'stories'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Lived Stories
          </button>
        </div>
      </div>

      {/* TAB CONTENT: GUIDES */}
      {activeTab === 'guides' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Filter guides by category">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5" /> Filter:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'All' ? guides.length : guides.filter((g) => g.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-nest-600 text-white border-nest-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Standout Editorial Guide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredGuides.map((guide) => {
              const config = getCategoryConfig(guide.category);
              const IconComponent = config.Icon;
              const checklistCount = guide.checklistItems?.length || 0;

              return (
                <button
                  type="button"
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`text-left rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0f1723]/95 p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden ${config.hoverBorder}`}
                >
                  {/* Subtle Top-Right Accent Watermark */}
                  <div className="absolute -right-4 -top-4 w-28 h-28 bg-gradient-to-br from-slate-100/40 dark:from-slate-800/20 to-transparent rounded-full pointer-events-none" />

                  <div className="space-y-3 relative">
                    {/* Category, Read Time, Checklist Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs ${config.iconBg}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${config.badge}`}>
                          {guide.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                        {checklistCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {checklistCount} steps
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {guide.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Guide Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-nest-600 dark:group-hover:text-nest-400 transition-colors leading-snug">
                      {guide.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {guide.summary}
                    </p>

                    {/* Key Practical Takeaway Callout */}
                    <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${config.takeawayBg}`}>
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />
                      <span className="font-medium">{config.takeaway}</span>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-nest-700 dark:text-nest-300">
                    <span className="group-hover:underline">Read full clinical guide &amp; action plan</span>
                    <div className="w-7 h-7 rounded-lg bg-nest-50 dark:bg-nest-950/60 border border-nest-200 dark:border-nest-800 flex items-center justify-center text-nest-600 dark:text-nest-300 group-hover:bg-nest-600 group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STORIES (placeholder until real, consented stories exist) */}
      {activeTab === 'stories' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0f1723]/95 p-6 sm:p-8 space-y-3 shadow-card">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Community Stories (In Progress)</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Lived-experience stories will appear here only after community members have authored and approved them. We uphold strict informed consent and do not show placeholder or synthetic stories.
          </p>
          <button
            type="button"
            onClick={() => setActiveSection('feedback')}
            className="text-xs font-semibold text-nest-700 dark:text-nest-300 hover:underline inline-flex items-center gap-1 pt-1"
          >
            <span>Have a lived experience to share? Tell us here</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Guide Details Reader Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0f1723] text-slate-900 dark:text-slate-100 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-nest-50 dark:bg-nest-950/60 text-nest-700 dark:text-nest-300 border border-nest-200/80 dark:border-nest-800">
                  {selectedGuide.category}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedGuide.readTime}
                </span>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                  {selectedGuide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {selectedGuide.summary}
                </p>
              </div>

              {/* Interactive Checklist if present */}
              {selectedGuide.checklistItems && selectedGuide.checklistItems.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/20 dark:from-slate-900/80 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Actionable Protocol Checklist</span>
                    </h4>
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      {Object.values(checkedItems).filter(Boolean).length} / {selectedGuide.checklistItems.length} checked
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {selectedGuide.checklistItems.map((item) => {
                      const isChecked = !!checkedItems[item];
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleCheck(item)}
                          className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40 text-slate-500'
                              : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className={`leading-relaxed text-xs ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'}`}>
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
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {sec.heading}
                    </h3>
                    <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#090e15] border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Educational reference only. Confirm dosing and medical decisions with your care team.
              </span>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
