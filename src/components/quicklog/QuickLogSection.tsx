'use client';

import { useModalFocus } from '@/components/common/useModalFocus';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { recordId } from '@/utils/recordId';
import { visibleRecords } from '@/utils/demoVisibility';
import { localDateTimeInputs, parseLocalDateTime } from '@/utils/localDateTime';
import {
  formatUnitLabel,
  convertGlucose,
  parseGlucoseInput,
} from '@/utils/glucoseUtils';
import {
  Utensils,
  Syringe,
  Activity,
  Droplet,
  FileText,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { ActivityLogEntry, InsulinLogEntry, MealLogEntry } from '@/types';

type LogTab = 'all' | 'meals' | 'insulin' | 'glucose' | 'activity';

export default function QuickLogSection() {
  const {
    meals,
    manualReadings,
    deleteManualReading,
    addMealLog,
    deleteMealLog,
    updateMealLog,
    insulinLogs,
    addInsulinLog,
    deleteInsulinLog,
    updateInsulinLog,
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
  const [formDate, setFormDate] = useState<string>(() => localDateTimeInputs().date);
  const [formTime, setFormTime] = useState<string>(
    localDateTimeInputs().time
  );

  // Meal form state
  const [mealName, setMealName] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealType, setMealType] = useState<MealLogEntry['mealType']>('lunch');
  const [mealNotes, setMealNotes] = useState('');

  // Insulin form state
  const [insulinUnits, setInsulinUnits] = useState('');
  const [insulinType, setInsulinType] = useState<InsulinLogEntry['type']>('rapid');
  const [insulinBrand, setInsulinBrand] = useState('');
  const [insulinNotes, setInsulinNotes] = useState('');
  const [isRepeatingInsulin, setIsRepeatingInsulin] = useState(false);
  const [pendingInsulinConfirmation, setPendingInsulinConfirmation] = useState(false);

  // Glucose form state
  const [glucoseValue, setGlucoseValue] = useState('');
  const [glucoseNotes, setGlucoseNotes] = useState('');

  // Activity form state
  const [activityType, setActivityType] = useState<ActivityLogEntry['type']>('walk');
  const [activityDuration, setActivityDuration] = useState('20');
  const [activityIntensity, setActivityIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');
  const [activityNotes, setActivityNotes] = useState('');

  // Feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    toastTimer.current = setTimeout(() => setToastMessage(null), 4000);
  };

  const resetForms = () => {
    setEditingId(null);
    setIsRepeatingInsulin(false);
    setPendingInsulinConfirmation(false);
    setMealName('');
    setMealCarbs('');
    setMealNotes('');
    setInsulinUnits('');
    setInsulinBrand('');
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
    if (!Number.isFinite(carbsNum) || carbsNum < 0) {
      alert('Please enter a valid carbohydrate estimate in grams.');
      return;
    }

    const dateTime = parseLocalDateTime(formDate, formTime);
    if (!dateTime) { showToast('Choose a valid local date and time.'); return; }
    const timestamp = dateTime.toISOString();

    if (editingId) {
      const saved = updateMealLog(editingId, {
        name: mealName || 'Logged Meal',
        totalCarbs: carbsNum,
        items: [{ foodId: 'custom-food', name: mealName || 'Logged meal', servings: 1, servingDescription: 'Custom portion', carbsPerServing: carbsNum, totalCarbs: carbsNum }],
        mealType,
        notes: mealNotes,
        timestamp,
      });
      showToast(saved ? 'Meal updated successfully' : 'Not saved. Export a backup before leaving this page.');
    } else {
      const saved = addMealLog({
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
      showToast(saved ? 'Meal recorded to local logs' : 'Not saved. Export a backup before leaving this page.');
    }
    resetForms();
  };

  const handleInsulinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unitsNum = parseFloat(insulinUnits);
    if (!Number.isFinite(unitsNum) || unitsNum <= 0) {
      alert('Please enter valid insulin units.');
      return;
    }
    if (isRepeatingInsulin && !pendingInsulinConfirmation) {
      setPendingInsulinConfirmation(true);
      return;
    }

    const dateTime = parseLocalDateTime(formDate, formTime);
    if (!dateTime) { showToast('Choose a valid local date and time.'); return; }
    const timestamp = dateTime.toISOString();

    if (editingId) {
      const saved = updateInsulinLog(editingId, {
        units: unitsNum,
        type: insulinType,
        brandName: insulinBrand,
        notes: insulinNotes,
        timestamp,
      });
      showToast(saved ? 'Insulin dose updated' : 'Not saved. Export a backup before leaving this page.');
    } else {
      const saved = addInsulinLog({
        timestamp,
        type: insulinType,
        units: unitsNum,
        brandName: insulinBrand,
        deliveryMethod: 'pen',
        notes: insulinNotes,
        isDemo: false,
      });
      showToast(saved ? 'Insulin dose logged' : 'Not saved. Export a backup before leaving this page.');
    }
    resetForms();
  };

  const recentMeals = [...meals]
    .filter((meal) => !meal.isDemo)
    .sort((first, second) => Date.parse(second.timestamp) - Date.parse(first.timestamp))
    .slice(0, 3);
  const recentInsulin = [...insulinLogs]
    .filter((entry) => !entry.isDemo)
    .sort((first, second) => Date.parse(second.timestamp) - Date.parse(first.timestamp))
    .slice(0, 1)[0];

  const setFormDateTimeToNow = () => {
    const inputs = localDateTimeInputs();
    setFormDate(inputs.date);
    setFormTime(inputs.time);
  };

  const openNewLog = (type: Exclude<typeof modalType, null>) => {
    resetForms();
    setFormDateTimeToNow();
    setModalType(type);
  };

  const prepareRecentMeal = (meal: MealLogEntry) => {
    setEditingId(null);
    setMealName(meal.name);
    setMealCarbs(String(meal.totalCarbs));
    setMealType(meal.mealType);
    setMealNotes('');
    setFormDateTimeToNow();
    setModalType('meal');
  };

  const prepareRecentInsulin = (entry: InsulinLogEntry) => {
    setEditingId(null);
    setInsulinUnits(String(entry.units));
    setInsulinType(entry.type);
    setInsulinBrand(entry.brandName || '');
    setInsulinNotes('');
    setIsRepeatingInsulin(true);
    setPendingInsulinConfirmation(false);
    setFormDateTimeToNow();
    setModalType('insulin');
  };

  const handleGlucoseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(glucoseValue);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid glucose number.');
      return;
    }

    const normalizedMgDl = parseGlucoseInput(val, glucoseUnit);
    if (!Number.isFinite(normalizedMgDl) || normalizedMgDl < 20 || normalizedMgDl > 600) {
      showToast('Enter a glucose value between 20 and 600 mg/dL (1.1–33.3 mmol/L).');
      return;
    }
    const manualTimestamp = parseLocalDateTime(formDate, formTime);
    if (!manualTimestamp) { showToast('Choose a valid local date and time.'); return; }
    const timeLabel = manualTimestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const saved = addReading({
      id: recordId('g-manual'),
      timestamp: manualTimestamp.toISOString(),
      timeLabel,
      value: normalizedMgDl,
      notes: glucoseNotes || 'Manual fingerstick check',
      source: 'manual',
      isDemo: false,
    });

    showToast(saved ? 'Manual glucose reading saved' : 'Not saved. Export a backup before leaving this page.');
    resetForms();
  };

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(activityDuration, 10);
    if (!Number.isFinite(mins) || mins <= 0) {
      alert('Please enter valid duration in minutes.');
      return;
    }

    const dateTime = parseLocalDateTime(formDate, formTime);
    if (!dateTime) { showToast('Choose a valid local date and time.'); return; }
    const timestamp = dateTime.toISOString();

    const saved = addActivityLog({
      timestamp,
      type: activityType,
      durationMinutes: mins,
      intensity: activityIntensity,
      notes: activityNotes,
      isDemo: false,
    });

    showToast(saved ? 'Activity logged' : 'Not saved. Export a backup before leaving this page.');
    resetForms();
  };

  // Build combined list
  const allLogs = [
    ...manualReadings.map(reading => ({
      id: reading.id ?? reading.timestamp, kind: 'glucose' as const, timestamp: reading.timestamp,
      title: `${convertGlucose(reading.value, glucoseUnit)} ${formatUnitLabel(glucoseUnit)}`,
      subtitle: 'Personal glucose reading', notes: reading.notes, raw: reading,
    })),
    ...visibleRecords(meals).map((m) => ({
      id: m.id,
      kind: 'meal' as const,
      timestamp: m.timestamp,
      title: m.name,
      subtitle: `${m.totalCarbs}g estimated carbs · ${m.mealType}`,
      notes: m.notes,
      raw: m,
    })),
    ...visibleRecords(insulinLogs).map((i) => ({
      id: i.id,
      kind: 'insulin' as const,
      timestamp: i.timestamp,
      title: `${i.units}u ${i.type === 'rapid' ? 'Rapid' : 'Basal'} (${i.brandName || 'Insulin'})`,
      subtitle: i.type === 'rapid' ? 'Bolus dose' : 'Long-acting basal',
      notes: i.notes,
      raw: i,
    })),
    ...visibleRecords(activityLogs).map((a) => ({
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
      : activeTab === 'glucose'
      ? allLogs.filter((l) => l.kind === 'glucose')
      : activeTab === 'activity'
      ? allLogs.filter((l) => l.kind === 'activity')
      : allLogs;

  const modalRef = useModalFocus(!!modalType, () => setModalType(null));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div role="group" aria-label="Record actions" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Quick Log Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openNewLog('meal')}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>+ Log Meal</span>
          </button>

          <button
            type="button"
            onClick={() => openNewLog('insulin')}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>+ Log Insulin</span>
          </button>

          <button
            type="button"
            onClick={() => openNewLog('glucose')}
            className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>+ Glucose</span>
          </button>

          <button
            type="button"
            onClick={() => openNewLog('activity')}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>+ Activity</span>
          </button>
        </div>
      </div>

      {(recentMeals.length > 0 || recentInsulin) && (
        <section aria-label="Recent entries" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--surface)] p-4  ">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 ">Repeat a recent entry</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            These buttons prefill a new log with today&apos;s date and time. Review every field before saving.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentMeals.map((meal) => (
              <button
                key={meal.id}
                type="button"
                onClick={() => prepareRecentMeal(meal)}
                className="min-h-9 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50"
              >
                Repeat meal: {meal.name} · {meal.totalCarbs}g
              </button>
            ))}
            {recentInsulin && (
              <button
                type="button"
                onClick={() => prepareRecentInsulin(recentInsulin)}
                className="min-h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Prefill last insulin log · {recentInsulin.units} units
              </button>
            )}
          </div>
        </section>
      )}

      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'meals', 'insulin', 'glucose', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab === 'all' ? 'All Logs' : tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filteredLogs.length} records · sample entries are labelled
        </span>
      </div>

      {/* Logs Table / Card List */}
      <div className="bg-white dark:bg-[var(--surface)] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-subtle">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No logs found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add a meal, glucose reading, insulin entry, or activity using the buttons above.</p>
          </div>
        ) : (
          <div className="divide-y border-slate-200 dark:border-slate-800 dark:border-slate-200 dark:border-slate-800">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {log.kind === 'meal' ? (
                      <Utensils className="w-4 h-4 text-nest-500" />
                    ) : log.kind === 'insulin' ? (
                      <Syringe className="w-4 h-4 text-nest-500" />
                    ) : log.kind === 'glucose' ? (
                      <Droplet className="w-4 h-4 text-nest-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-nest-500" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {log.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.kind}
                      </span>
                    </div>
                    {log.raw.isDemo && <span className="inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">SAMPLE RECORD</span>}
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {log.subtitle}
                    </div>
                    {log.notes && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 italic pt-0.5">
                        &quot;{log.notes}&quot;
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right text-xs">
                    <div className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {log.kind === 'meal' && !log.raw.isDemo && (
                      <button
                        type="button"
                        onClick={() => {
                          const m = log.raw as MealLogEntry;
                          setEditingId(m.id);
                          const inputs = localDateTimeInputs(new Date(m.timestamp));
                          setFormDate(inputs.date); setFormTime(inputs.time);
                          setMealName(m.name);
                          setMealCarbs(m.totalCarbs.toString());
                          setMealType(m.mealType);
                          setMealNotes(m.notes || '');
                          setModalType('meal');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {log.kind === 'insulin' && !log.raw.isDemo && (
                      <button
                        type="button"
                        onClick={() => {
                          const ins = log.raw as InsulinLogEntry;
                          setEditingId(ins.id);
                          setIsRepeatingInsulin(false); setPendingInsulinConfirmation(false);
                          const inputs = localDateTimeInputs(new Date(ins.timestamp));
                          setFormDate(inputs.date); setFormTime(inputs.time);
                          setInsulinUnits(ins.units.toString());
                          setInsulinType(ins.type);
                          setInsulinBrand(ins.brandName || '');
                          setInsulinNotes(ins.notes || '');
                          setModalType('insulin');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!log.raw.isDemo && (
                      <button
                        type="button"
                        onClick={() => {
                          const saved = log.kind === 'meal'
                            ? deleteMealLog(log.id)
                            : log.kind === 'insulin'
                              ? deleteInsulinLog(log.id)
                              : log.kind === 'glucose'
                                ? deleteManualReading(log.id)
                                : deleteActivityLog(log.id);
                          showToast(saved ? 'Record deleted' : 'Delete not saved. Export a backup before leaving this page.');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form for Meal / Insulin / Glucose / Activity */}
      {modalType && (
        <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Add or edit a record" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-[var(--surface)] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-auto flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
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
                aria-label="Close record form"
                onClick={resetForms}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meal Form */}
            {modalType === 'meal' && (
              <form onSubmit={handleMealSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label htmlFor="record-field-1" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meal Description / Name
                  </label>
                  <input id="record-field-1"
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
                    <label htmlFor="record-field-2" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Carbohydrates (Grams)
                    </label>
                    <input id="record-field-2"
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
                    <label htmlFor="record-field-3" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Meal Type
                    </label>
                    <select id="record-field-3"
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as MealLogEntry['mealType'])}
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
                    <label htmlFor="record-field-4" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input id="record-field-4"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="record-field-5" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input id="record-field-5"
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="record-field-6" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes (Optional)
                  </label>
                  <input id="record-field-6"
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
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
                <div className="p-3 bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-800  rounded-xl text-slate-900 dark:text-slate-100  text-xs leading-relaxed">
                  <strong>Safety Notice:</strong> GlucoNest records doses you administer. The app will never calculate or recommend insulin doses. Always follow your endocrinologist’s prescription.
                </div>
                {isRepeatingInsulin && (
                  <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
                    Previous details are only a prefill, not a dose recommendation. Check the units, type, and time against your current care plan before recording.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="record-field-7" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Units Administered
                    </label>
                    <input id="record-field-7"
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
                    <label htmlFor="record-field-8" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Insulin Type
                    </label>
                    <select id="record-field-8"
                      value={insulinType}
                      onChange={(e) => setInsulinType(e.target.value as InsulinLogEntry['type'])}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    >
                      <option value="rapid">Rapid Bolus (Meal / Correction)</option>
                      <option value="basal">Basal (Long-Acting)</option>
                      <option value="premix">Premixed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="record-field-9" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Name / Description
                  </label>
                  <input id="record-field-9"
                    type="text"
                    placeholder="e.g. Novorapid, Humalog, Lantus, Tresiba"
                    value={insulinBrand}
                    onChange={(e) => setInsulinBrand(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800  bg-slate-50 dark:bg-slate-900 "
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="record-field-10" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input id="record-field-10"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="record-field-11" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input id="record-field-11"
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="record-field-12" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes (Optional)
                  </label>
                  <input id="record-field-12"
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
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                  {pendingInsulinConfirmation ? (
                    <>
                      <span className="mr-auto text-xs text-slate-900 dark:text-slate-100 ">Confirm logging {insulinUnits} units as entered?</span>
                      <button type="button" onClick={() => setPendingInsulinConfirmation(false)} className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Review</button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-nest-600 hover:bg-nest-700 text-white font-semibold transition-colors">Confirm log</button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-nest-600 hover:bg-nest-700 text-white font-semibold transition-colors"
                    >
                      {isRepeatingInsulin ? 'Review previous details' : 'Save Insulin Record'}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Glucose Form */}
            {modalType === 'glucose' && (
              <form onSubmit={handleGlucoseSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label htmlFor="record-field-13" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Glucose Value ({formatUnitLabel(glucoseUnit)})
                  </label>
                  <input id="record-field-13"
                    type="number"
                    step="any"
                    required
                    placeholder={glucoseUnit === 'mg/dL' ? 'e.g. 125' : 'e.g. 6.9'}
                    value={glucoseValue}
                    onChange={(e) => setGlucoseValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800  bg-slate-50 dark:bg-slate-900  tabular-nums text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="record-field-14" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input id="record-field-14"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="record-field-15" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input id="record-field-15"
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="record-field-16" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Context / Note
                  </label>
                  <input id="record-field-16"
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
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
                    <label htmlFor="record-field-17" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Activity Type
                    </label>
                    <select id="record-field-17"
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value as ActivityLogEntry['type'])}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800  bg-slate-50 dark:bg-slate-900  capitalize"
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
                    <label htmlFor="record-field-18" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Duration (Minutes)
                    </label>
                    <input id="record-field-18"
                      type="number"
                      required
                      value={activityDuration}
                      onChange={(e) => setActivityDuration(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800  bg-slate-50 dark:bg-slate-900  tabular-nums"
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
                            ? 'bg-nest-600 text-white font-bold'
                            : ' bg-nest-50 text-nest-700 dark:bg-nest-950 dark:text-nest-300'
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
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
