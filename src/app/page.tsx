'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardSection from '@/components/dashboard/DashboardSection';
import QuickLogSection from '@/components/quicklog/QuickLogSection';
import InsightsSection from '@/components/insights/InsightsSection';
import FoodLibrarySection from '@/components/food/FoodLibrarySection';
import LearnCommunitySection from '@/components/community/LearnCommunitySection';
import AboutSection from '@/components/about/AboutSection';
import FeedbackSection from '@/components/feedback/FeedbackSection';
import HypoEmergencyModal from '@/components/hypo/HypoEmergencyModal';
import OneTapLogModal from '@/components/dashboard/OneTapLogModal';
import DoctorReadyReportModal from '@/components/report/DoctorReadyReportModal';
import PinnedHypoButton from '@/components/hypo/PinnedHypoButton';

function MainContent() {
  const { activeSection } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] dark:bg-[#0c1218] text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeSection === 'my-day' && <DashboardSection />}
        {activeSection === 'quick-log' && <QuickLogSection />}
        {activeSection === 'insights' && <InsightsSection />}
        {activeSection === 'food-library' && <FoodLibrarySection />}
        {activeSection === 'learn-community' && <LearnCommunitySection />}
        {activeSection === 'about' && <AboutSection />}
        {activeSection === 'feedback' && <FeedbackSection />}
      </main>

      <Footer />

      {/* Global Modals & Persistent Emergency Pinned Trigger */}
      <HypoEmergencyModal />
      <OneTapLogModal />
      <DoctorReadyReportModal />
      <PinnedHypoButton />
    </div>
  );
}

export default function Page() {
  return <MainContent />;
}
