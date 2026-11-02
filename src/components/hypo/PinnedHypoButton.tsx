'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, Zap } from 'lucide-react';

export default function PinnedHypoButton() {
  const { triggerHypoEmergency, isHypoModalOpen } = useApp();

  if (isHypoModalOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      <button
        type="button"
        onClick={triggerHypoEmergency}
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 border-2 border-white dark:border-slate-800"
        aria-label="Emergency Hypo Quick-Action"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span className="font-semibold">Hypo Quick-Action</span>
        <span className="hidden sm:inline text-rose-200 font-mono text-[11px] font-normal">
          · Rule of 15
        </span>
      </button>
    </div>
  );
}
