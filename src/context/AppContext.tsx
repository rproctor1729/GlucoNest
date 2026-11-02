'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavigationSection,
  GlucoseUnit,
  GlucoseReading,
  MealLogEntry,
  InsulinLogEntry,
  ActivityLogEntry,
  NoteLogEntry,
  PatternInsight,
  CommunityStory,
  EducationalGuide,
  CommunityFeedback,
  MealItemSelection,
} from '../types';
import { mockGlucoseReadings } from '../data/mockGlucose';
import { initialMockMeals } from '../data/mockMeals';
import { initialMockInsulin } from '../data/mockInsulin';
import { mockPatternInsights } from '../data/mockInsights';
import { communityStories as initialStories } from '../data/stories';
import { educationalGuides } from '../data/educationalContent';

interface AppContextType {
  // Navigation
  activeSection: NavigationSection;
  setActiveSection: (sec: NavigationSection) => void;

  // Preferences
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;
  glucoseUnit: GlucoseUnit;
  setGlucoseUnit: (unit: GlucoseUnit) => void;
  toggleGlucoseUnit: () => void;

  // Readings
  readings: GlucoseReading[];
  currentReading: GlucoseReading;
  addReading: (reading: GlucoseReading) => void;

  // Meal Logs
  meals: MealLogEntry[];
  addMealLog: (meal: Omit<MealLogEntry, 'id'>) => void;
  updateMealLog: (id: string, meal: Partial<MealLogEntry>) => void;
  deleteMealLog: (id: string) => void;

  // Insulin Logs
  insulinLogs: InsulinLogEntry[];
  addInsulinLog: (entry: Omit<InsulinLogEntry, 'id'>) => void;
  updateInsulinLog: (id: string, entry: Partial<InsulinLogEntry>) => void;
  deleteInsulinLog: (id: string) => void;

  // Activity & Notes
  activityLogs: ActivityLogEntry[];
  addActivityLog: (act: Omit<ActivityLogEntry, 'id'>) => void;
  deleteActivityLog: (id: string) => void;

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

  // Community Stories
  stories: CommunityStory[];
  toggleStoryHeart: (id: string) => void;

  // Guides
  guides: EducationalGuide[];
  selectedGuide: EducationalGuide | null;
  setSelectedGuide: (guide: EducationalGuide | null) => void;

  // Community Feedback
  feedbackList: CommunityFeedback[];
  submitFeedback: (feedback: Omit<CommunityFeedback, 'id' | 'submittedAt'>) => void;

  // Modals
  isHypoModalOpen: boolean;
  setIsHypoModalOpen: (open: boolean) => void;
  triggerHypoEmergency: () => void;

  isOneTapModalOpen: boolean;
  setIsOneTapModalOpen: (open: boolean) => void;

  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportPeriod: 14 | 30 | 90;
  setReportPeriod: (days: 14 | 30 | 90) => void;

  // Demo Reset
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Navigation
  const [activeSection, setActiveSection] = useState<NavigationSection>('my-day');

  // Preferences
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('mg/dL');

  // Readings & Logs
  const [readings, setReadings] = useState<GlucoseReading[]>(mockGlucoseReadings);
  const [meals, setMeals] = useState<MealLogEntry[]>(initialMockMeals);
  const [insulinLogs, setInsulinLogs] = useState<InsulinLogEntry[]>(initialMockInsulin);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([
    {
      id: 'act-01',
      timestamp: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
      type: 'walk',
      durationMinutes: 25,
      intensity: 'light',
      notes: 'Brisk evening neighborhood walk after tea',
      isDemo: true,
    },
  ]);

  // Active Food Library Meal Plate Builder
  const [mealPlate, setMealPlate] = useState<MealItemSelection[]>([]);

  // Insights & Patterns
  const [patterns] = useState<PatternInsight[]>(mockPatternInsights);
  const [activePatternId, setActivePatternId] = useState<string>('pat-01');

  // Stories & Guides
  const [stories, setStories] = useState<CommunityStory[]>(initialStories);
  const [guides] = useState<EducationalGuide[]>(educationalGuides);
  const [selectedGuide, setSelectedGuide] = useState<EducationalGuide | null>(null);

  // Community Feedback
  const [feedbackList, setFeedbackList] = useState<CommunityFeedback[]>([]);

  // Modals
  const [isHypoModalOpen, setIsHypoModalOpen] = useState(false);
  const [isOneTapModalOpen, setIsOneTapModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<14 | 30 | 90>(30);

  // Client-side initialization from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedTheme = window.localStorage.getItem('gluconest_dark');
        if (storedTheme !== null) {
          setDarkMode(storedTheme === 'true');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setDarkMode(true);
        }

        const storedUnit = window.localStorage.getItem('gluconest_unit') as GlucoseUnit | null;
        if (storedUnit === 'mg/dL' || storedUnit === 'mmol/L') {
          setGlucoseUnit(storedUnit);
        }

        const storedMeals = window.localStorage.getItem('gluconest_meals');
        if (storedMeals) {
          setMeals(JSON.parse(storedMeals));
        }

        const storedInsulin = window.localStorage.getItem('gluconest_insulin');
        if (storedInsulin) {
          setInsulinLogs(JSON.parse(storedInsulin));
        }

        const storedFeedback = window.localStorage.getItem('gluconest_feedback');
        if (storedFeedback) {
          setFeedbackList(JSON.parse(storedFeedback));
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
  }, []);

  // Sync dark mode class with HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gluconest_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gluconest_dark', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const toggleGlucoseUnit = () => {
    setGlucoseUnit((prev) => {
      const next = prev === 'mg/dL' ? 'mmol/L' : 'mg/dL';
      localStorage.setItem('gluconest_unit', next);
      return next;
    });
  };

  const currentReading = readings[readings.length - 1] || {
    timestamp: '21:00',
    timeLabel: '9:00 PM',
    value: 118,
    trend: 'SLIGHT_UP',
    isDemo: true,
  };

  const addReading = (reading: GlucoseReading) => {
    setReadings((prev) => [...prev, reading]);
  };

  // Meal management
  const addMealLog = (meal: Omit<MealLogEntry, 'id'>) => {
    const newEntry: MealLogEntry = {
      ...meal,
      id: 'meal-' + Date.now(),
    };
    const updated = [newEntry, ...meals];
    setMeals(updated);
    try {
      localStorage.setItem('gluconest_meals', JSON.stringify(updated));
    } catch {}

    // Also link to glucose readings chart for visualization
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addReading({
      id: 'g-meal-' + Date.now(),
      timestamp: nowTime,
      timeLabel: nowTime,
      value: currentReading.value,
      trend: currentReading.trend,
      event: 'meal',
      eventDetails: `${newEntry.name} (${newEntry.totalCarbs}g carbs)`,
      isDemo: true,
    });
  };

  const updateMealLog = (id: string, updatedFields: Partial<MealLogEntry>) => {
    const updated = meals.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
    setMeals(updated);
    try {
      localStorage.setItem('gluconest_meals', JSON.stringify(updated));
    } catch {}
  };

  const deleteMealLog = (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    try {
      localStorage.setItem('gluconest_meals', JSON.stringify(updated));
    } catch {}
  };

  // Insulin management
  const addInsulinLog = (entry: Omit<InsulinLogEntry, 'id'>) => {
    const newEntry: InsulinLogEntry = {
      ...entry,
      id: 'ins-' + Date.now(),
    };
    const updated = [newEntry, ...insulinLogs];
    setInsulinLogs(updated);
    try {
      localStorage.setItem('gluconest_insulin', JSON.stringify(updated));
    } catch {}

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addReading({
      id: 'g-ins-' + Date.now(),
      timestamp: nowTime,
      timeLabel: nowTime,
      value: currentReading.value,
      trend: currentReading.trend,
      event: 'insulin',
      eventDetails: `${newEntry.units}u ${newEntry.type} insulin`,
      isDemo: true,
    });
  };

  const updateInsulinLog = (id: string, updatedFields: Partial<InsulinLogEntry>) => {
    const updated = insulinLogs.map((i) => (i.id === id ? { ...i, ...updatedFields } : i));
    setInsulinLogs(updated);
    try {
      localStorage.setItem('gluconest_insulin', JSON.stringify(updated));
    } catch {}
  };

  const deleteInsulinLog = (id: string) => {
    const updated = insulinLogs.filter((i) => i.id !== id);
    setInsulinLogs(updated);
    try {
      localStorage.setItem('gluconest_insulin', JSON.stringify(updated));
    } catch {}
  };

  // Activity management
  const addActivityLog = (act: Omit<ActivityLogEntry, 'id'>) => {
    const newEntry: ActivityLogEntry = {
      ...act,
      id: 'act-' + Date.now(),
    };
    setActivityLogs((prev) => [newEntry, ...prev]);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addReading({
      id: 'g-act-' + Date.now(),
      timestamp: nowTime,
      timeLabel: nowTime,
      value: currentReading.value,
      trend: currentReading.trend,
      event: 'exercise',
      eventDetails: `${newEntry.durationMinutes} min ${newEntry.type}`,
      isDemo: true,
    });
  };

  const deleteActivityLog = (id: string) => {
    setActivityLogs((prev) => prev.filter((a) => a.id !== id));
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

  // Stories
  const toggleStoryHeart = (id: string) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const liked = !s.userLiked;
          return {
            ...s,
            userLiked: liked,
            hearts: liked ? s.hearts + 1 : s.hearts - 1,
          };
        }
        return s;
      })
    );
  };

  // Feedback
  const submitFeedback = (fb: Omit<CommunityFeedback, 'id' | 'submittedAt'>) => {
    const newFb: CommunityFeedback = {
      ...fb,
      id: 'fb-' + Date.now(),
      submittedAt: new Date().toISOString(),
    };
    const updated = [newFb, ...feedbackList];
    setFeedbackList(updated);
    try {
      localStorage.setItem('gluconest_feedback', JSON.stringify(updated));
    } catch {}
  };

  // Hypo trigger
  const triggerHypoEmergency = () => {
    setIsHypoModalOpen(true);
  };

  const activePattern = patterns.find((p) => p.id === activePatternId) || patterns[0];

  const resetDemoData = () => {
    setReadings(mockGlucoseReadings);
    setMeals(initialMockMeals);
    setInsulinLogs(initialMockInsulin);
    try {
      localStorage.removeItem('gluconest_meals');
      localStorage.removeItem('gluconest_insulin');
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        glucoseUnit,
        setGlucoseUnit,
        toggleGlucoseUnit,
        readings,
        currentReading,
        addReading,
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
        stories,
        toggleStoryHeart,
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
        isReportModalOpen,
        setIsReportModalOpen,
        reportPeriod,
        setReportPeriod,
        resetDemoData,
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
