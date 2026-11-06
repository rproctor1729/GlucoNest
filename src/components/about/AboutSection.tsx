'use client';

import React from 'react';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Heart,
} from 'lucide-react';

const ethics = [
  {
    icon: CheckCircle2,
    title: '1. Core tracking free forever',
    body: 'Managing Type-1 in India is already expensive — imported CGM sensors, test strips, rapid insulin cartridges, and pen needles carry significant financial burden. You will never be paywalled from viewing your glucose curves or logging carbs.',
    accent: 'emerald',
  },
  {
    icon: Lock,
    title: '2. Zero ads, zero commercial distraction',
    body: 'Your headspace is precious. You will never see pharma advertisements, sponsored "miracle herbal cure" banners, or popup sales pitches interrupting your 3 AM hypo treatment.',
    accent: 'nest',
  },
  {
    icon: ShieldCheck,
    title: '3. Health data is NEVER sold or monetized',
    body: "All interactions in this prototype reside exclusively inside your browser's localStorage. We have no backend databases, no trackers, and no interest in monetizing or selling health information. Data is stored unencrypted in this browser, so on a shared device, clear this site's data when you are done.",
    accent: 'rose',
  },
  {
    icon: Sparkles,
    title: '4. Built for the reality of Indian life',
    body: 'Western apps assume oatmeal, bagels, and temperate weather. GlucoNest centers around idlis, rotis, biryanis, summer heat insulin storage in clay pots, and celebrating festivals with self-compassion.',
    accent: 'amber',
  },
] as const;

// Each accent maps to a fixed set of classes, so Tailwind can see every class at build time.
const accentClasses = {
  emerald: {
    icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_28px_-6px_rgba(16,185,129,0.6)]',
    hover: 'hover:border-emerald-500/40 hover:shadow-[0_0_32px_-14px_rgba(16,185,129,0.45)]',
  },
  nest: {
    icon: 'bg-nest-500/15 text-nest-600 dark:text-nest-300 shadow-[0_0_28px_-6px_rgba(92,145,131,0.6)]',
    hover: 'hover:border-nest-500/40 hover:shadow-[0_0_32px_-14px_rgba(92,145,131,0.45)]',
  },
  rose: {
    icon: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-[0_0_28px_-6px_rgba(244,63,94,0.55)]',
    hover: 'hover:border-rose-500/40 hover:shadow-[0_0_32px_-14px_rgba(244,63,94,0.4)]',
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_28px_-6px_rgba(245,158,11,0.55)]',
    hover: 'hover:border-amber-500/40 hover:shadow-[0_0_32px_-14px_rgba(245,158,11,0.4)]',
  },
} as const;

export default function AboutSection() {
  return (
    <div className="animate-fadeIn space-y-14 py-4 sm:space-y-20 sm:py-8">
      {/* Community preview notice: a floating, frosted callout with an amber accent */}
      <aside
        aria-labelledby="preview-title"
        className="mx-auto max-w-4xl rounded-2xl border border-amber-200/70 border-l-4 border-l-amber-400 bg-amber-50/70 p-6 shadow-[0_18px_40px_-24px_rgba(120,53,15,0.35)] backdrop-blur-md dark:border-amber-700/30 dark:border-l-amber-400 dark:bg-amber-950/25 dark:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300">
            <AlertCircle className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="space-y-3">
            <h2 id="preview-title" className="text-sm font-semibold text-amber-950 dark:text-amber-100">
              About This Community Preview (v0.1)
            </h2>
            <p className="text-sm leading-relaxed text-amber-950/85 dark:text-amber-100/85">
              This is an independent, non-commercial prototype. The objective is <strong>NOT</strong> to operate a production clinical healthcare platform or replace your medical team.
              It is built so fellow Type-1 warriors across India can explore the interface, test the Indian food carb library, experience calm non-judgmental tracking, and help shape what an ideal community companion should look like.
            </p>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              No login · No backend database · Prototype data stays in your browser
            </p>
          </div>
        </div>
      </aside>

      {/* Hero */}
      <section aria-labelledby="about-title" className="relative mx-auto max-w-4xl text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-10 h-72 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.16),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14),transparent_62%)]"
        />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          GlucoNest · Community
        </p>
        <h1
          id="about-title"
          className="relative mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
        >
          Built by People Living with T1D
        </h1>
        <p className="relative mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          GlucoNest is shaped by the everyday realities of living with Type-1 diabetes, particularly in India. It aims to make diabetes information more understandable, practical and non-judgmental.
        </p>
      </section>

      {/* Community language charter */}
      <section aria-labelledby="charter-title" className="mx-auto max-w-5xl space-y-8">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 id="charter-title" className="flex items-center justify-center gap-2 text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">
            <Compass className="h-5 w-5 text-nest-500" aria-hidden="true" />
            Our Community Language Charter
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Living with T1D involves making many extra decisions every day. Supportive, blame-free language helps keep glucose numbers neutral—not a measure of personal effort or worth.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <article className="group flex flex-col gap-4 rounded-2xl border border-rose-200/70 bg-rose-50/60 p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(244,63,94,0.45)] dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-400">Avoid</span>
            </div>
            <p className="font-display text-lg font-semibold leading-snug text-rose-950 dark:text-rose-100">“You slipped up again.”</p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Blame-free language recognizes that a glucose change is not a personal failure.
            </p>
          </article>

          <article className="group flex flex-col gap-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(16,185,129,0.45)] dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Heart className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">Prefer</span>
            </div>
            <p className="font-display text-lg font-semibold leading-snug text-emerald-950 dark:text-emerald-100">“Your glucose rose. Here&apos;s something to try.”</p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Supportive, practical wording treats numbers as neutral information.
            </p>
          </article>
        </div>
      </section>

      {/* Four ethics promises: bento grid, 2x2 on desktop and stacked on mobile */}
      <section aria-labelledby="ethics-title" className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h2 id="ethics-title" className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">
            Our Four Ethics Promises
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Stated plainly. Zero corporate fine print.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {ethics.map((item) => {
            const Icon = item.icon;
            const accent = accentClasses[item.accent];
            return (
              <article
                key={item.title}
                className={`group flex flex-col gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 transition duration-300 hover:-translate-y-1 sm:p-7 dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-sm ${accent.hover}`}
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-105 ${accent.icon}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="space-y-2.5">
                  <h3 className="text-lg font-semibold leading-snug text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
