'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { NavigationSection } from '@/types';
import GlucoseCurve from '@/components/landing/GlucoseCurve';
import FoodPhoto from '@/components/landing/FoodPhoto';

interface LandingPageProps {
  onEnter: (section?: NavigationSection) => void;
}

const doors: Array<{ section: NavigationSection; title: string; body: string; radius: string }> = [
  {
    section: 'my-day',
    title: 'Track your day',
    body: 'Readings, meals and insulin in one calm view.',
    radius: 'rounded-[2.25rem]',
  },
  {
    section: 'insights',
    title: 'Understand patterns',
    body: 'See how food, timing and movement show up in your own numbers.',
    radius: 'rounded-3xl',
  },
  {
    section: 'food-library',
    title: 'Explore everyday food',
    body: 'Indian meals with carb estimates. Estimates are marked as not lab-verified.',
    radius: 'rounded-3xl',
  },
  {
    section: 'knowledge-hub',
    title: 'Learn and belong',
    body: 'Guides and shared experiences from people who live with Type 1 diabetes.',
    radius: 'rounded-[2.25rem]',
  },
];

// Illustrative examples only. They are not readings, statistics or user stories.
const everydayMoments = [
  { text: 'Idli and sambar before work', position: 'left-0 top-4 sm:left-2', delay: '0s' },
  { text: 'A walk after dinner', position: 'right-0 top-[46%] sm:right-4', delay: '-2.5s' },
  { text: 'A late meeting, a missed snack', position: 'bottom-6 left-6 sm:left-16', delay: '-4.5s' },
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="space-y-16 sm:space-y-24">
      <section aria-labelledby="landing-title" className="grid items-center gap-10 pt-2 sm:pt-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-lavender-700 dark:text-lavender-300">
            GlucoNest
          </p>
          <h1
            id="landing-title"
            className="font-display text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-6xl dark:text-cream"
          >
            Your life is bigger than your glucose numbers.
          </h1>
          <p className="max-w-xl font-sans text-lg leading-relaxed text-ink/75 dark:text-cream/75">
            Understand your patterns, explore your food, and make sense of everyday life with Type 1 diabetes.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onEnter()}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-lavender-600 px-6 font-sans text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(86,64,150,0.8)] transition duration-300 hover:-translate-y-0.5 hover:bg-lavender-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-500 dark:bg-lavender-400 dark:text-lavender-950 dark:hover:bg-lavender-300"
            >
              Enter GlucoNest
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onEnter('about')}
              className="inline-flex h-12 items-center rounded-full px-5 font-sans text-sm font-semibold text-lavender-800 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-500 dark:text-lavender-200"
            >
              Read about GlucoNest
            </button>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden sm:aspect-[5/4] lg:max-w-none">
          <div aria-hidden="true" className="absolute inset-x-2 inset-y-10 rounded-[3rem] bg-gradient-to-br from-lavender-100 via-cream to-sage-300/50 dark:from-lavender-900/60 dark:via-lavender-950 dark:to-sage-500/10" />
          <GlucoseCurve className="absolute inset-x-6 top-1/2 w-[calc(100%-3rem)] -translate-y-1/2 drop-shadow-[0_6px_14px_rgba(86,64,150,0.25)]" />
          <div aria-hidden="true">
            {everydayMoments.map((moment) => (
              <p
                key={moment.text}
                className={`gn-float absolute ${moment.position} max-w-[11rem] rounded-2xl border border-white/80 bg-white/90 px-4 py-3 font-sans text-sm text-ink shadow-[0_10px_26px_-18px_rgba(31,27,46,0.5)] dark:border-white/5 dark:bg-lavender-950/90 dark:text-cream`}
                style={{ animationDelay: moment.delay }}
              >
                {moment.text}
              </p>
            ))}
            <p className="absolute bottom-1 right-2 font-sans text-[11px] text-ink/50 dark:text-cream/50">
              Illustration. Not your data.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="doors-title" className="space-y-6">
        <div className="space-y-2">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-lavender-700 dark:text-lavender-300">Four ways in</p>
          <h2 id="doors-title" className="font-display text-3xl font-semibold text-ink sm:text-4xl dark:text-cream">Start wherever your day starts.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doors.map((door) => (
            <button
              key={door.section}
              type="button"
              onClick={() => onEnter(door.section)}
              className={`group flex min-h-40 flex-col justify-between gap-6 border border-lavender-100 bg-white/80 p-6 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-22px_rgba(63,54,100,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-500 dark:border-white/5 dark:bg-lavender-950/60 ${door.radius}`}
            >
              <span className="font-display text-xl font-semibold text-ink dark:text-cream">{door.title}</span>
              <span className="font-sans text-sm leading-relaxed text-ink/70 dark:text-cream/70">{door.body}</span>
              <span className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-lavender-700 dark:text-lavender-300">
                Open
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="food-title" className="grid items-center gap-8 lg:grid-cols-2">
        <FoodPhoto
          src="/images/indian-meal.webp"
          alt="Idli and sambar served on a steel plate"
          className="aspect-[4/3] w-full rounded-[2.5rem]"
        />
        <div className="space-y-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-coral-500 dark:text-coral-300">Food that fits your kitchen</p>
          <h2 id="food-title" className="font-display text-3xl font-semibold text-ink sm:text-4xl dark:text-cream">Idli, dal, roti, and the rest of your week.</h2>
          <p className="font-sans text-base leading-relaxed text-ink/75 dark:text-cream/75">
            The food library covers everyday Indian meals. Carb values are estimates for planning and logging. Confirm them with your care team or dietitian.
          </p>
        </div>
      </section>

      <section aria-labelledby="identity-title" className="rounded-[2.5rem] bg-lavender-950 px-6 py-12 text-center text-cream sm:px-12 sm:py-16 dark:bg-lavender-900/70">
        <h2 id="identity-title" className="font-display text-3xl font-semibold sm:text-4xl">Built by diabetics, for diabetics.</h2>
        <p className="mx-auto mt-4 max-w-2xl font-sans text-base leading-relaxed text-cream/80">
          GlucoNest is designed around the everyday experience of Type 1 diabetes, with the people who live it.
        </p>
        <button
          type="button"
          onClick={() => onEnter('about')}
          className="mt-8 inline-flex h-11 items-center rounded-full border border-cream/30 px-5 font-sans text-sm font-semibold text-cream transition duration-300 hover:bg-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          Read our principles
        </button>
      </section>

      <p className="mx-auto max-w-2xl pb-4 text-center font-sans text-xs leading-relaxed text-ink/60 dark:text-cream/60">
        GlucoNest is a logging and learning tool. It is not a medical device and does not give dosing advice. In a low, use Hypo SOS and follow the Rule of 15.
      </p>
    </div>
  );
}
