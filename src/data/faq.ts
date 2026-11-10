import type { NavigationSection } from '@/types';

export type FaqId = 'dosing' | 'data' | 'account';
export interface FaqItem {
  id: FaqId;
  question: string;
  summary: string;
  answer: string;
  priority: number;
  cta?: { label: string; href: string; section: NavigationSection };
}

export const faqCopy = {
  eyebrow: 'A FEW THINGS TO KNOW',
  heading: 'Make yourself at home.',
  cardsLabel: 'Key answers',
} as const;

// Keep the full answers verbatim. Summaries contain only facts in those answers.
const content: readonly FaqItem[] = [
  {
    id: 'account',
    question: 'Do I need an account?',
    summary: 'No sign-up needed.',
    answer: 'No. You can explore the sample dashboard and start logging without signing up. Your personal logs are saved in this browser.',
    priority: 3,
  },
  {
    id: 'data',
    question: 'Where do manually entered records go?',
    summary: 'Unencrypted local storage.',
    answer: 'Manually entered records stay in local browser storage. This storage is unencrypted and can be cleared, so export private backups in Devices & Data. Nightscout credentials are held in memory only.',
    priority: 2,
    cta: { label: 'Export a backup', href: '#devices', section: 'devices' },
  },
  {
    id: 'dosing',
    question: 'Does GlucoNest calculate insulin doses?',
    summary: 'No dose calculations.',
    answer: 'No. GlucoNest is an educational self-tracking tool. It does not calculate insulin doses, provide medical advice, or replace your care team or CGM alarms.',
    priority: 1,
  },
];

export const faqItems: readonly FaqItem[] = [...content].sort((a, b) => a.priority - b.priority);
