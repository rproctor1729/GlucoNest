import { Activity, Utensils, type LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import DashboardPreview from '@/components/home/previews/DashboardPreview';
import FoodPreview from '@/components/home/previews/FoodPreview';
import type { NavigationSection } from '@/types';

export interface Feature {
  id: 'dashboard' | 'blog' | 'food';
  title: string;
  description: string;
  href: `#${NavigationSection}` | `#knowledge-hub/guide/${string}`;
  icon: LucideIcon;
  cta: string;
  PreviewComponent: ComponentType;
}

export const features: readonly Feature[] = [
  {
    id: 'dashboard', title: 'See the bigger picture.',
    description: 'Bring glucose readings, meals, and activity into one place. Give your everyday numbers a little more context.',
    href: '#my-day', icon: Activity, cta: 'Open My Day', PreviewComponent: DashboardPreview,
  },
  {
    id: 'food', title: 'Your plate. Your culture. Your everyday.',
    description: "Food tracking should feel familiar. Browse Indian meals, adjust your portions, and keep a simple record of what's on your plate.",
    href: '#food-library', icon: Utensils, cta: 'Discover the food library', PreviewComponent: FoodPreview,
  },
];
