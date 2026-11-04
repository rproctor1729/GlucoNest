import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans selection:bg-nest-500/20 selection:text-nest-700">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
