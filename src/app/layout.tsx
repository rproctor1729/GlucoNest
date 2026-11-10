import type { Metadata } from 'next';
import { Source_Sans_3, Spectral } from 'next/font/google';
import './globals.css';
import { getPublishedMembers } from '@/data/teamMembers';
import { AppProvider } from '@/context/AppContext';
import ServiceWorkerRegistration from '@/components/layout/ServiceWorkerRegistration';

const bodyFont = Source_Sans_3({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const displayFont = Spectral({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: '400', style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'GlucoNest — A Little Clarity. A Lot More Living.',
  description:
    'Your everyday type 1 diabetes companion. Track glucose, log meals, explore Indian foods, and prepare reading summaries. No account needed.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-180.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="antialiased font-sans">
        <AppProvider teamMembers={getPublishedMembers()}>
          {children}
          <ServiceWorkerRegistration />
        </AppProvider>
      </body>
    </html>
  );
}
