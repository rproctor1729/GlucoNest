'use client';

import { useModalFocus } from '@/components/common/useModalFocus';
import React, { useState, useEffect, useRef } from 'react';
import { prepareTimerChime, type ChimeAudioContext, type TimerChime } from '@/utils/timerChime';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
  Check,
  Info,
} from 'lucide-react';

export default function HypoEmergencyModal() {
  const { isHypoModalOpen, setIsHypoModalOpen } = useApp();

  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60); // 15 min timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const chimeRef = useRef<TimerChime | null>(null);
  const [carbTaken, setCarbTaken] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundError, setSoundError] = useState<string | null>(null);

  useEffect(() => () => {
    void chimeRef.current?.cancel();
    chimeRef.current = null;
  }, []);

  // The timer only runs while the modal is open. Closing it stops and resets the timer,
  // so no chime can sound later from a hidden modal.
  useEffect(() => {
    if (!isHypoModalOpen) {
      setIsTimerRunning(false);
      setSecondsRemaining(15 * 60);
      setCarbTaken(null);
      setSoundError(null);
      void chimeRef.current?.cancel();
      chimeRef.current = null;
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      const chime = chimeRef.current;
      if (soundEnabled && chime) {
        chime.play();
        void chime.status.then((result) => {
          if (result === 'error') {
            console.error('The optional timer chime could not be played.');
            setSoundError('The timer finished, but this browser could not play the optional chime.');
          }
        });
      }
    }
    return () => clearInterval(interval);
  }, [isHypoModalOpen, isTimerRunning, secondsRemaining, soundEnabled]);

  const modalRef = useModalFocus(isHypoModalOpen, () => setIsHypoModalOpen(false));

  if (!isHypoModalOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const cancelChime = () => {
    void chimeRef.current?.cancel();
    chimeRef.current = null;
  };
  const armChime = () => {
    cancelChime();
    chimeRef.current = prepareTimerChime(() => {
      const AudioCtor = window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      return AudioCtor ? new AudioCtor() as unknown as ChimeAudioContext : null;
    });
  };
  const startTimer = () => {
    if (soundEnabled) armChime();
    if (secondsRemaining === 0) setSecondsRemaining(15 * 60);
    setIsTimerRunning(true);
  };
  const resetTimer = () => {
    cancelChime();
    setIsTimerRunning(false);
    setSecondsRemaining(15 * 60);
    setCarbTaken(null);
  };

  const fastCarbOptions = [
    {
      name: 'Fruit Juice',
      amount: '1 small pack (Frooti / Réal)',
      icon: '🧃',
      tag: 'Fast absorb',
    },
    {
      name: 'Glucon-D / Tabs',
      amount: '1 heaped tbsp (or 4 tabs)',
      icon: '⚡',
      tag: 'Direct glucose',
    },
    {
      name: 'Sugar / Honey',
      amount: '3 teaspoons in water',
      icon: '🥄',
      tag: 'Household quick',
    },
  ];

  return (
    <div ref={modalRef} tabIndex={-1} className="hypo-overlay fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm">
      <section
        className="hypo-dialog bg-white text-slate-900 dark:bg-[var(--surface)] dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hypo-title"
      >
        <header className="hypo-header bg-rose-600 text-white">
          <div className="hypo-heading">
            <span className="hypo-shield">
              <ShieldAlert size={22} />
            </span>
            <div>
              <h2 id="hypo-title">Hypo SOS</h2>
            </div>
          </div>
          <button
            type="button"
            className="hypo-close"
            onClick={() => setIsHypoModalOpen(false)}
            aria-label="Close emergency modal"
          >
            <X size={20} />
          </button>
        </header>

        <div className="hypo-content">
          {/* Step 1: Rapid 15g fast carbs */}
          <section className="hypo-choices" aria-labelledby="hypo-carbs-title">
            <div className="hypo-step-heading">
              <span className="hypo-step bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                01
              </span>
              <h3 id="hypo-carbs-title">Take 15g fast-acting carbs</h3>
            </div>

            <div className="hypo-options">
              {fastCarbOptions.map((option) => {
                const selected = carbTaken === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setCarbTaken(option.name);
                      if (!isTimerRunning && secondsRemaining === 15 * 60) startTimer();
                    }}
                    className={`hypo-option ${
                      selected
                        ? 'border-rose-500 bg-rose-50/90 dark:border-rose-500 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-slate-50/70 hover:border-rose-300 hover:bg-rose-50/30 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-rose-500/50'
                    }`}
                  >
                    <div className="hypo-option-top">
                      <span className="hypo-food-icon" aria-hidden="true">
                        {option.icon}
                      </span>
                      {selected ? (
                        <span className="hypo-check-badge bg-rose-600 text-white">
                          <Check size={13} strokeWidth={3} />
                          <span>Taken</span>
                        </span>
                      ) : (
                        <span className="hypo-tag text-slate-500 dark:text-slate-400">
                          {option.tag}
                        </span>
                      )}
                    </div>

                    <div className="hypo-option-copy">
                      <strong>{option.name}</strong>
                      <span className="hypo-option-amount text-slate-600 dark:text-slate-300">
                        {option.amount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: 15-Minute Countdown Timer */}
          <section
            className="hypo-timer-panel border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/50"
            aria-labelledby="hypo-timer-title"
          >
            <div className="hypo-timer-heading">
              <div className="hypo-step-heading">
                <span className="hypo-step bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                  02
                </span>
                <Clock size={16} className="text-rose-600 dark:text-rose-300" />
                <h3 id="hypo-timer-title">Wait 15 minutes & recheck</h3>

                {/* Hidden timer notice: revealed on hovering / focusing near timer */}
                <div className="hypo-tooltip-container">
                  <button
                    type="button"
                    className="hypo-info-trigger"
                    aria-describedby="hypo-timer-tooltip"
                    aria-label="Timer notice"
                  >
                    <Info size={14} />
                  </button>
                  <div id="hypo-timer-tooltip" role="tooltip" className="hypo-tooltip">
                    Timer works only while this dialog stays open.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="hypo-sound text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={() => {
                  if (soundEnabled) cancelChime();
                  else if (isTimerRunning) armChime();
                  setSoundEnabled(!soundEnabled);
                }}
                aria-pressed={soundEnabled}
                aria-label={soundEnabled ? 'Mute timer chime' : 'Enable timer chime'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>

            <div className="hypo-timer-main">
              <div className="hypo-time" role="timer" aria-label="Time until glucose recheck">
                {formattedTime}
              </div>
              <div className="hypo-timer-actions">
                <button
                  type="button"
                  onClick={
                    isTimerRunning
                      ? () => {
                          cancelChime();
                          setIsTimerRunning(false);
                        }
                      : startTimer
                  }
                  className="hypo-timer-primary bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                  {isTimerRunning
                    ? 'Pause timer'
                    : secondsRemaining === 0
                    ? 'Restart timer'
                    : secondsRemaining < 15 * 60
                    ? 'Resume timer'
                    : 'Start 15m timer'}
                </button>
                <button
                  type="button"
                  onClick={resetTimer}
                  className="hypo-reset border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Reset
                </button>
              </div>
            </div>

            <p className="hypo-recheck text-slate-600 dark:text-slate-300">
              Wait 15 min. If glucose is still below 70 mg/dL (3.9 mmol/L), repeat with 15g carbs.
            </p>
            {soundError && (
              <p role="status" className="hypo-sound-error text-amber-700 dark:text-amber-300">
                {soundError}
              </p>
            )}
          </section>

          {/* Severe emergency / Glucagon notice */}
          <aside
            className="hypo-safety border-rose-200 bg-rose-50/70 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
            aria-label="Severe low blood sugar safety"
          >
            <ShieldAlert size={18} className="hypo-safety-icon text-rose-600 dark:text-rose-400" />
            <div>
              <strong>Severe Emergency?</strong> If unconscious or unable to swallow, do NOT give oral food or drinks. Call 112 / emergency services or administer prescribed glucagon.
            </div>
          </aside>
        </div>

        {/* Footer with "I feel better / Close" */}
        <footer className="hypo-footer border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setIsHypoModalOpen(false)}
            className="hypo-done bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm"
          >
            <Check size={16} className="inline mr-1.5 -mt-0.5" />
            I feel better / Close
          </button>
        </footer>
      </section>

      <style jsx>{`
        .hypo-overlay {
          display: flex;
          padding: 12px;
          overflow-y: auto;
        }
        .hypo-dialog {
          width: 100%;
          max-width: 680px;
          flex-shrink: 0;
          margin: auto;
          border-radius: 18px;
          box-shadow: 0 28px 100px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }
        .hypo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
        }
        .hypo-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hypo-shield {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.15);
        }
        .hypo-header h2 {
          font-family: var(--font-body), sans-serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin: 0;
        }
        .hypo-close {
          min-width: 36px;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background-color 0.15s ease;
        }
        .hypo-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .hypo-content {
          padding: 18px 20px;
          display: grid;
          gap: 15px;
        }
        .hypo-step-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .hypo-step {
          padding: 2px 7px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 5px;
          letter-spacing: 0.04em;
        }
        .hypo-content h3 {
          font-family: var(--font-body), sans-serif;
          font-size: 14px;
          font-weight: 650;
          letter-spacing: -0.015em;
          margin: 0;
        }
        .hypo-options {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .hypo-option {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
          padding: 12px 14px;
          border-width: 1px;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;
        }
        .hypo-option-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .hypo-food-icon {
          font-size: 26px;
          line-height: 1;
        }
        .hypo-tag {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .hypo-check-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .hypo-option-copy {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .hypo-option strong {
          font-size: 13px;
          font-weight: 650;
          line-height: 1.35;
        }
        .hypo-option-amount {
          font-size: 11px;
          line-height: 1.4;
        }
        .hypo-timer-panel {
          padding: 14px 16px;
          border-width: 1px;
          border-radius: 12px;
        }
        .hypo-timer-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .hypo-tooltip-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          margin-left: 2px;
        }
        .hypo-info-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          color: #64748b;
          background: rgba(100, 116, 139, 0.12);
          border: none;
          cursor: help;
          transition: all 0.15s ease;
        }
        .hypo-info-trigger:hover,
        .hypo-info-trigger:focus {
          color: #0f172a;
          background: rgba(100, 116, 139, 0.22);
          outline: none;
        }
        :global(.dark) .hypo-info-trigger {
          color: #94a3b8;
          background: rgba(148, 163, 184, 0.15);
        }
        :global(.dark) .hypo-info-trigger:hover,
        :global(.dark) .hypo-info-trigger:focus {
          color: #f1f5f9;
          background: rgba(148, 163, 184, 0.25);
        }
        .hypo-tooltip {
          position: absolute;
          bottom: calc(100% + 7px);
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #f8fafc;
          font-size: 11px;
          font-weight: 500;
          padding: 5px 9px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.15s ease, visibility 0.15s ease;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          z-index: 30;
        }
        .hypo-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px;
          border-style: solid;
          border-color: #0f172a transparent transparent transparent;
        }
        :global(.dark) .hypo-tooltip {
          background: #1e293b;
          border: 1px solid #334155;
          color: #f1f5f9;
        }
        :global(.dark) .hypo-tooltip::after {
          border-color: #1e293b transparent transparent transparent;
        }
        .hypo-tooltip-container:hover .hypo-tooltip,
        .hypo-tooltip-container:focus-within .hypo-tooltip {
          opacity: 1;
          visibility: visible;
        }
        .hypo-sound {
          padding: 6px;
          border-radius: 7px;
          transition: background-color 0.15s ease;
        }
        .hypo-sound:hover {
          background: rgba(100, 116, 139, 0.1);
        }
        .hypo-timer-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin: 10px 0 10px;
        }
        .hypo-time {
          font-size: 44px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          font-family: ui-monospace, monospace;
          font-weight: 700;
          letter-spacing: -0.06em;
        }
        .hypo-timer-actions {
          display: flex;
          gap: 8px;
        }
        .hypo-timer-actions button {
          min-height: 40px;
          padding: 9px 15px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease, opacity 0.15s ease;
        }
        .hypo-reset {
          border-width: 1px;
        }
        .hypo-recheck {
          font-size: 11px;
          line-height: 1.5;
        }
        .hypo-sound-error {
          font-size: 11px;
          line-height: 1.5;
          margin-top: 7px;
        }
        .hypo-safety {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 14px;
          border-width: 1px;
          border-radius: 10px;
          font-size: 11px;
          line-height: 1.5;
        }
        .hypo-safety-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .hypo-safety strong {
          font-weight: 700;
          margin-right: 4px;
        }
        .hypo-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          border-top-width: 1px;
          padding: 12px 20px;
        }
        .hypo-done {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        @media (max-width: 639px) {
          .hypo-header {
            padding: 12px 16px;
          }
          .hypo-header h2 {
            font-size: 20px;
          }
          .hypo-content {
            padding: 14px 16px;
            gap: 12px;
          }
          .hypo-options {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .hypo-option {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            gap: 12px;
            min-height: 58px;
          }
          .hypo-option-top {
            gap: 10px;
          }
          .hypo-food-icon {
            font-size: 24px;
          }
          .hypo-tag {
            display: none;
          }
          .hypo-option-copy {
            flex: 1;
          }
          .hypo-option strong {
            font-size: 12px;
          }
          .hypo-option-amount {
            font-size: 10px;
          }
          .hypo-timer-panel {
            padding: 12px;
          }
          .hypo-time {
            font-size: 36px;
          }
          .hypo-timer-main {
            gap: 10px;
          }
          .hypo-timer-actions button {
            padding: 8px 11px;
            font-size: 11px;
            min-height: 36px;
          }
          .hypo-footer {
            padding: 10px 16px;
            justify-content: stretch;
          }
          .hypo-done {
            width: 100%;
          }
        }

        @media (max-height: 600px) and (max-width: 639px) {
          .hypo-header {
            padding: 8px 12px;
          }
          .hypo-header h2 {
            font-size: 18px;
          }
          .hypo-shield {
            width: 32px;
            height: 32px;
          }
          .hypo-content {
            padding: 8px 12px;
            gap: 8px;
          }
          .hypo-option {
            min-height: 46px;
            padding: 6px 10px;
          }
          .hypo-time {
            font-size: 30px;
          }
          .hypo-footer {
            padding: 6px 12px;
          }
          .hypo-done {
            min-height: 34px;
            padding: 6px 12px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
