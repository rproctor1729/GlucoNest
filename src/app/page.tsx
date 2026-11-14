'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import type { NavigationSection } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
// My Day holds today's view, My Insights and the Doctor report.
const MyDaySection = dynamic(() => import('@/components/dashboard/MyDaySection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
const QuickLogSection = dynamic(() => import('@/components/quicklog/QuickLogSection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
const FoodLibrarySection = dynamic(() => import('@/components/food/FoodLibrarySection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
const AboutSection = dynamic(() => import('@/components/about/AboutSection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
const FeedbackSection = dynamic(() => import('@/components/feedback/FeedbackSection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
const DevicesSection = dynamic(() => import('@/components/devices/DevicesSection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
import HypoEmergencyModal from '@/components/hypo/HypoEmergencyModal';
import SectionSkeleton from '@/components/common/SectionSkeleton';
import { AlertCircle, X } from 'lucide-react';
import SectionErrorBoundary from '@/components/layout/SectionErrorBoundary';
import OnboardingDialog from '@/components/layout/OnboardingDialog';
import LocalReminderManager from '@/components/layout/LocalReminderManager';
import LandingPage from '@/components/landing/LandingPage';
const T1dEssentialsSection = dynamic(() => import('@/components/store/StoreSection'), { loading: () => <SectionSkeleton label="Opening T1D Essentials…" /> });
const GoToDoctorsSection = dynamic(() => import('@/components/doctors/DoctorsSection'), { loading: () => <SectionSkeleton label="Opening Our Go-To Doctors…" /> });
const LegalSection = dynamic(() => import('@/components/legal/LegalSection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
import HomeSection from '@/components/home/HomeSection';
import WorkspaceHeading from '@/components/layout/WorkspaceHeading';
const KnowledgeHub = dynamic(() => import('@/components/knowledge/KnowledgeHub'), { loading: () => <SectionSkeleton label="Opening the Knowledge Hub…" /> });
const LearnCommunitySection = dynamic(() => import('@/components/community/LearnCommunitySection'), { loading: () => <SectionSkeleton label="Opening the community…" /> });

function MainContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { activeSection, setActiveSection, myDayView, localDataError, dismissLocalDataError, onboardingComplete } = useApp();
  const [landingSeen, setLandingSeen] = useState(true);

  useEffect(() => {
    try {
      setLandingSeen(window.localStorage.getItem('gluconest_landing_seen') === '1');
    } catch {
      setLandingSeen(true);
    }
  }, []);

  const showLanding = activeSection === 'my-day' && !onboardingComplete && !landingSeen;
  const enterApp = (section?: NavigationSection) => {
    setLandingSeen(true);
    try {
      window.localStorage.setItem('gluconest_landing_seen', '1');
    } catch {
      // The landing page remains hidden for this visit if storage is unavailable.
    }
    if (section) setActiveSection(section);
  };

  return (
    <div data-sidebar-collapsed={sidebarCollapsed} className={`min-h-screen flex flex-col text-[color:var(--foreground)] transition-colors ${activeSection === 'home' ? 'landing-shell' : 'workspace-shell'}`}>
      <Navbar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed(current => !current)} />

      {localDataError && (
        <div className="workspace-data-warning w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div
            role="alert"
            className="flex flex-wrap items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="flex-1">{localDataError}</p>
            <button
              type="button"
              onClick={() => setActiveSection('devices')}
              className="shrink-0 rounded-lg px-2 py-1 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Manage backups
            </button>
            <button
              type="button"
              onClick={dismissLocalDataError}
              className="rounded-md p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              aria-label="Dismiss local data warning"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className={activeSection === 'home' ? 'landing-main' : 'workspace-main'}>
        {showLanding ? (
          <LandingPage onEnter={enterApp} />
        ) : (
          <SectionErrorBoundary key={activeSection === 'my-day' ? `my-day-${myDayView}` : activeSection} sectionName={activeSection}>
            {activeSection === 'home' ? <HomeSection /> : <WorkspaceHeading />}
            {activeSection === 'my-day' && <MyDaySection />}
            {activeSection === 'devices' && <DevicesSection />}
            {activeSection === 'quick-log' && <QuickLogSection />}
            {activeSection === 'food-library' && <FoodLibrarySection />}
            {activeSection === 'learn-community' && <LearnCommunitySection />}
            {activeSection === 'knowledge-hub' && <KnowledgeHub />}
            {activeSection === 't1d-essentials' && <T1dEssentialsSection />}
            {activeSection === 'go-to-doctors' && <GoToDoctorsSection />}
            {activeSection === 'about' && <AboutSection />}
            {activeSection === 'feedback' && <FeedbackSection />}
            {activeSection === 'legal' && <LegalSection />}
          </SectionErrorBoundary>
        )}
      </main>

      <Footer />
      {!showLanding && ['my-day', 'quick-log', 'food-library', 'devices'].includes(activeSection) && <OnboardingDialog />}
      <LocalReminderManager />

      {/* Global modals */}
      <HypoEmergencyModal />
    </div>
  );
}

export default function Page() {
  return <MainContent />;
}
