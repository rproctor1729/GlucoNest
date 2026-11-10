'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import type { NavigationSection } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
const DashboardSection = dynamic(() => import('@/components/dashboard/DashboardSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
const QuickLogSection = dynamic(() => import('@/components/quicklog/QuickLogSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
const InsightsSection = dynamic(() => import('@/components/insights/InsightsSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
const FoodLibrarySection = dynamic(() => import('@/components/food/FoodLibrarySection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
const AboutSection = dynamic(() => import('@/components/about/AboutSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
const FeedbackSection = dynamic(() => import('@/components/feedback/FeedbackSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
const DevicesSection = dynamic(() => import('@/components/devices/DevicesSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
const DoctorReportSection = dynamic(() => import('@/components/report/DoctorReportSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
import HypoEmergencyModal from '@/components/hypo/HypoEmergencyModal';
import { AlertCircle, X } from 'lucide-react';
import SectionErrorBoundary from '@/components/layout/SectionErrorBoundary';
import OnboardingDialog from '@/components/layout/OnboardingDialog';
import LocalReminderManager from '@/components/layout/LocalReminderManager';
import LandingPage from '@/components/landing/LandingPage';
const LegalSection = dynamic(() => import('@/components/legal/LegalSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
import HomeSection from '@/components/home/HomeSection';
import WorkspaceHeading from '@/components/layout/WorkspaceHeading';
const KnowledgeHub = dynamic(() => import('@/components/knowledge/KnowledgeHub'), { loading: () => <div className="section-loading" role="status">Opening the Knowledge Hub…</div> });
const LearnCommunitySection = dynamic(() => import('@/components/community/LearnCommunitySection'), { loading: () => <div className="section-loading" role="status">Opening the community…</div> });

function MainContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { activeSection, setActiveSection, localDataError, dismissLocalDataError, onboardingComplete } = useApp();
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
          <SectionErrorBoundary key={activeSection} sectionName={activeSection}>
            {activeSection === 'home' ? <HomeSection /> : <WorkspaceHeading />}
            {activeSection === 'my-day' && <DashboardSection />}
            {activeSection === 'devices' && <DevicesSection />}
            {activeSection === 'quick-log' && <QuickLogSection />}
            {activeSection === 'insights' && <InsightsSection />}
            {activeSection === 'food-library' && <FoodLibrarySection />}
            {activeSection === 'learn-community' && <LearnCommunitySection />}
            {activeSection === 'knowledge-hub' && <KnowledgeHub />}
            {activeSection === 'about' && <AboutSection />}
            {activeSection === 'feedback' && <FeedbackSection />}
            {activeSection === 'legal' && <LegalSection />}
            {activeSection === 'report' && <DoctorReportSection />}
          </SectionErrorBoundary>
        )}
      </main>

      <Footer />
      {!showLanding && ['my-day', 'quick-log', 'food-library', 'insights', 'devices', 'report'].includes(activeSection) && <OnboardingDialog />}
      <LocalReminderManager />

      {/* Global modals */}
      <HypoEmergencyModal />
    </div>
  );
}

export default function Page() {
  return <MainContent />;
}
