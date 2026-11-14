import { Heart, Library, LayoutDashboard, MessageSquare, Package, Settings2, Stethoscope, Utensils, type LucideIcon } from 'lucide-react';
import { translate, type AppLanguage } from '@/lib/i18n';
import type { NavigationSection } from '@/types';

export interface WorkspaceNavItem { id: NavigationSection; label: string; icon: LucideIcon }

export function workspaceNavigation(language: AppLanguage): { main: WorkspaceNavItem[]; bottom: WorkspaceNavItem[] } {
  return {
    main: [
      // My Day includes today's view, My Insights and the Doctor report.
      { id: 'my-day', label: translate(language, 'nav.myDay'), icon: LayoutDashboard },
      { id: 'food-library', label: translate(language, 'nav.food'), icon: Utensils },
      { id: 'knowledge-hub', label: translate(language, 'nav.hub'), icon: Library },
      { id: 't1d-essentials', label: 'T1D Essentials', icon: Package },
      { id: 'go-to-doctors', label: 'Our Go-To Doctors', icon: Stethoscope },
    ],
    bottom: [
      { id: 'devices', label: translate(language, 'nav.devices'), icon: Settings2 },
      { id: 'feedback', label: translate(language, 'nav.feedback'), icon: MessageSquare },
      { id: 'about', label: translate(language, 'nav.about'), icon: Heart },
    ],
  };
}
