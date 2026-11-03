'use client';

import React from 'react';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function AboutSection() {
  return (
    <div className="space-y-8 sm:space-y-10 animate-fadeIn py-4">
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
            No login · No backend database · Prototype data stays in your browser
          </span>
        </div>
      </div>

      <section className="max-w-5xl mx-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131b24] p-5 sm:p-7 space-y-5">
        <div className="max-w-3xl space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built by People Living with T1D
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            GlucoNest is shaped by the everyday realities of living with Type-1 diabetes, particularly in India. It aims to make diabetes information more understandable, practical and non-judgmental.
          </p>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-nest-500" />
            <span>Our Community Language Charter</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Living with T1D involves making many extra decisions every day. Supportive, blame-free language helps keep glucose numbers neutral—not a measure of personal effort or worth.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-rose-900 dark:text-rose-300 space-y-1">
              <span className="font-bold line-through">Avoid: “You slipped up again.”</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Blame-free language recognizes that a glucose change is not a personal failure.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 space-y-1">
              <span className="font-bold">Prefer: “Your glucose rose. Here&apos;s something to try.”</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Supportive, practical wording treats numbers as neutral information.
              </p>
            </div>
          </div>
        </div>
      </section>

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

    </div>
  );
}
