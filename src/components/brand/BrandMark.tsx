import React from 'react';

// The GlucoNest mark: a dial arc with a warm dot. Decorative, so it is hidden from screen readers.
export default function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gn-brand-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#83ada0" />
          <stop offset="1" stopColor="#2f4c46" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#gn-brand-grad)" />
      <path d="M9.5 27 A 13.5 13.5 0 0 1 30.5 27" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.92" />
      <circle cx="20" cy="27" r="3.4" fill="#fcd34d" />
    </svg>
  );
}
