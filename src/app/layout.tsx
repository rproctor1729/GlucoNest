import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import ServiceWorkerRegistration from '@/components/layout/ServiceWorkerRegistration';

const bodyFont = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const displayFont = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap', axes: ['SOFT', 'opsz'] });

export const metadata: Metadata = {
  title: 'GlucoNest — Built by Diabetics, for Diabetics',
  description:
    'A calm, clean, community-driven web app that helps people living with type-1 diabetes track glucose, understand why numbers behave the way they do, and never feel alone.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="antialiased font-sans selection:bg-nest-500/20 selection:text-nest-700">
        <AppProvider>
          {children}
          <ServiceWorkerRegistration />
        </AppProvider>
      </body>
    </html>
  );
}
