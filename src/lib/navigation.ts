import type { NavigationSection } from '@/types';

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  // insights and report are not listed: they open My Day on their own view (see sectionFromHash).
  'home', 'my-day', 'quick-log', 'food-library',
  'knowledge-hub', 't1d-essentials', 'go-to-doctors', 'about', 'feedback', 'devices', 'legal',
];

// My Day holds three views: today's readings, My Insights, and the Doctor report.
export type MyDayView = 'today' | 'insights' | 'report';

// Old section ids that now live inside My Day. Existing links such as #insights and #report keep working.
export const LEGACY_MY_DAY_SECTIONS: readonly NavigationSection[] = ['insights', 'report'];

export function myDayViewFromHash(hash: string): MyDayView {
  const section = hash.replace(/^#/, '');
  if (section === 'insights' || section === 'my-day/insights') return 'insights';
  if (section === 'report' || section === 'my-day/report') return 'report';
  return 'today';
}

// Document anchors (including the skip link) must not change the active tool.
export function sectionFromHash(hash: string): NavigationSection | null {
  const section = hash.replace(/^#/, '');
  if (section === 'learn-community') return 'knowledge-hub';
  if (section.startsWith('knowledge-hub/')) return 'knowledge-hub';
  if (section.startsWith('my-day/') || LEGACY_MY_DAY_SECTIONS.includes(section as NavigationSection)) return 'my-day';
  return NAVIGATION_SECTIONS.includes(section as NavigationSection) ? section as NavigationSection : null;
}
