'use client';

import dynamic from 'next/dynamic';
import SectionSkeleton from '@/components/common/SectionSkeleton';

const TodayView = dynamic(() => import('@/components/dashboard/DashboardSection'), {
  loading: () => <SectionSkeleton label="Opening your space…" />,
});

export default function MyDaySection() {
  return (
    <div className="space-y-6">
      <TodayView />
    </div>
  );
}
