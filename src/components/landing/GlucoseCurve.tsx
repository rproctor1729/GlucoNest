import React from 'react';

// The signature line: a glucose-style curve with a meal rise and a gentle recovery.
// It has no axes or values, so it never reads as a real reading. Decorative only.
export default function GlucoseCurve({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 200" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gn-curve-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a598d6" />
          <stop offset="0.55" stopColor="#7564b0" />
          <stop offset="1" stopColor="#7fa893" />
        </linearGradient>
      </defs>
      <path
        pathLength={1}
        d="M0 150 C40 150 60 110 100 120 S150 170 190 140 S240 60 280 80 S340 150 400 110"
        fill="none"
        stroke="url(#gn-curve-stroke)"
        strokeWidth="4"
        strokeLinecap="round"
        className="gn-draw"
      />
    </svg>
  );
}
