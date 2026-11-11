import React from 'react';

// Placeholder shown while a section's code is downloading. It keeps the page layout stable,
// so content does not jump in when the section arrives. The label is announced to screen readers.
export default function SectionSkeleton({ label = 'Opening your space…' }: { label?: string }) {
  return (
    <div className="gn-skeleton" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="gn-skeleton-block gn-skeleton-title" aria-hidden="true" />
      <div className="gn-skeleton-block gn-skeleton-line" aria-hidden="true" />
      <div className="gn-skeleton-grid" aria-hidden="true">
        <div className="gn-skeleton-block gn-skeleton-card" />
        <div className="gn-skeleton-block gn-skeleton-card" />
        <div className="gn-skeleton-block gn-skeleton-card" />
      </div>
    </div>
  );
}
