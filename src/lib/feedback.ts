import type { CommunityFeedback } from '@/types';

export type FeedbackDraft = Omit<CommunityFeedback, 'id' | 'submittedAt'>;

export function formatFeedback(draft: FeedbackDraft, submittedAt: string): string {
  return [
    'GlucoNest feedback',
    `Saved: ${submittedAt}`,
    `Name: ${draft.isAnonymous ? 'Anonymous' : draft.nameOrHandle || 'Not provided'}`,
    ...(!draft.isAnonymous && draft.emailOrContact ? [`Contact: ${draft.emailOrContact}`] : []),
    '',
    'Features I would use:',
    draft.featureWouldUseRegularly.join(', ') || 'Not answered',
    '',
    'Where the experience could improve:',
    draft.dislikedAspects.join(', ') || 'Not answered',
    '',
    'My suggestion:',
    draft.wishSomeoneBuilt || 'Not answered',
  ].join('\n');
}
