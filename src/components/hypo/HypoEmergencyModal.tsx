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

  const indianFastCarbOptions = [
    { name: '1 tbsp Glucon-D powder / Glucovita Bolts', amount: 'Check the pack for a 15g carbohydrate portion.', icon: '⚡' },
    { name: 'Small Frooti / Réal juice', amount: 'Regular juice; measure 15g carbs using the label.', icon: '🧃' },
    { name: '15g sugar / sugar in water', amount: '15g table sugar, taken directly or dissolved in water.', icon: '🥄' },
  ];

  return (
    <div ref={modalRef} tabIndex={-1} className="hypo-overlay fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm">
      <section className="hypo-dialog bg-white text-slate-900 dark:bg-[var(--surface)] dark:text-slate-100" role="dialog" aria-modal="true" aria-labelledby="hypo-title" aria-describedby="hypo-summary">
        <header className="hypo-header bg-rose-600 text-white">
          <div className="hypo-heading">
            <span className="hypo-shield"><ShieldAlert size={23} /></span>
            <div><p className="hypo-eyebrow">QUICK-ACTION GUIDE · RULE OF 15</p><h2 id="hypo-title">Hypo SOS</h2></div>
          </div>
          <button type="button" className="hypo-close" onClick={() => setIsHypoModalOpen(false)} aria-label="Close emergency modal"><X size={21} /></button>
        </header>

        <p id="hypo-summary" className="hypo-notice bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200">Follow your care team’s hypo plan. This guide is not a live monitor or emergency service.</p>

        <div className="hypo-content">
          <section className="hypo-choices" aria-labelledby="hypo-carbs-title">
            <div className="hypo-step-heading"><span className="hypo-step bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">01</span><h3 id="hypo-carbs-title">Take 15g of fast-acting carbs</h3></div>
            <p className="hypo-hint text-slate-500 dark:text-slate-400">Check labels for 15g carbs. Select once taken.</p>
            <div className="hypo-options">
              {indianFastCarbOptions.map((option) => {
                const selected = carbTaken === option.name;
                return <button key={option.name} type="button" aria-pressed={selected} onClick={() => {
                  setCarbTaken(option.name);
                  if (!isTimerRunning && secondsRemaining === 15 * 60) startTimer();
                }} className={`hypo-option ${selected ? 'border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/30' : 'border-slate-200 bg-slate-50 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900/50'}`}>
                  <span className="hypo-food-icon" aria-hidden="true">{option.icon}</span>
                  <span className="hypo-option-copy"><strong>{option.name}</strong><small className="text-slate-500 dark:text-slate-400">{option.amount}</small></span>
                  {selected && <Check size={16} className="hypo-check text-rose-600 dark:text-rose-300" aria-hidden="true" />}
                </button>;
              })}
            </div>
          </section>

          <section className="hypo-timer-panel border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50" aria-labelledby="hypo-timer-title">
            <div className="hypo-timer-heading"><div className="hypo-step-heading"><Clock size={16} className="text-rose-600 dark:text-rose-300" /><h3 id="hypo-timer-title">Wait 15 minutes & recheck</h3></div><button type="button" className="hypo-sound text-slate-500 dark:text-slate-400" onClick={() => {
              if (soundEnabled) cancelChime();
              else if (isTimerRunning) armChime();
              setSoundEnabled(!soundEnabled);
            }} aria-pressed={soundEnabled} aria-label={soundEnabled ? 'Mute timer chime' : 'Enable timer chime'}>{soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button></div>
            <div className="hypo-timer-main"><div className="hypo-time" role="timer" aria-label="Time until glucose recheck">{formattedTime}</div><div className="hypo-timer-actions"><button type="button" onClick={isTimerRunning ? () => { cancelChime(); setIsTimerRunning(false); } : startTimer} className="hypo-timer-primary bg-rose-600 text-white hover:bg-rose-700">{isTimerRunning ? 'Pause timer' : secondsRemaining === 0 ? 'Restart timer' : secondsRemaining < 15 * 60 ? 'Resume timer' : 'Start 15m timer'}</button><button type="button" onClick={resetTimer} className="hypo-reset border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Reset</button></div></div>
            <p className="hypo-recheck text-slate-600 dark:text-slate-300">Recheck after 15 minutes. If still below 70 mg/dL (3.9 mmol/L), repeat with 15g carbs, or follow your care plan.</p>
            {soundError && <p role="status" className="hypo-sound-error text-amber-700 dark:text-amber-300">{soundError}</p>}
          </section>

          <aside className="hypo-safety border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200" aria-label="Severe low blood sugar safety">
            <ShieldAlert size={19} className="hypo-safety-icon" />
            <div><strong>Cannot swallow safely, seizure, or unconscious?</strong><p>Nothing by mouth. Give prescribed glucagon if available. Call emergency services and place the person on their side.</p></div>
          </aside>
        </div>

        <footer className="hypo-footer border-slate-200 dark:border-slate-700"><span className="text-slate-500 dark:text-slate-400">Timer works only while this dialog stays open.</span><button type="button" onClick={() => setIsHypoModalOpen(false)} className="hypo-done bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Close guide</button></footer>
      </section>
      <style jsx>{`
        .hypo-overlay { display: flex; padding: 12px; overflow-y: auto; }
        .hypo-dialog { width: 100%; max-width: 720px; flex-shrink: 0; margin: auto; border-radius: 18px; box-shadow: 0 28px 100px #0005; overflow: hidden; }
        .hypo-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 17px 22px; }
        .hypo-heading { display: flex; align-items: center; gap: 12px; }
        .hypo-shield { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border: 1px solid #ffffff40; border-radius: 12px; background: #ffffff14; }
        .hypo-eyebrow { font-size: 9px; font-weight: 600; letter-spacing: .13em; opacity: .85; }
        .hypo-header h2 { font-family: var(--font-body), sans-serif; font-size: 24px; font-weight: 650; letter-spacing: -.04em; line-height: 1.2; margin-top: 3px; }
        .hypo-close { min-width: 40px; min-height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
        .hypo-close:hover { background: #ffffff20; }
        .hypo-notice { padding: 10px 22px; font-size: 11px; line-height: 1.5; }
        .hypo-content { padding: 19px 22px; display: grid; gap: 17px; }
        .hypo-step-heading { display: flex; align-items: center; gap: 9px; }
        .hypo-step { padding: 4px 6px; font-size: 10px; font-weight: 700; border-radius: 6px; }
        .hypo-content h3 { font-family: var(--font-body), sans-serif; font-size: 13px; font-weight: 650; letter-spacing: -.015em; }
        .hypo-hint { font-size: 11px; line-height: 1.5; margin: 6px 0 11px; }
        .hypo-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .hypo-option { position: relative; display: flex; flex-direction: column; gap: 9px; text-align: left; padding: 13px; border-width: 1px; border-radius: 12px; transition: border-color .15s, background-color .15s; }
        .hypo-food-icon { font-size: 22px; line-height: 1; }
        .hypo-option-copy { display: flex; flex-direction: column; gap: 5px; }
        .hypo-option strong { font-size: 12px; font-weight: 600; line-height: 1.45; }
        .hypo-option small { font-size: 10px; line-height: 1.5; }
        .hypo-check { position: absolute; right: 10px; top: 11px; }
        .hypo-timer-panel { padding: 13px 16px; border-width: 1px; border-radius: 12px; }
        .hypo-timer-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .hypo-sound { padding: 6px; border-radius: 7px; }
        .hypo-timer-main { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin: 8px 0 10px; }
        .hypo-time { font-size: 46px; line-height: 1; font-variant-numeric: tabular-nums; font-family: ui-monospace, monospace; font-weight: 650; letter-spacing: -.065em; }
        .hypo-timer-actions { display: flex; gap: 8px; }
        .hypo-timer-actions button { min-height: 40px; padding: 9px 14px; border-radius: 8px; font-size: 11px; font-weight: 600; }
        .hypo-reset { border-width: 1px; }
        .hypo-recheck { font-size: 11px; line-height: 1.6; }
        .hypo-sound-error { font-size: 11px; line-height: 1.5; margin-top: 7px; }
        .hypo-safety { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-width: 1px; border-radius: 11px; font-size: 11px; line-height: 1.6; }
        .hypo-safety-icon { flex-shrink: 0; margin-top: 1px; }
        .hypo-safety strong { font-weight: 650; }
        .hypo-safety p { margin-top: 3px; }
        .hypo-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top-width: 1px; padding: 11px 22px; }
        .hypo-footer > span { font-size: 10px; line-height: 1.5; }
        .hypo-done { min-height: 38px; white-space: nowrap; border-radius: 8px; padding: 8px 14px; font-size: 11px; font-weight: 600; }
        @media (max-width: 639px) {
          .hypo-header { padding: 14px 16px; }
          .hypo-header h2 { font-size: 22px; }
          .hypo-eyebrow { font-size: 8px; }
          .hypo-notice { padding: 9px 16px; font-size: 10px; }
          .hypo-content { padding: 14px 16px; gap: 13px; }
          .hypo-options { grid-template-columns: 1fr; gap: 7px; }
          .hypo-option { flex-direction: row; align-items: center; padding: 10px 12px; gap: 12px; min-height: 62px; }
          .hypo-food-icon { width: 24px; flex-shrink: 0; }
          .hypo-option-copy { padding-right: 12px; gap: 3px; }
          .hypo-option strong { font-size: 11px; }
          .hypo-option small { font-size: 10px; }
          .hypo-check { top: 12px; right: 8px; }
          .hypo-timer-panel { padding: 11px 12px; }
          .hypo-content h3 { font-size: 12px; }
          .hypo-time { font-size: 37px; }
          .hypo-timer-main { gap: 10px; }
          .hypo-timer-actions { gap: 6px; }
          .hypo-timer-actions button { padding: 9px 10px; font-size: 10px; min-height: 36px; }
          .hypo-recheck { font-size: 10px; }
          .hypo-safety { font-size: 10px; padding: 10px 11px; gap: 8px; }
          .hypo-footer { padding: 10px 16px; gap: 10px; }
          .hypo-footer > span { font-size: 9px; }
        }
        @media (max-height: 700px) and (max-width: 639px) {
          .hypo-overlay { padding: 7px; }
          .hypo-header { padding: 10px 14px; }
          .hypo-notice { padding: 7px 14px; }
          .hypo-content { padding: 11px 14px; gap: 10px; }
          .hypo-option { padding: 8px 10px; min-height: 55px; }
          .hypo-hint { margin: 4px 0 7px; }
          .hypo-timer-main { margin: 5px 0 7px; }
          .hypo-time { font-size: 33px; }
          .hypo-footer { padding: 6px 14px; }
          .hypo-safety { padding: 8px 10px; line-height: 1.45; }
          .hypo-option { min-height: 51px; }
          .hypo-timer-panel { padding: 8px 10px; }
        }
        @media (max-height: 600px) and (max-width: 639px) {
          .hypo-header { padding: 8px 12px; }
          .hypo-header h2 { font-size: 18px; line-height: 1.15; margin-top: 1px; }
          .hypo-close { min-height: 32px; min-width: 32px; }
          .hypo-eyebrow { font-size: 7px; line-height: 1.2; }
          .hypo-shield { width: 32px; height: 32px; }
          .hypo-notice { padding: 6px 12px; font-size: 9px; line-height: 1.4; }
          .hypo-content { padding: 7px 12px; gap: 6px; }
          .hypo-hint { font-size: 9px; }
          .hypo-option { min-height: 44px; padding: 7px 10px; }
          .hypo-option small { display: none; }
          .hypo-option-copy { gap: 0; }
          .hypo-time { font-size: 30px; }
          .hypo-timer-actions button { min-height: 32px; padding: 7px 8px; font-size: 9px; }
          .hypo-recheck { font-size: 9px; line-height: 1.4; }
          .hypo-safety { font-size: 9px; line-height: 1.45; padding: 8px; }
          .hypo-done { min-height: 32px; padding: 6px 10px; }
          .hypo-footer { padding: 6px 12px; }
        }
        @media (max-height: 520px) and (min-width: 640px) {
          .hypo-overlay { padding: 8px; }
          .hypo-dialog { max-width: 940px; }
          .hypo-header { padding: 10px 18px; }
          .hypo-header h2 { font-size: 21px; }
          .hypo-notice { padding: 6px 18px; font-size: 10px; }
          .hypo-content { grid-template-columns: 1fr 1fr; padding: 9px 18px; gap: 10px 14px; }
          .hypo-options { gap: 6px; }
          .hypo-option { padding: 8px; gap: 6px; }
          .hypo-option small { display: none; }
          .hypo-option strong { font-size: 10px; }
          .hypo-option small { font-size: 9px; }
          .hypo-hint { font-size: 10px; margin: 5px 0 8px; }
          .hypo-content h3 { font-size: 11px; }
          .hypo-timer-panel { padding: 9px 12px; }
          .hypo-timer-main { margin: 8px 0; }
          .hypo-time { font-size: 33px; }
          .hypo-timer-actions button { padding: 7px 9px; min-height: 34px; font-size: 10px; }
          .hypo-recheck { font-size: 10px; }
          .hypo-safety { grid-column: 1 / -1; padding: 8px 12px; font-size: 10px; }
          .hypo-footer { padding: 8px 18px; }
        }
      `}</style>
    </div>
  );
}
