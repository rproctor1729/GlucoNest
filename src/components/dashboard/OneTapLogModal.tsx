'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Utensils, Syringe, Activity, Check, Plus, Sparkles } from 'lucide-react';

type PendingInsulin = { units: number; subType: 'rapid' | 'basal'; label: string };

export default function OneTapLogModal() {
  const {
    isOneTapModalOpen,
    setIsOneTapModalOpen,
    addMealLog,
    addInsulinLog,
    addActivityLog,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'carbs' | 'insulin' | 'exercise'>('carbs');
  const [customValue, setCustomValue] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [insulinSubtype, setInsulinSubtype] = useState<'rapid' | 'basal'>('rapid');
  const [justLogged, setJustLogged] = useState<string | null>(null);
  // Insulin is never logged on a single tap: the user must confirm the exact dose first.
  const [pendingInsulin, setPendingInsulin] = useState<PendingInsulin | null>(null);

  // Clear any unconfirmed dose when the modal closes.
  useEffect(() => {
    if (!isOneTapModalOpen) setPendingInsulin(null);
  }, [isOneTapModalOpen]);

  if (!isOneTapModalOpen) return null;

  const handleInstantLog = (
    type: 'carbs' | 'exercise',
    value: number,
    subType?: string,
    itemNote?: string
  ) => {
    const timestamp = new Date().toISOString();
    let saved: boolean;

    if (type === 'carbs') {
      saved = addMealLog({
        timestamp,
        mealType: 'snack',
        name: itemNote || `${value}g Carbs`,
        items: [
          {
            foodId: 'quick-log-carb',
            name: itemNote || 'One-tap Carbs',
            servings: 1,
            servingDescription: `${value}g portion`,
            carbsPerServing: value,
            totalCarbs: value,
          },
        ],
        totalCarbs: value,
        notes: note || undefined,
        isDemo: false,
      });
    } else {
      saved = addActivityLog({
        timestamp,
        type: 'walk',
        durationMinutes: value,
        intensity: 'moderate',
        notes: itemNote || note || undefined,
        isDemo: false,
      });
    }

    setJustLogged(saved
      ? `${value}${type === 'carbs' ? 'g carbs' : ' min activity'} logged`
      : 'Not saved. Export a backup before leaving this page.');
    setTimeout(() => {
      setJustLogged(null);
      setIsOneTapModalOpen(false);
      setCustomValue('');
      setNote('');
    }, 700);
  };

  const confirmInsulin = () => {
    if (!pendingInsulin) return;
    const saved = addInsulinLog({
      timestamp: new Date().toISOString(),
      type: pendingInsulin.subType,
      units: pendingInsulin.units,
      brandName: pendingInsulin.subType === 'basal' ? 'Lantus / Tresiba' : 'Novorapid / Humalog',
      deliveryMethod: 'pen',
      notes: pendingInsulin.label || note || undefined,
      isDemo: false,
    });
    setPendingInsulin(null);
    setJustLogged(saved
      ? `${pendingInsulin.units}u insulin logged`
      : 'Not saved. Export a backup before leaving this page.');
    setTimeout(() => {
      setJustLogged(null);
      setIsOneTapModalOpen(false);
      setCustomValue('');
      setNote('');
    }, 700);
  };

  const requestInsulin = (units: number, subType: 'rapid' | 'basal', label: string) => {
    setPendingInsulin({ units, subType, label });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customValue);
    if (isNaN(val) || val <= 0) return;

    if (activeTab === 'insulin') {
      requestInsulin(val, insulinSubtype, note);
      return;
    }
    handleInstantLog(activeTab, val, undefined, note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="one-tap-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nest-500"></span>
              <h2 id="one-tap-title" className="text-base font-semibold text-slate-900 dark:text-white">
                One-tap log
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Log in under 3 seconds. Presets or quick custom numbers.
            </p>
          </div>
          <button
            onClick={() => setIsOneTapModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close one-tap log"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-slate-50 dark:bg-[#0f161e] border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('carbs'); setPendingInsulin(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'carbs'
                ? 'bg-white dark:bg-slate-800 text-nest-600 dark:text-nest-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Carbs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insulin')}
            className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'insulin'
                ? 'bg-white dark:bg-slate-800 text-nest-600 dark:text-nest-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Insulin</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('exercise'); setPendingInsulin(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'exercise'
                ? 'bg-white dark:bg-slate-800 text-nest-600 dark:text-nest-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {justLogged && (
          <div className="bg-emerald-500 text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{justLogged}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-5 space-y-5">
          {activeTab === 'carbs' && (
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Instant Carbs Presets
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Hypo Rescue', value: 15, sub: 'Glucon-D / Juice' },
                  { label: 'Snack / Fruit', value: 25, sub: 'Papaya / Apple' },
                  { label: 'Lunch / Roti', value: 45, sub: '2 Chapatis + Dal' },
                  { label: 'Dinner / Rice', value: 65, sub: 'Rice bowl' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleInstantLog('carbs', item.value, 'meal', item.label)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-nest-500 hover:bg-nest-50/50 dark:hover:bg-nest-950/20 text-center transition-all group"
                  >
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white group-hover:text-nest-600 dark:group-hover:text-nest-400">
                      +{item.value}g
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Indian favorites defaults */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2">
                  Indian Favorites (estimates; count your own portions):
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '3 Idlis + Sambar', carbs: 45 },
                    { label: '2 Phulkas + Dal', carbs: 48 },
                    { label: '1 Katori Poha', carbs: 32 },
                  ].map((rec) => (
                    <button
                      key={rec.label}
                      type="button"
                      onClick={() => handleInstantLog('carbs', rec.carbs, 'meal', rec.label)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-nest-400 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-nest-500" />
                      <span>{rec.label}</span>
                      <span className="font-mono text-slate-400">({rec.carbs}g)</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insulin' && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Select Dose
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => { setInsulinSubtype('rapid'); setPendingInsulin(null); }}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      insulinSubtype === 'rapid'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Rapid Bolus
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInsulinSubtype('basal'); setPendingInsulin(null); }}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      insulinSubtype === 'basal'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Basal / Long
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { units: 1, label: 'Correction 1u' },
                  { units: 2, label: 'Light 2u' },
                  { units: 4, label: 'Standard 4u' },
                  { units: 6, label: 'Full meal 6u' },
                ].map((item) => (
                  <button
                    key={item.units}
                    type="button"
                    onClick={() => requestInsulin(item.units, insulinSubtype, `${item.units}u ${insulinSubtype}`)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-nest-500 hover:bg-nest-50/50 text-center transition-all group"
                  >
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white group-hover:text-nest-600 dark:group-hover:text-nest-400">
                      +{item.units}u
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>

              {pendingInsulin && (
                <div role="alertdialog" aria-label="Confirm insulin dose" className="mt-4 p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 space-y-3">
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    Confirm you gave <strong className="font-mono">{pendingInsulin.units}u</strong> of {pendingInsulin.subType} insulin. This only records the dose; it does not calculate one.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingInsulin(null)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmInsulin}
                      className="px-4 py-2 rounded-xl bg-nest-600 hover:bg-nest-700 text-white text-xs font-semibold"
                    >
                      Yes, log {pendingInsulin.units}u
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'exercise' && (
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Activity Presets
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { mins: 15, label: 'Gentle Walk', icon: '🚶' },
                  { mins: 30, label: 'Brisk Walk', icon: '🚶‍♂️' },
                  { mins: 45, label: 'Run / Jog', icon: '🏃' },
                  { mins: 30, label: 'Gym / Strength', icon: '🏋️' },
                  { mins: 45, label: 'Cycling', icon: '🚴' },
                  { mins: 25, label: 'Yoga / Asana', icon: '🧘' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleInstantLog('exercise', item.mins, 'walk', item.label)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-nest-500 text-left transition-all"
                  >
                    <div className="text-lg">{item.icon}</div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">{item.label}</div>
                    <div className="text-[11px] font-mono text-slate-500">{item.mins} minutes</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Custom Input Row */}
          <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                aria-label={activeTab === 'carbs' ? 'Custom grams' : activeTab === 'insulin' ? 'Custom units' : 'Minutes'}
                placeholder={
                  activeTab === 'carbs'
                    ? 'Custom grams (e.g. 35)'
                    : activeTab === 'insulin'
                    ? 'Custom units (e.g. 2.5)'
                    : 'Minutes (e.g. 40)'
                }
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-nest-500/50"
              />
              <button
                type="submit"
                disabled={!customValue}
                className="px-4 py-2.5 rounded-xl bg-nest-600 hover:bg-nest-700 disabled:opacity-40 text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{activeTab === 'insulin' ? 'Review' : 'Log'}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Optional note (e.g. '2 rotis with dal', 'post-dinner walk')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-nest-500"
            />
          </form>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#0f161e] border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
          Logs are saved in this browser. Insulin doses need confirmation before they are recorded.
        </div>
      </div>
    </div>
  );
}
