'use client';

import React from 'react';
import { GLOSSARY, type GlossaryKey } from '@/utils/glossary';

// Shows a short abbreviation with its plain-language meaning on hover, focus and touch.
export default function GlossaryTerm({ term, children }: { term: GlossaryKey; children?: React.ReactNode }) {
  const entry = GLOSSARY[term];
  return (
    <abbr title={`${entry.term}: ${entry.plain}`} className="cursor-help underline decoration-dotted underline-offset-2">
      {children ?? term.toUpperCase()}
    </abbr>
  );
}
