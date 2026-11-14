'use client';

import { useApp } from '@/context/AppContext';
import { NavigationSection } from '@/types';

const headings: Partial<Record<NavigationSection, { eyebrow: string; title: string; description: string }>> = {
  'my-day': { eyebrow: 'YOUR EVERYDAY, AT A GLANCE', title: 'A little clarity for today.', description: 'Your numbers, meals, and moments. All part of a bigger picture.' },
  'quick-log': { eyebrow: 'THE LITTLE THINGS ADD UP', title: 'Capture a moment.', description: 'A meal, a reading, a little movement. Keep the context that matters to you.' },
  insights: { eyebrow: 'STEP BACK. SEE A LITTLE MORE.', title: 'Find your everyday patterns.', description: 'Explore your readings over time and prepare for a conversation with your care team.' },
  devices: { eyebrow: 'CONNECTED ON YOUR TERMS', title: 'Your data. Your space.', description: 'Connect your readings, import a file, and keep a private backup.' },
  report: { eyebrow: 'FOR THE NEXT CONVERSATION', title: 'Bring the bigger picture.', description: 'Prepare a clear summary of your available readings for your care team.' },
  't1d-essentials': { eyebrow: 'THE LITTLE THINGS', title: 'T1D Essentials', description: 'The little things that make living with T1D easier.' },
  'go-to-doctors': { eyebrow: 'SHARED EXPERIENCES', title: 'Our Go-To Doctors', description: 'Doctors we\'ve met. Experiences we\'ve shared.' },
  about: { eyebrow: '', title: 'About GlucoNest.', description: '' },
  feedback: { eyebrow: '', title: 'Help shape GlucoNest.', description: '' },
  legal: { eyebrow: 'CLEAR FROM THE START', title: 'A little transparency.', description: 'How this app works, where your data lives, and what to expect.' },
};

export default function WorkspaceHeading() {
  const { activeSection, myDayView } = useApp();
  // Inside My Day, the heading follows the open view.
  const headingKey = activeSection === 'my-day' && myDayView !== 'today' ? myDayView : activeSection;
  const heading = headings[headingKey];
  if (!heading) return null;
  return <div className="workspace-heading print:hidden"><div>{heading.eyebrow && <p className="section-kicker">{heading.eyebrow}</p>}<h1>{heading.title}</h1>{heading.description && <p className="workspace-description">{heading.description}</p>}</div></div>;
}
