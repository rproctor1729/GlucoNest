'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
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
const LegalSection = dynamic(() => import('@/components/legal/LegalSection'), { loading: () => <div className="section-loading" role="status">Opening your space…</div> });
import HomeSection from '@/components/home/HomeSection';
import WorkspaceHeading from '@/components/layout/WorkspaceHeading';
const KnowledgeHub = dynamic(() => import('@/components/knowledge/KnowledgeHub'), { loading: () => <div className="section-loading" role="status">Opening the Knowledge Hub…</div> });

function MainContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { activeSection, setActiveSection, localDataError, dismissLocalDataError } = useApp();

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
        <SectionErrorBoundary key={activeSection} sectionName={activeSection}>
          {activeSection === 'home' ? <HomeSection /> : <WorkspaceHeading />}
          {activeSection === 'my-day' && <DashboardSection />}
          {activeSection === 'devices' && <DevicesSection />}
          {activeSection === 'quick-log' && <QuickLogSection />}
          {activeSection === 'insights' && <InsightsSection />}
          {activeSection === 'food-library' && <FoodLibrarySection />}
          {activeSection === 'knowledge-hub' && <KnowledgeHub />}
          {activeSection === 'about' && <AboutSection />}
          {activeSection === 'feedback' && <FeedbackSection />}
          {activeSection === 'legal' && <LegalSection />}
          {activeSection === 'report' && <DoctorReportSection />}
        </SectionErrorBoundary>
      </main>

      <Footer />
      {['my-day', 'quick-log', 'food-library', 'insights', 'devices', 'report'].includes(activeSection) && <OnboardingDialog />}

      {/* Global modals */}
      <HypoEmergencyModal />
    </div>
  );
}

export default function Page() {
  return <MainContent />;
}
