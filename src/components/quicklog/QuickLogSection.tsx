'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  convertGlucose,
  formatUnitLabel,
  parseGlucoseInput,
} from '@/utils/glucoseUtils';
import {
  Plus,
  Utensils,
  Syringe,
  Activity,
  Droplet,
  FileText,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

type LogTab = 'all' | 'meals' | 'insulin' | 'glucose' | 'activity';

export default function QuickLogSection() {
  const {
    meals,
    addMealLog,
    deleteMealLog,
    updateMealLog,
    insulinLogs,
    addInsulinLog,
    deleteInsulinLog,
    updateInsulinLog,
    readings,
    addReading,
    activityLogs,
    addActivityLog,
    deleteActivityLog,
    glucoseUnit,
  } = useApp();

  const [activeTab, setActiveTab] = useState<LogTab>('all');
  const [modalType, setModalType] = useState<'meal' | 'insulin' | 'glucose' | 'activity' | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState<string>(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );

  // Meal form state
  const [mealName, setMealName] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [mealNotes, setMealNotes] = useState('');

  // Insulin form state
  const [insulinUnits, setInsulinUnits] = useState('');
  const [insulinType, setInsulinType] = useState<'rapid' | 'basal'>('rapid');
  const [insulinBrand, setInsulinBrand] = useState('Novorapid');
  const [insulinNotes, setInsulinNotes] = useState('');

  // Glucose form state
  const [glucoseValue, setGlucoseValue] = useState('');
  const [glucoseNotes, setGlucoseNotes] = useState('');

  // Activity form state
  const [activityType, setActivityType] = useState<'walk' | 'run' | 'gym' | 'cycling' | 'yoga' | 'sports'>('walk');
  const [activityDuration, setActivityDuration] = useState('20');
  const [activityIntensity, setActivityIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');
  const [activityNotes, setActivityNotes] = useState('');

  // Feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetForms = () => {
    setEditingId(null);
    setMealName('');
    setMealCarbs('');
    setMealNotes('');
    setInsulinUnits('');
    setInsulinNotes('');
    setGlucoseValue('');
    setGlucoseNotes('');
    setActivityDuration('20');
    setActivityNotes('');
    setModalType(null);
  };

  // Submit handlers
  const handleMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const carbsNum = parseFloat(mealCarbs);
    if (isNaN(carbsNum) || carbsNum <= 0) {
      alert('Please enter a valid carbohydrate estimate in grams.');
      return;
    }

    const timestamp = new Date(`${formDate}T${formTime}:00`).toISOString();

    if (editingId) {
      updateMealLog(editingId, {
        name: mealName || 'Logged Meal',
        totalCarbs: carbsNum,
        mealType,
        notes: mealNotes,
        timestamp,
      });
      showToast('Meal updated successfully');
    } else {
      addMealLog({
        timestamp,
        mealType,
        name: mealName || 'Logged Meal',
        items: [
          {
            foodId: 'custom-food',
            name: mealName || 'Custom meal',
            servings: 1,
            servingDescription: 'Custom portion',
            carbsPerServing: carbsNum,
            totalCarbs: carbsNum,
          },
        ],
        totalCarbs: carbsNum,
        notes: mealNotes,
        isDemo: false,
      });
      showToast('Meal recorded to local logs');
    }
    resetForms();
  };

  const handleInsulinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unitsNum = parseFloat(insulinUnits);
    if (isNaN(unitsNum) || unitsNum <= 0) {
      alert('Please enter valid insulin units.');
      return;
    }

    const timestamp = new Date(`${formDate}T${formTime}:00`).toISOString();

    if (editingId) {
      updateInsulinLog(editingId, {
        units: unitsNum,
        type: insulinType,
        brandName: insulinBrand,
        notes: insulinNotes,
        timestamp,
      });
      showToast('Insulin dose updated');
    } else {
      addInsulinLog({
        timestamp,
        type: insulinType,
        units: unitsNum,
        brandName: insulinBrand,
        deliveryMethod: 'pen',
        notes: insulinNotes,
        isDemo: false,
      });
      showToast('Insulin dose logged');
    }
    resetForms();
  };

  const handleGlucoseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(glucoseValue);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid glucose number.');
      return;
    }

    const normalizedMgDl = parseGlucoseInput(val, glucoseUnit);
    const manualTimestamp = new Date(`${formDate}T${formTime}:00`);
    const timeLabel = manualTimestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    addReading({
      id: 'g-manual-' + Date.now(),
      timestamp: manualTimestamp.toISOString(),
      timeLabel,
      value: normalizedMgDl,
      trend: 'FLAT',
      notes: glucoseNotes || 'Manual fingerstick check',
      source: 'manual',
      isDemo: false,
    });

    showToast('Manual glucose reading saved');
    resetForms();
  };

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(activityDuration, 10);
    if (isNaN(mins) || mins <= 0) {
      alert('Please enter valid duration in minutes.');
      return;
    }

    const timestamp = new Date(`${formDate}T${formTime}:00`).toISOString();

    addActivityLog({
      timestamp,
      type: activityType,
      durationMinutes: mins,
      intensity: activityIntensity,
      notes: activityNotes,
      isDemo: false,
    });

    showToast('Activity logged');
    resetForms();
  };

  // Build combined list
  const allLogs = [
    ...meals.map((m) => ({
      id: m.id,
      kind: 'meal' as const,
      timestamp: m.timestamp,
      title: m.name,
      subtitle: `${m.totalCarbs}g estimated carbs · ${m.mealType}`,
      notes: m.notes,
      raw: m,
    })),
    ...insulinLogs.map((i) => ({
      id: i.id,
      kind: 'insulin' as const,
      timestamp: i.timestamp,
      title: `${i.units}u ${i.type === 'rapid' ? 'Rapid' : 'Basal'} (${i.brandName || 'Insulin'})`,
      subtitle: i.type === 'rapid' ? 'Bolus dose' : 'Long-acting basal',
      notes: i.notes,
      raw: i,
    })),
    ...activityLogs.map((a) => ({
      id: a.id,
      kind: 'activity' as const,
      timestamp: a.timestamp,
      title: `${a.durationMinutes} min ${a.type}`,
      subtitle: `${a.intensity} intensity`,
      notes: a.notes,
      raw: a,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs =
    activeTab === 'all'
      ? allLogs
      : activeTab === 'meals'
      ? allLogs.filter((l) => l.kind === 'meal')
      : activeTab === 'insulin'
      ? allLogs.filter((l) => l.kind === 'insulin')
      : activeTab === 'activity'
      ? allLogs.filter((l) => l.kind === 'activity')
      : allLogs;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-nest-500/10 text-nest-600 dark:text-nest-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quick Log & Records
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Functional local logging. All records remain 100% private in browser storage. Never suggests insulin doses.
          </p>
        </div>

        {/* Quick Log Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalType('meal')}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>+ Log Meal</span>
          </button>

          <button
            type="button"
            onClick={() => setModalType('insulin')}
            className="px-3 py-2 rounded-xl bg-nest-50 dark:bg-nest-950/40 border border-nest-200 dark:border-nest-800 text-nest-800 dark:text-nest-300 hover:bg-nest-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>+ Log Insulin</span>
          </button>

          <button
            type="button"
            onClick={() => setModalType('glucose')}
            className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>+ Glucose</span>
          </button>

          <button
            type="button"
            onClick={() => setModalType('activity')}
            className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>+ Activity</span>
          </button>
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          {(['all', 'meals', 'insulin', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Logs' : tab}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400">
          {filteredLogs.length} entries stored locally
        </span>
      </div>

      {/* Logs Table / Card List */}
      <div className="bg-white dark:bg-[#131b24] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-subtle">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No logs found</h4>
            <p className="text-xs text-slate-500">Add a meal, insulin dose, or walk using the buttons above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {log.kind === 'meal' ? (
                      <Utensils className="w-4 h-4 text-amber-500" />
                    ) : log.kind === 'insulin' ? (
                      <Syringe className="w-4 h-4 text-nest-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {log.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {log.kind}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {log.subtitle}
                    </div>
                    {log.notes && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 italic pt-0.5">
                        "{log.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right text-xs">
                    <div className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {log.kind === 'meal' && (
                      <button
                        type="button"
                        onClick={() => {
                          const m = log.raw as any;
                          setEditingId(m.id);
                          setMealName(m.name);
                          setMealCarbs(m.totalCarbs.toString());
                          setMealType(m.mealType);
                          setMealNotes(m.notes || '');
                          setModalType('meal');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {log.kind === 'insulin' && (
                      <button
                        type="button"
                        onClick={() => {
                          const ins = log.raw as any;
                          setEditingId(ins.id);
                          setInsulinUnits(ins.units.toString());
                          setInsulinType(ins.type);
                          setInsulinBrand(ins.brandName || 'Novorapid');
                          setInsulinNotes(ins.notes || '');
                          setModalType('insulin');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (log.kind === 'meal') deleteMealLog(log.id);
                        else if (log.kind === 'insulin') deleteInsulinLog(log.id);
                        else if (log.kind === 'activity') deleteActivityLog(log.id);
                        showToast('Record deleted');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form for Meal / Insulin / Glucose / Activity */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-auto flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {editingId ? 'Edit' : 'Add'}{' '}
                {modalType === 'meal'
                  ? 'Meal & Carbs'
                  : modalType === 'insulin'
                  ? 'Insulin Record'
                  : modalType === 'glucose'
                  ? 'Glucose Reading'
                  : 'Physical Activity'}
              </h3>
              <button
                onClick={resetForms}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meal Form */}
            {modalType === 'meal' && (
              <form onSubmit={handleMealSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meal Description / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 Chapatis + Dal Tadka, Dosa"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-nest-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Carbohydrates (Grams)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 45"
                      value={mealCarbs}
                      onChange={(e) => setMealCarbs(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Meal Type
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pre-bolused 15 min early"
                    value={mealNotes}
                    onChange={(e) => setMealNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-nest-600 hover:bg-nest-700 text-white font-semibold transition-colors"
                  >
                    Save Meal
                  </button>
                </div>
              </form>
            )}

            {/* Insulin Form */}
            {modalType === 'insulin' && (
              <form onSubmit={handleInsulinSubmit} className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  <strong>Safety Notice:</strong> GlucoNest records doses you administer. The app will never calculate or recommend insulin doses. Always follow your endocrinologist’s prescription.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Units Administered
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 4.5"
                      value={insulinUnits}
                      onChange={(e) => setInsulinUnits(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Insulin Type
                    </label>
                    <select
                      value={insulinType}
                      onChange={(e) => setInsulinType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    >
                      <option value="rapid">Rapid Bolus (Meal / Correction)</option>
                      <option value="basal">Basal (Long-Acting)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Name / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Novorapid, Humalog, Lantus, Tresiba"
                    value={insulinBrand}
                    onChange={(e) => setInsulinBrand(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Abdomen site, pre-meal"
                    value={insulinNotes}
                    onChange={(e) => setInsulinNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-nest-600 hover:bg-nest-700 text-white font-semibold transition-colors"
                  >
                    Save Insulin Record
                  </button>
                </div>
              </form>
            )}

            {/* Glucose Form */}
            {modalType === 'glucose' && (
              <form onSubmit={handleGlucoseSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Glucose Value ({formatUnitLabel(glucoseUnit)})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={glucoseUnit === 'mg/dL' ? 'e.g. 125' : 'e.g. 6.9'}
                    value={glucoseValue}
                    onChange={(e) => setGlucoseValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Context / Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fingerstick check before driving"
                    value={glucoseNotes}
                    onChange={(e) => setGlucoseNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                  >
                    Save Reading
                  </button>
                </div>
              </form>
            )}

            {/* Activity Form */}
            {modalType === 'activity' && (
              <form onSubmit={handleActivitySubmit} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Activity Type
                    </label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 capitalize"
                    >
                      <option value="walk">Walk</option>
                      <option value="run">Jogging / Run</option>
                      <option value="gym">Strength / Gym</option>
                      <option value="cycling">Cycling</option>
                      <option value="yoga">Yoga</option>
                      <option value="sports">Badminton / Sports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      required
                      value={activityDuration}
                      onChange={(e) => setActivityDuration(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'moderate', 'vigorous'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setActivityIntensity(lvl)}
                        className={`py-2 px-2 rounded-xl text-center capitalize transition-colors ${
                          activityIntensity === lvl
                            ? 'bg-nest-600 text-white font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Post-dinner walk with family"
                    value={activityNotes}
                    onChange={(e) => setActivityNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-nest-600 hover:bg-nest-700 text-white font-semibold transition-colors"
                  >
                    Save Activity
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
