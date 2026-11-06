'use client';

import React, { useEffect, useState } from 'react';

// Donut showing the share of time in range. It fills in once on mount, and the
// transition is removed for users who prefer reduced motion (see globals.css).
export default function TimeInRangeRing({
  percent,
  size = 132,
  label = 'in range',
}: {
  percent: number | null;
  size?: number;
  label?: string;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const target = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(target));
    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  const offset = circumference * (1 - shown / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img"
      aria-label={percent === null ? 'Time in range: not enough data yet' : `Time in range: ${target} percent ${label}`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="gn-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-slate-200/80 dark:stroke-white/10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="url(#gn-ring-grad)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
          {percent === null ? '—' : `${target}%`}
        </span>
        <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</span>
      </div>
    </div>
  );
}
