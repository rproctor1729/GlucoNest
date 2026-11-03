'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { convertGlucose, formatUnitLabel } from '@/utils/glucoseUtils';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  Volume2,
  VolumeX,
  X,
  HeartHandshake,
  ShieldAlert,
  Zap,
  Info,
} from 'lucide-react';

export default function HypoEmergencyModal() {
  const { isHypoModalOpen, setIsHypoModalOpen, currentReading, glucoseUnit } = useApp();

  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60); // 15 min timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [carbTaken, setCarbTaken] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifiedCaregiver, setNotifiedCaregiver] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (soundEnabled && typeof window !== 'undefined') {
        try {
          const ctx = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        } catch {}
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining, soundEnabled]);

  if (!isHypoModalOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const startTimer = () => setIsTimerRunning(true);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(15 * 60);
  };

  const indianFastCarbOptions = [
    { name: '1 Tbsp Glucon-D Powder', amount: '15g pure dextrose in water', icon: '⚡' },
    { name: '1 Small Frooti / Real Juice', amount: '125ml tetra pack (~16g carbs)', icon: '🧃' },
    { name: '1/2 Small Bottle Limca / Sprite', amount: '150ml regular soda (~18g sugar)', icon: '🥤' },
    { name: '3-4 Sugar Sachets', amount: '15g table sugar in water', icon: '🥄' },
    { name: '4 Chewy Glucose Tablets', amount: '16g fast dextrose lozenges', icon: '🍬' },
    { name: '1 Tablespoon Honey', amount: '17g quick fructose/glucose', icon: '🍯' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-rose-300 dark:border-rose-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hypo-title"
      >
        {/* Urgent Header */}
        <div className="bg-rose-500 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="hypo-title" className="text-xl font-bold tracking-tight">
                Hypo Quick-Action · Rule of 15
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                Stay calm. Sit down safely, take 15g fast carbs, and rest.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHypoModalOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close emergency modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Explicit Prototype Disclaimer */}
        <div className="bg-rose-100 dark:bg-rose-950/70 border-b border-rose-200 dark:border-rose-900 px-5 py-2.5 text-[11px] text-rose-900 dark:text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>PROTOTYPE NOTICE:</strong> This application is a preview tool and does <strong>NOT</strong> monitor live continuous glucose or dispatch emergency medical services.
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Current Reading Context */}
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            {currentReading ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  Latest glucose value:
                </span>
                <span className="text-3xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                  {convertGlucose(currentReading.value, glucoseUnit)}
                </span>
                <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {formatUnitLabel(glucoseUnit)}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                No glucose reading is currently available.
              </span>
            )}
            <div className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Target safe threshold: 70 mg/dL (3.9 mmol/L)</span>
            </div>
          </div>

          {/* Step 1: Fast Carbs Selection (Indian Staples) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-500" />
                Step 1: Take 15g Fast-Acting Glucose (Indian Essentials)
              </h3>
              <span className="text-[11px] text-slate-500">
                Avoid chocolate/milk (fats delay absorption)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {indianFastCarbOptions.map((opt) => {
                const isSelected = carbTaken === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => {
                      setCarbTaken(opt.name);
                      if (!isTimerRunning && secondsRemaining === 15 * 60) {
                        startTimer();
                      }
                    }}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-600 ring-2 ring-rose-400/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{opt.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.amount}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: 15-Minute Recheck Timer */}
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                Step 2: Wait 15 Minutes & Recheck
              </span>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
              </button>
            </div>

            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-slate-900 dark:text-white my-3">
              {formattedTime}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
              Swallowed sugar takes 12–15 minutes to enter circulation. Over-treating during this window causes severe rebound spikes.
            </p>

            <div className="flex items-center justify-center gap-3">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={startTimer}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors shadow-sm"
                >
                  {secondsRemaining < 15 * 60 ? 'Resume Timer' : 'Start 15m Timer'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors"
                >
                  Pause Timer
                </button>
              )}

              <button
                type="button"
                onClick={resetTimer}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-xs transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* CRITICAL SAFETY: Severe Hypo & Glucagon */}
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl space-y-2 text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>CRITICAL INSTRUCTION FOR HELPERS & FAMILY:</span>
            </div>
            <p>
              <strong>NEVER give liquids, food, or glucose orally to someone who is confused, choking, or unconscious.</strong>
              {' '}Doing so can block their breathing airway. Turn the person on their side in the recovery position, administer prescribed nasal glucagon (Baqsimi) or glucagon injection, and immediately summon emergency medical care.
            </p>
          </div>

          {/* Helper Contact Simulation */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Caregiver Emergency Alert (Demo Simulation)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNotifiedCaregiver(true)}
              disabled={notifiedCaregiver}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                notifiedCaregiver
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {notifiedCaregiver ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Demo SOS Triggered</span>
                </>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5 text-rose-500" />
                  <span>Test Caregiver SOS Notification</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0f161e] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Rule of 15: Repeat with 15g if still &lt;70 mg/dL after 15 minutes.
          </p>
          <button
            type="button"
            onClick={() => setIsHypoModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
          >
            I Feel Better / Close
          </button>
        </div>
      </div>
    </div>
  );
}
