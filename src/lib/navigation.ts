import type { NavigationSection } from '@/types';

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  'home', 'my-day', 'quick-log', 'insights', 'food-library',
  'knowledge-hub', 't1d-essentials', 'go-to-doctors', 'about', 'feedback', 'devices', 'legal', 'report',
];

// Document anchors (including the skip link) must not change the active tool.
export function sectionFromHash(hash: string): NavigationSection | null {
  const section = hash.replace(/^#/, '');
  if (section === 'learn-community') return 'knowledge-hub';
  if (section.startsWith('knowledge-hub/')) return 'knowledge-hub';
  return NAVIGATION_SECTIONS.includes(section as NavigationSection) ? section as NavigationSection : null;
}
