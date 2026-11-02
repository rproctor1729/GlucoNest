export interface CommunityFeedback {
  id: string;
  submittedAt: string; // ISO
  isAnonymous: boolean;
  nameOrHandle?: string;
  emailOrContact?: string;
  challengingPart: string[];
  challengingPartOther?: string;
  currentAppsUsed: string[];
  currentAppsOther?: string;
  dislikedAspects: string[];
  dislikedAspectsOther?: string;
  indianFoodHelpfulness: 'Extremely helpful' | 'Somewhat helpful' | 'Not sure' | 'I already know my counts';
  patternExplanationsHelpfulness: 'Yes - helps me understand the why' | 'Sometimes' | 'No - just numbers please';
  featureWouldUseRegularly: string[];
  featureOther?: string;
  wishSomeoneBuilt: string;
  additionalSuggestions: string;
}
