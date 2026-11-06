'use client';

import React, { useState } from 'react';

// Shows a supplied photo. If the file is missing, shows a plain warm panel with the same framing,
// so the layout never breaks and no broken-image icon appears.
export default function FoodPhoto({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-coral-300/70 via-cream to-lavender-200 dark:from-coral-500/30 dark:via-lavender-950 dark:to-lavender-900 ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
