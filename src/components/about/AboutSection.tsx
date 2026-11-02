'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Heart,
  ShieldCheck,
  Lock,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function AboutSection() {
  const { setActiveSection } = useApp();

  return (
    <div className="space-y-12 sm:space-y-16 animate-fadeIn py-4">
      {/* Hero Manifesto */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nest-100 dark:bg-nest-950 text-nest-700 dark:text-nest-300 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-nest-500 text-nest-500" />
          <span>Personal Community Prototype · India-First</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Built by diabetics, for diabetics.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          GlucoNest is a personal-interest, community-driven prototype created to rethink how people living with Type-1 Diabetes in India interact with their numbers, understand their food, and support one another.
        </p>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
          "Your glucose tells a story. We help you read it."
        </p>
      </div>

      {/* Prototype Objective & Transparency Notice */}
      <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>About This Community Preview (v0.1)</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
          This is an independent, non-commercial prototype. The objective is <strong>NOT</strong> to operate a production clinical healthcare platform or replace your medical team.
          It is built so fellow Type-1 warriors across India can explore the interface, test the Indian food carb library, experience calm non-judgmental tracking, and help shape what an ideal community companion should look like.
        </p>
        <div className="pt-1 flex items-center justify-between text-xs">
          <span className="text-amber-800 dark:text-amber-300 font-medium">
            Zero logins · Zero backend databases · 100% private to your browser
          </span>
          <button
            type="button"
            onClick={() => setActiveSection('feedback')}
            className="font-bold text-amber-900 dark:text-amber-100 hover:underline flex items-center gap-1"
          >
            <span>Share your feedback</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* The 4 Unbreakable Promises */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Our Four Ethics Promises
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stated plainly. Zero corporate fine print.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#131b24] p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Core tracking free forever
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Managing Type-1 in India is already expensive — imported CGM sensors, test strips, rapid insulin cartridges, and pen needles carry significant financial burden. You will never be paywalled from viewing your glucose curves or logging carbs.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131b24] p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-nest-500/10 text-nest-600 dark:text-nest-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Zero ads, zero commercial distraction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your headspace is precious. You will never see pharma advertisements, sponsored "miracle herbal cure" banners, or popup sales pitches interrupting your 3 AM hypo treatment.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131b24] p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Health data is NEVER sold or monetized
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All interactions in this prototype reside exclusively inside your browser's localStorage. We have no backend databases, no trackers, and no interest in monetizing or selling health information.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131b24] p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              4. Built for the reality of Indian life
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Western apps assume oatmeal, bagels, and temperate weather. GlucoNest centers around idlis, rotis, biryanis, summer heat insulin storage in clay pots, and celebrating festivals with self-compassion.
            </p>
          </div>
        </div>
      </div>

      {/* Language Charter: Neutral Numbers, No Guilt */}
      <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#131b24] border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-nest-500" />
          <span>Our Community Language Charter</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Living with T1D involves making 180 extra decisions every single day. Language shapes our mental health:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-rose-900 dark:text-rose-300 space-y-1">
            <span className="font-bold line-through">"You spiked again after dinner."</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Banned. Implies blame or personal failure.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 space-y-1">
            <span className="font-bold">"Your glucose rose. Here's something to try."</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Encouraging. Numbers are neutral feedback, not a moral report card.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback CTA */}
      <div className="max-w-2xl mx-auto text-center space-y-3 pt-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Help Us Build What You Actually Need
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Take 2 minutes to answer our 8 community feedback questions. Your voice will guide what gets built next.
        </p>
        <button
          type="button"
          onClick={() => setActiveSection('feedback')}
          className="px-6 py-2.5 rounded-xl bg-nest-600 hover:bg-nest-700 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Open Community Feedback Form</span>
        </button>
      </div>
    </div>
  );
}
