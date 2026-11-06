'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { NavigationSection } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardSection from '@/components/dashboard/DashboardSection';
import QuickLogSection from '@/components/quicklog/QuickLogSection';
import InsightsSection from '@/components/insights/InsightsSection';
import FoodLibrarySection from '@/components/food/FoodLibrarySection';
import LearnCommunitySection from '@/components/community/LearnCommunitySection';
import AboutSection from '@/components/about/AboutSection';
import FeedbackSection from '@/components/feedback/FeedbackSection';
import DevicesSection from '@/components/devices/DevicesSection';
import DoctorReportSection from '@/components/report/DoctorReportSection';
import HypoEmergencyModal from '@/components/hypo/HypoEmergencyModal';
import OneTapLogModal from '@/components/dashboard/OneTapLogModal';
import { AlertCircle, X } from 'lucide-react';
import SectionErrorBoundary from '@/components/layout/SectionErrorBoundary';
import OnboardingDialog from '@/components/layout/OnboardingDialog';
import LegalSection from '@/components/legal/LegalSection';
import LocalReminderManager from '@/components/layout/LocalReminderManager';
import LandingPage from '@/components/landing/LandingPage';

const LANDING_SEEN_KEY = 'gluconest_landing_seen';

function MainContent() {
  const { activeSection, setActiveSection, localDataError, dismissLocalDataError, onboardingComplete } = useApp();
  // Starts as "seen" so the landing never flashes for returning users before storage is read.
  const [landingSeen, setLandingSeen] = useState(true);

  useEffect(() => {
    try {
      setLandingSeen(window.localStorage.getItem(LANDING_SEEN_KEY) === '1');
    } catch {
      // If storage is blocked, skip the landing page rather than showing it on every load.
    }
  }, []);

  // First visits see the landing page before onboarding. Once dismissed, it does not return.
  const showLanding = activeSection === 'my-day' && !onboardingComplete && !landingSeen;

  const enterApp = (section?: NavigationSection) => {
    setLandingSeen(true);
    try {
      window.localStorage.setItem(LANDING_SEEN_KEY, '1');
    } catch {
      // Storage unavailable: the landing page simply stays hidden for this visit.
    }
    if (section) setActiveSection(section);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      {localDataError && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200"
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-20 xl:pb-6">
        {showLanding ? (
          <LandingPage onEnter={enterApp} />
        ) : (
        <SectionErrorBoundary key={activeSection} sectionName={activeSection}>
          {activeSection === 'my-day' && <DashboardSection />}
          {activeSection === 'devices' && <DevicesSection />}
          {activeSection === 'quick-log' && <QuickLogSection />}
          {activeSection === 'insights' && <InsightsSection />}
          {activeSection === 'food-library' && <FoodLibrarySection />}
          {activeSection === 'learn-community' && <LearnCommunitySection />}
          {activeSection === 'about' && <AboutSection />}
          {activeSection === 'feedback' && <FeedbackSection />}
          {activeSection === 'legal' && <LegalSection />}
          {activeSection === 'report' && <DoctorReportSection />}
        </SectionErrorBoundary>
        )}
      </main>

      <Footer />
      {!showLanding && <OnboardingDialog />}
      <LocalReminderManager />

      {/* Global modals */}
      <HypoEmergencyModal />
      <OneTapLogModal />
    </div>
  );
}

export default function Page() {
  return <MainContent />;
}
