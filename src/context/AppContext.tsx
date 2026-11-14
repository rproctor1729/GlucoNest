'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  NavigationSection,
  GlucoseUnit,
  GlucoseReading,
  MealLogEntry,
  InsulinLogEntry,
  ActivityLogEntry,
  CommunityFeedback,
  MealItemSelection,
  PatternInsight,
  EducationalGuide,
} from '../types';
import {
  isActivityLogEntry,
  isArrayOf,
  isCommunityFeedback,
  isInsulinLogEntry,
  isManualGlucoseReading,
  isMealLogEntry,
  LOCAL_DATA_KEYS,
  LocalDataBackup,
  mergeRecordsById,
  replaceDemoRecords,
} from '../lib/localData';
import { APP_LANGUAGES, type AppLanguage } from '../lib/i18n';
import { myDayViewFromHash, sectionFromHash, type MyDayView } from '../lib/navigation';
import type { TeamMember } from '../data/teamMembers';
import { mockPatternInsights } from '../data/mockInsights';
import { educationalGuides } from '../data/educationalContent';
import { recordId } from '../utils/recordId';
import { getLatestReading } from '../utils/latestReading';
import { mockGlucoseReadings } from '../data/mockGlucose';
import { initialMockMeals } from '../data/mockMeals';
import { initialMockInsulin } from '../data/mockInsulin';
import {
  fetchNightscoutReadingsWithRetry,
  NightscoutConfig,
  NightscoutError,
} from '../lib/integrations/nightscout';

// Sample activity shown in demo mode. Built on demand so its timestamp is fresh.
function makeDemoActivity(): ActivityLogEntry {
  return {
    id: 'act-01',
    timestamp: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    type: 'walk',
    durationMinutes: 25,
    intensity: 'light',
    notes: 'Brisk evening neighborhood walk after tea',
    isDemo: true,
  };
}

export type GlucoseDataSource = 'demo' | 'manual' | 'nightscout';
export type DataConnectionStatus = 'disconnected' | 'fetching' | 'connected' | 'error';

interface AppContextType {
  teamMembers: readonly TeamMember[];
  // Navigation
  activeSection: NavigationSection;
  setActiveSection: (sec: NavigationSection) => void;
  // Which view is open inside My Day (today, insights or the doctor report).
  myDayView: MyDayView;
  setMyDayView: (view: MyDayView) => void;

  // Preferences
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;
  glucoseUnit: GlucoseUnit;
  setGlucoseUnit: (unit: GlucoseUnit) => void;
  toggleGlucoseUnit: () => void;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  targetRange: { low: number; high: number };
  largeText: boolean;
  toggleLargeText: () => void;
  saveTargetRange: (low: number, high: number) => boolean;
  onboardingComplete: boolean;
  completeOnboarding: (preferences: {
    language: AppLanguage;
    glucoseUnit: GlucoseUnit;
    targetRange: { low: number; high: number };
    connectDataSource: boolean;
  }) => boolean;

  // Readings
  readings: GlucoseReading[];
  manualReadings: GlucoseReading[];
  deleteManualReading: (id: string) => boolean;
  importManualReadings: (readings: GlucoseReading[]) => { imported: number; skipped: number } | null;
  currentReading: GlucoseReading | null;
  addReading: (reading: GlucoseReading) => boolean;
  dataSource: GlucoseDataSource;
  connectionStatus: DataConnectionStatus;
  isNightscoutConnected: boolean;
  nightscoutUrl: string;
  lastSuccessfulFetch: string | null;
  connectionError: string | null;
  connectNightscout: (config: NightscoutConfig) => Promise<void>;
  refreshNightscout: () => Promise<void>;
  disconnectNightscout: () => void;

  // Meal Logs
  meals: MealLogEntry[];
  addMealLog: (meal: Omit<MealLogEntry, 'id'>) => boolean;
  updateMealLog: (id: string, meal: Partial<MealLogEntry>) => boolean;
  deleteMealLog: (id: string) => boolean;

  // Insulin Logs
  insulinLogs: InsulinLogEntry[];
  addInsulinLog: (entry: Omit<InsulinLogEntry, 'id'>) => boolean;
  updateInsulinLog: (id: string, entry: Partial<InsulinLogEntry>) => boolean;
  deleteInsulinLog: (id: string) => boolean;

  // Activity & Notes
  activityLogs: ActivityLogEntry[];
  addActivityLog: (act: Omit<ActivityLogEntry, 'id'>) => boolean;
  deleteActivityLog: (id: string) => boolean;

  // Active Food Library Meal Plate
  mealPlate: MealItemSelection[];
  addToMealPlate: (item: MealItemSelection) => void;
  updateMealPlateItem: (foodId: string, servings: number) => void;
  removeFromMealPlate: (foodId: string) => void;
  clearMealPlate: () => void;

  // Pattern Insights
  patterns: PatternInsight[];
  activePattern: PatternInsight;
  setActivePatternId: (id: string) => void;

  // Guides
  guides: EducationalGuide[];
  selectedGuide: EducationalGuide | null;
  setSelectedGuide: (guide: EducationalGuide | null) => void;

  // Community Feedback
  feedbackList: CommunityFeedback[];
  submitFeedback: (feedback: Omit<CommunityFeedback, 'id' | 'submittedAt'>) => boolean;

  // Modals
  isHypoModalOpen: boolean;
  setIsHypoModalOpen: (open: boolean) => void;
  triggerHypoEmergency: () => void;
  isOneTapModalOpen: boolean;
  setIsOneTapModalOpen: (open: boolean) => void;


  // Demo Reset
  resetDemoData: () => void;

  // Local data safety
  localDataError: string | null;
  dismissLocalDataError: () => void;
  importLocalDataBackup: (backup: LocalDataBackup) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function readPreference<T extends string>(key: string, choices: readonly T[]): T | null {
  const raw = window.localStorage.getItem(key);
  return choices.find(choice => raw === choice || raw === JSON.stringify(choice)) ?? null;
}

// A successful write is visible to the next handler even before React renders.
function useCollection<T>(initial: T[] | (() => T[])) {
  const [items, setItems] = useState(initial);
  const latest = useRef(items);
  const replace = useCallback((next: T[]) => {
    latest.current = next;
    setItems(next);
  }, []);
  return [items, replace, latest] as const;
}

export function AppProvider({ children, teamMembers = [] }: { children: React.ReactNode; teamMembers?: readonly TeamMember[] }) {
  // Navigation
  const [activeSection, setActiveSectionState] = useState<NavigationSection>('home');
  const [myDayView, setMyDayViewState] = useState<MyDayView>('today');
  const setActiveSection = useCallback((section: NavigationSection) => {
    // Old ids (insights, report) open the combined devices & insights page.
    const isDoctorReport = section === 'report';
    const isInsights = section === 'insights';
    const target: NavigationSection = (isDoctorReport || isInsights) ? 'devices' : section;
    setActiveSectionState(target);
    setMyDayViewState('today');
    const hash = isDoctorReport ? '#devices#doctor-report' : isInsights ? '#devices#insights-overview' : `#${target}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
      if (target === 'knowledge-hub') window.dispatchEvent(new Event('hashchange'));
    }
    if (isDoctorReport) {
      window.setTimeout(() => {
        const el = document.getElementById('doctor-report');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  const setMyDayView = useCallback((view: MyDayView) => {
    if (view === 'insights') {
      setActiveSection('insights');
      return;
    }
    if (view === 'report') {
      setActiveSection('report');
      return;
    }
    setMyDayViewState('today');
    if (window.location.hash !== '#my-day') window.history.pushState(null, '', '#my-day');
  }, [setActiveSection]);

  useEffect(() => {
    const restoreSection = () => {
      if (window.location.hash === '#learn-community') {
        window.history.replaceState(window.history.state, '', '#knowledge-hub');
      }
      const hash = window.location.hash;
      const section = sectionFromHash(hash);
      if (section) {
        setActiveSectionState(section);
        setMyDayViewState(myDayViewFromHash(hash));
        if (hash === '#report' || hash.includes('doctor-report')) {
          window.setTimeout(() => {
            const el = document.getElementById('doctor-report');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
      else if (!window.location.hash) setActiveSectionState('home');
    };
    restoreSection();
    window.addEventListener('popstate', restoreSection);
    window.addEventListener('hashchange', restoreSection);
    return () => {
      window.removeEventListener('popstate', restoreSection);
      window.removeEventListener('hashchange', restoreSection);
    };
  }, []);

  // Preferences
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('mg/dL');
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [targetRange, setTargetRange] = useState({ low: 70, high: 180 });
  const [largeText, setLargeText] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true);

  // Readings & Logs
  const [demoReadings, setDemoReadings] = useState<GlucoseReading[]>(mockGlucoseReadings);
  const [manualReadings, setManualReadings, latestManualReadings] = useCollection<GlucoseReading>([]);
  const [nightscoutReadings, setNightscoutReadings] = useState<GlucoseReading[]>([]);
  const [nightscoutCredentials, setNightscoutCredentials] = useState<NightscoutConfig | null>(null);
  const [nightscoutUrl, setNightscoutUrl] = useState('');
  const [dataSource, setDataSource] = useState<GlucoseDataSource>('demo');
  const [connectionStatus, setConnectionStatus] = useState<DataConnectionStatus>('disconnected');
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const fetchSequence = useRef(0);
  const fetchInProgress = useRef(false);
  const nightscoutAbort = useRef<AbortController | null>(null);

  useEffect(() => () => nightscoutAbort.current?.abort(), []);
  const [meals, setMeals, latestMeals] = useCollection<MealLogEntry>(initialMockMeals);
  const [insulinLogs, setInsulinLogs, latestInsulinLogs] = useCollection<InsulinLogEntry>(initialMockInsulin);
  const [activityLogs, setActivityLogs, latestActivityLogs] = useCollection<ActivityLogEntry>(() => [makeDemoActivity()]);

  // Active Food Library Meal Plate Builder
  const [mealPlate, setMealPlate] = useState<MealItemSelection[]>([]);

  // Insights & Patterns
  const [patterns] = useState<PatternInsight[]>(mockPatternInsights);
  const [activePatternId, setActivePatternId] = useState('pat-01');

  // Guides
  const [guides] = useState<EducationalGuide[]>(educationalGuides);
  const [selectedGuide, setSelectedGuide] = useState<EducationalGuide | null>(null);


  // Community Feedback
  const [feedbackList, setFeedbackList, latestFeedbackList] = useCollection<CommunityFeedback>([]);
  const [localDataError, setLocalDataError] = useState<string | null>(null);
  const blockedLocalDataKeys = useRef(new Set<string>());

  // Modals
  const [isHypoModalOpen, setIsHypoModalOpen] = useState(false);
  const [isOneTapModalOpen, setIsOneTapModalOpen] = useState(false);

  const persistLocalValue = useCallback((key: string, value: unknown): boolean => {
    if (blockedLocalDataKeys.current.has(key)) {
      setLocalDataError(
        'This collection has invalid saved data and was not overwritten. Export other available records or import a backup to replace the invalid collection.'
      );
      return false;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Unable to save local data for "${key}".`, error);
      setLocalDataError(
        'A change could not be saved in this browser. It may be lost when you leave or refresh. Export a backup if the data is still visible.'
      );
      return false;
    }
  }, []);

  // Client-side initialization from localStorage
  useEffect(() => {
    const invalidCollections: string[] = [];
    try {
      const storedTheme = window.localStorage.getItem('gluconest_dark');
      if (storedTheme === 'true' || storedTheme === 'false') {
        setDarkMode(storedTheme === 'true');
      } else if (storedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
      }

      const storedUnit = readPreference<GlucoseUnit>('gluconest_unit', ['mg/dL', 'mmol/L']);
      if (storedUnit) {
        setGlucoseUnit(storedUnit);
      }

      setLargeText(window.localStorage.getItem('gluconest_large_text') === 'true');

      const storedLanguage = readPreference('gluconest_language', APP_LANGUAGES.map(item => item.code));
      if (storedLanguage) {
        setLanguageState(storedLanguage);
      }

      const storedTargetRange = window.localStorage.getItem('gluconest_target_range');
      if (storedTargetRange) {
        try {
          const parsed: unknown = JSON.parse(storedTargetRange);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'low' in parsed &&
            'high' in parsed &&
            typeof parsed.low === 'number' &&
            typeof parsed.high === 'number' &&
            Number.isFinite(parsed.low) &&
            Number.isFinite(parsed.high) &&
            parsed.low >= 20 &&
            parsed.high <= 400 &&
            parsed.low < parsed.high
          ) {
            setTargetRange({ low: parsed.low, high: parsed.high });
          }
        } catch (error) {
          console.error('Unable to read the saved target range.', error);
        }
      }

      const loadCollection = <T,>(
        key: string,
        label: string,
        validator: (item: unknown) => item is T,
        setCollection: (value: T[]) => void
      ) => {
        const stored = window.localStorage.getItem(key);
        if (stored === null) return;
        try {
          const parsed: unknown = JSON.parse(stored);
          if (isArrayOf(parsed, validator)) {
            setCollection(parsed);
          } else {
            setCollection([]);
            blockedLocalDataKeys.current.add(key);
            invalidCollections.push(label);
          }
        } catch {
          setCollection([]);
          blockedLocalDataKeys.current.add(key);
          invalidCollections.push(label);
        }
      };

      loadCollection(LOCAL_DATA_KEYS.meals, 'meal', isMealLogEntry, (items) =>
        setMeals([...items.filter((m) => !m.isDemo), ...initialMockMeals])
      );
      loadCollection(LOCAL_DATA_KEYS.insulin, 'insulin', isInsulinLogEntry, (items) =>
        setInsulinLogs([...items.filter((i) => !i.isDemo), ...initialMockInsulin])
      );
      loadCollection(LOCAL_DATA_KEYS.activity, 'activity', isActivityLogEntry, (items) =>
        setActivityLogs([...items.filter((a) => !a.isDemo), makeDemoActivity()])
      );
      loadCollection(
        LOCAL_DATA_KEYS.readings,
        'glucose reading',
        isManualGlucoseReading,
        (storedReadings) => {
          setManualReadings([...storedReadings].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)));
          if (storedReadings.length > 0) setDataSource('manual');
        }
      );
      loadCollection(LOCAL_DATA_KEYS.feedback, 'feedback', isCommunityFeedback, setFeedbackList);

      const hasCompletedOnboarding = window.localStorage.getItem('gluconest_onboarding_complete') === 'true';
      const hasExistingPreferences = storedTheme !== null || storedUnit !== null ||
        storedLanguage !== null || storedTargetRange !== null;
      const hasExistingRecords = Object.values(LOCAL_DATA_KEYS).some(
        (key) => window.localStorage.getItem(key) !== null
      );
      if (!hasCompletedOnboarding && (hasExistingPreferences || hasExistingRecords)) {
        persistLocalValue('gluconest_onboarding_complete', true);
        setOnboardingComplete(true);
      } else {
        setOnboardingComplete(hasCompletedOnboarding);
      }
    } catch (error) {
      console.error('Unable to read local data from this browser.', error);
      setLocalDataError(
        'This browser could not read saved data. Check browser storage permissions; saved records have not been intentionally deleted.'
      );
    }

    setPreferencesLoaded(true);
    if (invalidCollections.length > 0) {
      const labels = invalidCollections.join(', ');
      console.error(`Invalid saved ${labels} data was not loaded.`);
      setLocalDataError(
        `Some saved ${labels} data could not be read because it was invalid. Those records were left in browser storage, but were not loaded. Export other available records before clearing browser data.`
      );
    }
  }, [persistLocalValue, setMeals, setInsulinLogs, setActivityLogs, setManualReadings, setFeedbackList]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    document.documentElement.classList.toggle('large-text', largeText);
    persistLocalValue('gluconest_large_text', largeText);
  }, [largeText, preferencesLoaded, persistLocalValue]);

  // Sync dark mode class with HTML
  useEffect(() => {
    if (!preferencesLoaded) return;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      persistLocalValue('gluconest_dark', true);
    } else {
      document.documentElement.classList.remove('dark');
      persistLocalValue('gluconest_dark', false);
    }
  }, [darkMode, preferencesLoaded, persistLocalValue]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleLargeText = () => setLargeText((previous) => !previous);

  const saveTargetRange = (low: number, high: number) => {
    if (!Number.isFinite(low) || !Number.isFinite(high) || low < 20 || high > 400 || low >= high) {
      return false;
    }
    if (!persistLocalValue('gluconest_target_range', { low, high })) return false;
    setTargetRange({ low, high });
    return true;
  };

  const toggleGlucoseUnit = () => {
    const next = glucoseUnit === 'mg/dL' ? 'mmol/L' : 'mg/dL';
    if (persistLocalValue('gluconest_unit', next)) setGlucoseUnit(next);
  };

  const setLanguage = (nextLanguage: AppLanguage) => {
    if (persistLocalValue('gluconest_language', nextLanguage)) {
      setLanguageState(nextLanguage);
    }
  };

  const completeOnboarding = (preferences: {
    language: AppLanguage;
    glucoseUnit: GlucoseUnit;
    targetRange: { low: number; high: number };
    connectDataSource: boolean;
  }) => {
    const saved = [
      persistLocalValue('gluconest_language', preferences.language),
      persistLocalValue('gluconest_unit', preferences.glucoseUnit),
      persistLocalValue('gluconest_target_range', preferences.targetRange),
      persistLocalValue('gluconest_onboarding_complete', true),
    ].every(Boolean);
    if (!saved) return false;

    setLanguageState(preferences.language);
    setGlucoseUnit(preferences.glucoseUnit);
    setTargetRange(preferences.targetRange);
    setOnboardingComplete(true);
    if (preferences.connectDataSource) setActiveSection('devices');
    return true;
  };

  const readings = dataSource === 'nightscout'
    ? nightscoutReadings
    : dataSource === 'manual'
      ? manualReadings
      : demoReadings;
  const currentReading = getLatestReading(readings);

  const addReading = (reading: GlucoseReading): boolean => {
    if (reading.source === 'manual') {
      const updated = [
        ...latestManualReadings.current,
        { ...reading, isDemo: false },
      ].sort((first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp));
      if (!persistLocalValue(LOCAL_DATA_KEYS.readings, updated)) return false;
      setManualReadings(updated);
      if (dataSource !== 'nightscout') setDataSource('manual');
      return true;
    }
    setDemoReadings((previous) => [
      ...previous,
      reading,
    ]);
    return true;
  };

  const deleteManualReading = (id: string): boolean => {
    const updated = latestManualReadings.current.filter(reading => (reading.id ?? reading.timestamp) !== id);
    if (!persistLocalValue(LOCAL_DATA_KEYS.readings, updated)) return false;
    setManualReadings(updated);
    return true;
  };

  const importManualReadings = (incoming: GlucoseReading[]) => {
    const existing = new Set(
      latestManualReadings.current.map((reading) => `${Date.parse(reading.timestamp)}:${reading.value}`)
    );
    const additions = incoming.filter((reading) => {
      const signature = `${Date.parse(reading.timestamp)}:${reading.value}`;
      if (existing.has(signature)) return false;
      existing.add(signature);
      return true;
    }).map((reading) => ({ ...reading, source: 'manual' as const, isDemo: false }));
    const updated = [...latestManualReadings.current, ...additions]
      .sort((first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp));
    if (!persistLocalValue(LOCAL_DATA_KEYS.readings, updated)) return null;
    setManualReadings(updated);
    if (additions.length > 0 && dataSource !== 'nightscout') setDataSource('manual');
    return { imported: additions.length, skipped: incoming.length - additions.length };
  };

  const runNightscoutFetch = useCallback(async (config: NightscoutConfig) => {
    if (fetchInProgress.current) return;
    const requestId = ++fetchSequence.current;
    fetchInProgress.current = true;
    const controller = new AbortController();
    nightscoutAbort.current = controller;
    setConnectionStatus('fetching');
    setConnectionError(null);

    try {
      const fetchedReadings = await fetchNightscoutReadingsWithRetry(config, controller.signal);
      if (requestId !== fetchSequence.current) return;
      setNightscoutReadings(fetchedReadings);
      setDataSource('nightscout');
      setConnectionError(null);
      setConnectionStatus('connected');
      setLastSuccessfulFetch(new Date().toISOString());
    } catch (error) {
      if (requestId !== fetchSequence.current) return;
      setConnectionError(
        error instanceof NightscoutError
          ? error.message
          : 'Nightscout could not be reached. Check the URL and read access, then try again.'
      );
      setConnectionStatus('error');
    } finally {
      if (requestId === fetchSequence.current) {
        fetchInProgress.current = false;
        nightscoutAbort.current = null;
      }
    }
  }, []);

  const connectNightscout = useCallback(async (config: NightscoutConfig) => {
    if (fetchInProgress.current) {
      setConnectionError('A Nightscout request is already in progress. Wait for it to finish or cancel it.');
      return;
    }
    setNightscoutCredentials(config);
    setNightscoutUrl(config.url.trim());
    await runNightscoutFetch(config);
  }, [runNightscoutFetch]);

  const refreshNightscout = useCallback(async () => {
    if (!nightscoutCredentials) return;
    await runNightscoutFetch(nightscoutCredentials);
  }, [nightscoutCredentials, runNightscoutFetch]);

  const disconnectNightscout = useCallback(() => {
    fetchSequence.current += 1;
    nightscoutAbort.current?.abort();
    nightscoutAbort.current = null;
    fetchInProgress.current = false;
    setNightscoutCredentials(null);
    setNightscoutReadings([]);
    setNightscoutUrl('');
    setDataSource(latestManualReadings.current.length > 0 ? 'manual' : 'demo');
    setConnectionStatus('disconnected');
    setLastSuccessfulFetch(null);
    setConnectionError(null);
  }, [latestManualReadings]);

  const isNightscoutConnected = dataSource === 'nightscout';

  useEffect(() => {
    if (!isNightscoutConnected || !nightscoutCredentials) return;
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshNightscout();
    };
    const interval = window.setInterval(refreshWhenVisible, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [isNightscoutConnected, nightscoutCredentials, refreshNightscout]);

  // Meal management
  const addMealLog = (meal: Omit<MealLogEntry, 'id'>): boolean => {
    const newEntry: MealLogEntry = {
      ...meal,
      id: recordId('meal'),
      isDemo: false,
    };
    const updated = [newEntry, ...latestMeals.current];
    if (!persistLocalValue(LOCAL_DATA_KEYS.meals, updated.filter((m) => !m.isDemo))) return false;
    setMeals(updated);
    return true;
  };

  const updateMealLog = (id: string, updatedFields: Partial<MealLogEntry>): boolean => {
    const updated = latestMeals.current.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
    if (!persistLocalValue(LOCAL_DATA_KEYS.meals, updated.filter((m) => !m.isDemo))) return false;
    setMeals(updated);
    return true;
  };

  const deleteMealLog = (id: string): boolean => {
    const updated = latestMeals.current.filter((m) => m.id !== id);
    if (!persistLocalValue(LOCAL_DATA_KEYS.meals, updated.filter((m) => !m.isDemo))) return false;
    setMeals(updated);
    return true;
  };

  // Insulin management
  const addInsulinLog = (entry: Omit<InsulinLogEntry, 'id'>): boolean => {
    const newEntry: InsulinLogEntry = {
      ...entry,
      id: recordId('ins'),
      isDemo: false,
    };
    const updated = [newEntry, ...latestInsulinLogs.current];
    if (!persistLocalValue(LOCAL_DATA_KEYS.insulin, updated.filter((i) => !i.isDemo))) return false;
    setInsulinLogs(updated);
    return true;
  };

  const updateInsulinLog = (id: string, updatedFields: Partial<InsulinLogEntry>): boolean => {
    const updated = latestInsulinLogs.current.map((i) => (i.id === id ? { ...i, ...updatedFields } : i));
    if (!persistLocalValue(LOCAL_DATA_KEYS.insulin, updated.filter((i) => !i.isDemo))) return false;
    setInsulinLogs(updated);
    return true;
  };

  const deleteInsulinLog = (id: string): boolean => {
    const updated = latestInsulinLogs.current.filter((i) => i.id !== id);
    if (!persistLocalValue(LOCAL_DATA_KEYS.insulin, updated.filter((i) => !i.isDemo))) return false;
    setInsulinLogs(updated);
    return true;
  };

  // Activity management
  const addActivityLog = (act: Omit<ActivityLogEntry, 'id'>): boolean => {
    const newEntry: ActivityLogEntry = {
      ...act,
      id: recordId('act'),
      isDemo: false,
    };
    const updated = [newEntry, ...latestActivityLogs.current];
    if (!persistLocalValue(LOCAL_DATA_KEYS.activity, updated.filter((a) => !a.isDemo))) return false;
    setActivityLogs(updated);
    return true;
  };

  const deleteActivityLog = (id: string): boolean => {
    const updated = latestActivityLogs.current.filter((a) => a.id !== id);
    if (!persistLocalValue(LOCAL_DATA_KEYS.activity, updated.filter((a) => !a.isDemo))) return false;
    setActivityLogs(updated);
    return true;
  };

  // Meal Plate management
  const addToMealPlate = (item: MealItemSelection) => {
    setMealPlate((prev) => {
      const existing = prev.find((i) => i.foodId === item.foodId);
      if (existing) {
        return prev.map((i) =>
          i.foodId === item.foodId
            ? {
                ...i,
                servings: i.servings + item.servings,
                totalCarbs: Math.round((i.servings + item.servings) * i.carbsPerServing),
              }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateMealPlateItem = (foodId: string, servings: number) => {
    if (servings <= 0) {
      removeFromMealPlate(foodId);
      return;
    }
    setMealPlate((prev) =>
      prev.map((i) =>
        i.foodId === foodId
          ? {
              ...i,
              servings,
              totalCarbs: Math.round(servings * i.carbsPerServing),
            }
          : i
      )
    );
  };

  const removeFromMealPlate = (foodId: string) => {
    setMealPlate((prev) => prev.filter((i) => i.foodId !== foodId));
  };

  const clearMealPlate = () => {
    setMealPlate([]);
  };

  // Feedback
  const submitFeedback = (fb: Omit<CommunityFeedback, 'id' | 'submittedAt'>): boolean => {
    const newFb: CommunityFeedback = {
      ...fb,
      id: recordId('fb'),
      submittedAt: new Date().toISOString(),
    };
    const updated = [newFb, ...latestFeedbackList.current];
    if (!persistLocalValue(LOCAL_DATA_KEYS.feedback, updated)) return false;
    setFeedbackList(updated);
    return true;
  };

  // Hypo trigger
  const triggerHypoEmergency = () => {
    setIsHypoModalOpen(true);
  };

  const activePattern = patterns.find((pattern) => pattern.id === activePatternId) || patterns[0];

  // Resets only the sample content. Anything the user logged (isDemo false) is kept.
  const resetDemoData = () => {
    setDataSource('demo');
    setDemoReadings(mockGlucoseReadings);
    const nextMeals = replaceDemoRecords(latestMeals.current, initialMockMeals);
    const nextInsulin = replaceDemoRecords(latestInsulinLogs.current, initialMockInsulin);
    const nextActivities = replaceDemoRecords(latestActivityLogs.current, [makeDemoActivity()]);
    setMeals(nextMeals);
    setInsulinLogs(nextInsulin);
    setActivityLogs(nextActivities);
    persistLocalValue(LOCAL_DATA_KEYS.meals, nextMeals.filter((m) => !m.isDemo));
    persistLocalValue(LOCAL_DATA_KEYS.insulin, nextInsulin.filter((i) => !i.isDemo));
    persistLocalValue(LOCAL_DATA_KEYS.activity, nextActivities.filter((a) => !a.isDemo));
  };

  const importLocalDataBackup = (backup: LocalDataBackup) => {
    const nextManualReadings = mergeRecordsById(
      latestManualReadings.current,
      backup.data.manualReadings
    ).sort((first, second) => Date.parse(first.timestamp) - Date.parse(second.timestamp));
    const nextMeals = mergeRecordsById(latestMeals.current, backup.data.meals);
    const nextInsulinLogs = mergeRecordsById(latestInsulinLogs.current, backup.data.insulinLogs);
    const nextActivityLogs = mergeRecordsById(latestActivityLogs.current, backup.data.activityLogs);
    const nextFeedbackList = mergeRecordsById(latestFeedbackList.current, backup.data.feedbackList);
    const nextCollections = [
      [LOCAL_DATA_KEYS.readings, nextManualReadings],
      [LOCAL_DATA_KEYS.meals, nextMeals],
      [LOCAL_DATA_KEYS.insulin, nextInsulinLogs],
      [LOCAL_DATA_KEYS.activity, nextActivityLogs],
      [LOCAL_DATA_KEYS.feedback, nextFeedbackList],
    ] as const;
    const previousValues = new Map<string, string | null>();
    const attemptedKeys: string[] = [];
    try {
      for (const [key] of nextCollections) {
        previousValues.set(key, window.localStorage.getItem(key));
      }
      for (const [key, value] of nextCollections) {
        window.localStorage.setItem(key, JSON.stringify(value));
        attemptedKeys.push(key);
      }
    } catch (error) {
      let rollbackFailed = false;
      for (const key of attemptedKeys) {
        try {
          const previousValue = previousValues.get(key) ?? null;
          if (previousValue === null) window.localStorage.removeItem(key);
          else window.localStorage.setItem(key, previousValue);
        } catch {
          rollbackFailed = true;
        }
      }
      console.error('Unable to import the local data backup.', error);
      const message = rollbackFailed
        ? 'The backup could not be fully saved, and browser storage could not restore every previous value. Export any data still visible before leaving this page.'
        : 'The backup could not be saved because browser storage is unavailable or full. Existing records were kept.';
      setLocalDataError(message);
      throw new Error(message);
    }

    setManualReadings(nextManualReadings);
    if (dataSource !== 'nightscout' && nextManualReadings.length > 0) setDataSource('manual');
    setMeals(nextMeals);
    setInsulinLogs(nextInsulinLogs);
    setActivityLogs(nextActivityLogs);
    setFeedbackList(nextFeedbackList);
    blockedLocalDataKeys.current.clear();
    setLocalDataError(null);
  };

  const dismissLocalDataError = () => setLocalDataError(null);

  return (
    <AppContext.Provider
      value={{
        teamMembers,
        activeSection,
        setActiveSection,
        myDayView,
        setMyDayView,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        glucoseUnit,
        setGlucoseUnit,
        toggleGlucoseUnit,
        language,
        setLanguage,
        targetRange,
        largeText,
        toggleLargeText,
        onboardingComplete,
        completeOnboarding,
        saveTargetRange,
        readings,
        manualReadings,
        importManualReadings,
        deleteManualReading,
        currentReading,
        addReading,
        dataSource,
        connectionStatus,
        isNightscoutConnected,
        nightscoutUrl,
        lastSuccessfulFetch,
        connectionError,
        connectNightscout,
        refreshNightscout,
        disconnectNightscout,
        meals,
        addMealLog,
        updateMealLog,
        deleteMealLog,
        insulinLogs,
        addInsulinLog,
        updateInsulinLog,
        deleteInsulinLog,
        activityLogs,
        addActivityLog,
        deleteActivityLog,
        mealPlate,
        addToMealPlate,
        updateMealPlateItem,
        removeFromMealPlate,
        clearMealPlate,
        patterns,
        activePattern,
        setActivePatternId,
        guides,
        selectedGuide,
        setSelectedGuide,
        feedbackList,
        submitFeedback,
        isHypoModalOpen,
        setIsHypoModalOpen,
        triggerHypoEmergency,
        isOneTapModalOpen,
        setIsOneTapModalOpen,
        resetDemoData,
        localDataError,
        dismissLocalDataError,
        importLocalDataBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
