import { Dumbbell, Droplet, Package, ShieldPlus, Snowflake, Syringe, type LucideIcon } from 'lucide-react';
import type { StoreCategoryId } from '@/types/store';

// Placeholder visuals per category. No product photos are shown until licensed images are supplied.
export const categoryIcons: Record<StoreCategoryId, LucideIcon> = {
  'insulin-storage': Snowflake,
  'glucose-monitoring': Droplet,
  'insulin-delivery': Syringe,
  'everyday-essentials': ShieldPlus,
  lifestyle: Dumbbell,
};

export const fallbackIcon: LucideIcon = Package;
