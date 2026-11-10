import { Activity, Library, FileText, Heart, LayoutDashboard, MessageSquare, Settings2, Utensils, type LucideIcon } from 'lucide-react';
import { translate, type AppLanguage } from '@/lib/i18n';
import type { NavigationSection } from '@/types';

export interface WorkspaceNavItem { id: NavigationSection; label: string; icon: LucideIcon }

export function workspaceNavigation(language: AppLanguage): { main: WorkspaceNavItem[]; bottom: WorkspaceNavItem[] } {
  return {
    main: [
      { id: 'my-day', label: translate(language, 'nav.myDay'), icon: LayoutDashboard },
      { id: 'insights', label: translate(language, 'nav.insights'), icon: Activity },
      { id: 'food-library', label: translate(language, 'nav.food'), icon: Utensils },
      { id: 'knowledge-hub', label: translate(language, 'nav.hub'), icon: Library },
      { id: 'report', label: translate(language, 'nav.report'), icon: FileText },
    ],
    bottom: [
      { id: 'devices', label: translate(language, 'nav.devices'), icon: Settings2 },
      { id: 'feedback', label: translate(language, 'nav.feedback'), icon: MessageSquare },
      { id: 'about', label: translate(language, 'nav.about'), icon: Heart },
    ],
  };
}
