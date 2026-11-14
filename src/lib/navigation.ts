import type { NavigationSection } from '@/types';

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  // insights and report resolve to devices where they are unified.
  'home', 'my-day', 'quick-log', 'food-library',
  'knowledge-hub', 't1d-essentials', 'go-to-doctors', 'about', 'feedback', 'devices', 'legal',
];

// Legacy views preserved for backward compatibility with existing links.
export type MyDayView = 'today' | 'insights' | 'report';

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
  // Clubbed My Insights and Doctor report into the devices/sources page.
  if (section === 'insights' || section === 'my-day/insights' || section === 'report' || section === 'my-day/report') {
    return 'devices';
  }
  if (section.startsWith('my-day/')) return 'my-day';
  return NAVIGATION_SECTIONS.includes(section as NavigationSection) ? section as NavigationSection : null;
}
