'use client';

import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import type { MyDayView } from '@/lib/navigation';
import SectionSkeleton from '@/components/common/SectionSkeleton';

// Each view loads only when it is opened.
const TodayView = dynamic(() => import('@/components/dashboard/DashboardSection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
const InsightsView = dynamic(() => import('@/components/insights/InsightsSection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });
const ReportView = dynamic(() => import('@/components/report/DoctorReportSection'), { loading: () => <SectionSkeleton label="Opening your space…" /> });

const VIEWS: ReadonlyArray<{ id: MyDayView; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'insights', label: 'My Insights' },
  { id: 'report', label: 'Doctor report' },
];

export default function MyDaySection() {
  const { myDayView, setMyDayView } = useApp();
  return (
    <div className="space-y-6">
      <div role="group" aria-label="My Day views" className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1 text-xs dark:bg-slate-900 w-fit max-w-full">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            aria-pressed={myDayView === view.id}
            onClick={() => setMyDayView(view.id)}
            className={`rounded-xl px-3.5 py-2 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500 ${
              myDayView === view.id
                ? 'bg-white text-nest-700 shadow-sm dark:bg-slate-800 dark:text-nest-200'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {myDayView === 'today' && <TodayView />}
      {myDayView === 'insights' && <InsightsView />}
      {myDayView === 'report' && <ReportView />}
    </div>
  );
}
