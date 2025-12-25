import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type {
  DailyVote,
  DailyEntry,
  FiveSecondRuleAction,
  Habit,
  HabitCompletion,
  Goal,
  UserSettings,
  LevelsGameState,
  StreakInfo,
  PresenceLevelProgress,
  ProductivityLevelProgress,
} from '../types';
import * as dataService from '../services/dataService';
import {
  calculatePresenceLevelProgress,
  calculateProductivityLevelProgress,
  checkPresenceLevelUp,
  checkProductivityLevelUp,
} from '../services/levelsGameService';
import { getToday, getCurrentWeek, getCurrentMonth, getLast30Days } from '../utils/dateUtils';

interface DataContextType {
  // Loading state
  loading: boolean;

  // User Settings
  settings: UserSettings | null;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // Daily Vote
  todayVote: DailyVote | null;
  castVote: (vote: 'yes' | 'no', note?: string) => Promise<void>;
  streakInfo: StreakInfo;

  // Daily Entry
  todayEntry: DailyEntry | null;
  updateEntry: (entry: Partial<DailyEntry>) => Promise<void>;

  // 5 Second Rule
  todayFiveSecondRuleActions: FiveSecondRuleAction[];
  addFiveSecondRuleAction: (category: 'social' | 'productivity' | 'presence', note?: string) => Promise<void>;
  getFiveSecondRuleCounts: () => { social: number; productivity: number; presence: number };

  // Habits
  habits: Habit[];
  addHabit: (name: string, category?: string) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  todayHabitCompletions: HabitCompletion[];
  toggleHabitCompletion: (habitId: string) => Promise<void>;
  getHabitStreak: (habitId: string) => number;

  // Goals
  dailyGoals: Goal[];
  weeklyGoals: Goal[];
  monthlyGoals: Goal[];
  addGoal: (type: 'daily' | 'weekly' | 'monthly', title: string) => Promise<void>;
  toggleGoal: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;

  // Levels Games
  levelsGameState: LevelsGameState | null;
  presenceLevelProgress: PresenceLevelProgress | null;
  productivityLevelProgress: ProductivityLevelProgress | null;

  // Refresh data
  refreshData: () => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
  identity: "I am the type of person who chooses presence, leans into challenge, and communicates with clarity and confidence.",
  notificationsEnabled: true,
  morningReminderTime: '07:00',
  middayReminderTime: '12:00',
  eveningReminderTime: '20:00',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // State
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [todayVote, setTodayVote] = useState<DailyVote | null>(null);
  const [allVotes, setAllVotes] = useState<DailyVote[]>([]);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [todayFiveSecondRuleActions, setTodayFiveSecondRuleActions] = useState<FiveSecondRuleAction[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayHabitCompletions, setTodayHabitCompletions] = useState<HabitCompletion[]>([]);
  const [dailyGoals, setDailyGoals] = useState<Goal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);
  const [levelsGameState, setLevelsGameState] = useState<LevelsGameState | null>(null);
  const [entries30Days, setEntries30Days] = useState<DailyEntry[]>([]);
  const [allDailyGoals, setAllDailyGoals] = useState<Goal[]>([]);
  const [allWeeklyGoals, setAllWeeklyGoals] = useState<Goal[]>([]);
  const [allMonthlyGoals, setAllMonthlyGoals] = useState<Goal[]>([]);

  const today = getToday();
  const currentWeek = getCurrentWeek();
  const currentMonth = getCurrentMonth();

  // Load data on mount or user change
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const last30Days = getLast30Days();
      const startDate = last30Days[0];
      const endDate = last30Days[last30Days.length - 1];

      // Load all data in parallel
      const [
        loadedSettings,
        loadedTodayVote,
        loadedAllVotes,
        loadedTodayEntry,
        loadedTodayActions,
        loadedHabits,
        loadedTodayCompletions,
        loadedDailyGoals,
        loadedWeeklyGoals,
        loadedMonthlyGoals,
        loadedGameState,
        loadedEntries30Days,
        loadedAllDailyGoals,
        loadedAllWeeklyGoals,
        loadedAllMonthlyGoals,
      ] = await Promise.all([
        dataService.getUserSettings(user.uid),
        dataService.getDailyVote(user.uid, today),
        dataService.getAllVotes(user.uid),
        dataService.getDailyEntry(user.uid, today),
        dataService.getFiveSecondRuleActions(user.uid, today),
        dataService.getHabits(user.uid),
        dataService.getHabitCompletions(user.uid, today),
        dataService.getGoals(user.uid, 'daily', today),
        dataService.getGoals(user.uid, 'weekly', currentWeek),
        dataService.getGoals(user.uid, 'monthly', currentMonth),
        dataService.getLevelsGameState(user.uid),
        dataService.getEntriesInRange(user.uid, startDate, endDate),
        dataService.getGoalsInRange(user.uid, 'daily', startDate, endDate),
        dataService.getGoalsInRange(user.uid, 'weekly', startDate.slice(0, 8), currentWeek),
        dataService.getGoalsInRange(user.uid, 'monthly', startDate.slice(0, 7), currentMonth),
      ]);

      setSettings(loadedSettings || DEFAULT_SETTINGS);
      setTodayVote(loadedTodayVote);
      setAllVotes(loadedAllVotes);
      setTodayEntry(loadedTodayEntry);
      setTodayFiveSecondRuleActions(loadedTodayActions);
      setHabits(loadedHabits);
      setTodayHabitCompletions(loadedTodayCompletions);
      setDailyGoals(loadedDailyGoals);
      setWeeklyGoals(loadedWeeklyGoals);
      setMonthlyGoals(loadedMonthlyGoals);
      setLevelsGameState(
        loadedGameState || {
          presenceLevel: 1,
          presenceLevelStartDate: today,
          productivityLevel: 1,
          productivityLevelStartDate: today,
        }
      );
      setEntries30Days(loadedEntries30Days);
      setAllDailyGoals(loadedAllDailyGoals);
      setAllWeeklyGoals(loadedAllWeeklyGoals);
      setAllMonthlyGoals(loadedAllMonthlyGoals);

      // Initialize settings if not exists
      if (!loadedSettings) {
        await dataService.saveUserSettings(user.uid, DEFAULT_SETTINGS);
      }

      // Initialize game state if not exists
      if (!loadedGameState) {
        const initialState: LevelsGameState = {
          presenceLevel: 1,
          presenceLevelStartDate: today,
          productivityLevel: 1,
          productivityLevelStartDate: today,
        };
        await dataService.saveLevelsGameState(user.uid, initialState);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, today, currentWeek, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate streak info
  const streakInfo: StreakInfo = React.useMemo(() => {
    if (allVotes.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalVotes: 0 };
    }

    // Sort votes by date descending
    const sortedVotes = [...allVotes].sort((a, b) => b.date.localeCompare(a.date));
    const totalVotes = sortedVotes.length;

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < sortedVotes.length; i++) {
      const voteDate = sortedVotes[i].date;
      const expectedDate = checkDate.toISOString().split('T')[0];

      if (voteDate === expectedDate) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0 && voteDate === new Date(checkDate.setDate(checkDate.getDate() - 1)).toISOString().split('T')[0]) {
        // Allow for yesterday if today hasn't been voted yet
        checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - 1);
        if (voteDate === checkDate.toISOString().split('T')[0]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: string | null = null;

    for (const vote of sortedVotes) {
      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const last = new Date(lastDate);
        const current = new Date(vote.date);
        const diffDays = Math.floor((last.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      lastDate = vote.date;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak, totalVotes };
  }, [allVotes, today]);

  // Calculate levels progress
  const presenceLevelProgress = React.useMemo(() => {
    if (!levelsGameState) return null;
    return calculatePresenceLevelProgress(
      entries30Days,
      levelsGameState.presenceLevel,
      levelsGameState.presenceLevelStartDate
    );
  }, [entries30Days, levelsGameState]);

  const productivityLevelProgress = React.useMemo(() => {
    if (!levelsGameState) return null;
    return calculateProductivityLevelProgress(
      entries30Days,
      allDailyGoals,
      allWeeklyGoals,
      allMonthlyGoals,
      levelsGameState.productivityLevel,
      levelsGameState.productivityLevelStartDate
    );
  }, [entries30Days, allDailyGoals, allWeeklyGoals, allMonthlyGoals, levelsGameState]);

  // Check and update levels
  const checkAndUpdateLevels = useCallback(async () => {
    if (!user || !levelsGameState) return;

    let updated = false;
    const newState = { ...levelsGameState };

    // Check presence level up
    if (
      checkPresenceLevelUp(entries30Days, levelsGameState.presenceLevel, levelsGameState.presenceLevelStartDate)
    ) {
      newState.presenceLevel = Math.min(levelsGameState.presenceLevel + 1, 5);
      newState.presenceLevelStartDate = today;
      updated = true;
    }

    // Check productivity level up
    if (
      checkProductivityLevelUp(
        entries30Days,
        allDailyGoals,
        allWeeklyGoals,
        allMonthlyGoals,
        levelsGameState.productivityLevel,
        levelsGameState.productivityLevelStartDate
      )
    ) {
      newState.productivityLevel = Math.min(levelsGameState.productivityLevel + 1, 5);
      newState.productivityLevelStartDate = today;
      updated = true;
    }

    if (updated) {
      await dataService.saveLevelsGameState(user.uid, newState);
      setLevelsGameState(newState);
    }
  }, [user, levelsGameState, entries30Days, allDailyGoals, allWeeklyGoals, allMonthlyGoals, today]);

  useEffect(() => {
    checkAndUpdateLevels();
  }, [checkAndUpdateLevels]);

  // Actions
  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;
    const newSettings = { ...settings, ...updates };
    await dataService.saveUserSettings(user.uid, newSettings);
    setSettings(newSettings);
  };

  const castVote = async (vote: 'yes' | 'no', note?: string) => {
    if (!user) return;
    const newVote = await dataService.saveDailyVote(user.uid, { date: today, vote, note });
    setTodayVote(newVote);
    setAllVotes((prev) => {
      const filtered = prev.filter((v) => v.date !== today);
      return [newVote, ...filtered];
    });
  };

  const updateEntry = async (entry: Partial<DailyEntry>) => {
    if (!user) return;
    const newEntry = await dataService.saveDailyEntry(user.uid, { ...entry, date: today });
    setTodayEntry(newEntry);
    setEntries30Days((prev) => {
      const filtered = prev.filter((e) => e.date !== today);
      return [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const addFiveSecondRuleAction = async (category: 'social' | 'productivity' | 'presence', note?: string) => {
    if (!user) return;
    const action = await dataService.addFiveSecondRuleAction(user.uid, { date: today, category, note });
    setTodayFiveSecondRuleActions((prev) => [action, ...prev]);
  };

  const getFiveSecondRuleCounts = () => {
    return {
      social: todayFiveSecondRuleActions.filter((a) => a.category === 'social').length,
      productivity: todayFiveSecondRuleActions.filter((a) => a.category === 'productivity').length,
      presence: todayFiveSecondRuleActions.filter((a) => a.category === 'presence').length,
    };
  };

  const addHabit = async (name: string, category?: string) => {
    if (!user) return;
    const habit = await dataService.addHabit(user.uid, { name, category });
    setHabits((prev) => [...prev, habit]);
  };

  const updateHabitAction = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) return;
    await dataService.updateHabit(user.uid, habitId, updates);
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h))
    );
  };

  const deleteHabitAction = async (habitId: string) => {
    if (!user) return;
    await dataService.deleteHabit(user.uid, habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const toggleHabitCompletion = async (habitId: string) => {
    if (!user) return;
    const existing = todayHabitCompletions.find((c) => c.habitId === habitId);
    const completed = existing ? !existing.completed : true;
    const completion = await dataService.toggleHabitCompletion(user.uid, habitId, today, completed);
    setTodayHabitCompletions((prev) => {
      const filtered = prev.filter((c) => c.habitId !== habitId);
      return [...filtered, completion];
    });
  };

  const getHabitStreak = (habitId: string): number => {
    // This is a simplified streak calculation
    // For a full implementation, you'd need to fetch historical completions
    const isCompletedToday = todayHabitCompletions.find(
      (c) => c.habitId === habitId && c.completed
    );
    return isCompletedToday ? 1 : 0;
  };

  const addGoal = async (type: 'daily' | 'weekly' | 'monthly', title: string) => {
    if (!user) return;
    const dateKey = type === 'daily' ? today : type === 'weekly' ? currentWeek : currentMonth;
    const goal = await dataService.addGoal(user.uid, { type, title, completed: false, date: dateKey });

    if (type === 'daily') {
      setDailyGoals((prev) => [...prev, goal]);
      setAllDailyGoals((prev) => [...prev, goal]);
    } else if (type === 'weekly') {
      setWeeklyGoals((prev) => [...prev, goal]);
      setAllWeeklyGoals((prev) => [...prev, goal]);
    } else {
      setMonthlyGoals((prev) => [...prev, goal]);
      setAllMonthlyGoals((prev) => [...prev, goal]);
    }
  };

  const toggleGoal = async (goalId: string) => {
    if (!user) return;
    const goal =
      dailyGoals.find((g) => g.id === goalId) ||
      weeklyGoals.find((g) => g.id === goalId) ||
      monthlyGoals.find((g) => g.id === goalId);

    if (!goal) return;

    await dataService.updateGoal(user.uid, goalId, { completed: !goal.completed });

    const updateGoalList = (list: Goal[]) =>
      list.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g));

    if (goal.type === 'daily') {
      setDailyGoals(updateGoalList);
      setAllDailyGoals(updateGoalList);
    } else if (goal.type === 'weekly') {
      setWeeklyGoals(updateGoalList);
      setAllWeeklyGoals(updateGoalList);
    } else {
      setMonthlyGoals(updateGoalList);
      setAllMonthlyGoals(updateGoalList);
    }
  };

  const deleteGoalAction = async (goalId: string) => {
    if (!user) return;
    const goal =
      dailyGoals.find((g) => g.id === goalId) ||
      weeklyGoals.find((g) => g.id === goalId) ||
      monthlyGoals.find((g) => g.id === goalId);

    if (!goal) return;

    await dataService.deleteGoal(user.uid, goalId);

    const filterGoalList = (list: Goal[]) => list.filter((g) => g.id !== goalId);

    if (goal.type === 'daily') {
      setDailyGoals(filterGoalList);
      setAllDailyGoals(filterGoalList);
    } else if (goal.type === 'weekly') {
      setWeeklyGoals(filterGoalList);
      setAllWeeklyGoals(filterGoalList);
    } else {
      setMonthlyGoals(filterGoalList);
      setAllMonthlyGoals(filterGoalList);
    }
  };

  const value: DataContextType = {
    loading,
    settings,
    updateSettings,
    todayVote,
    castVote,
    streakInfo,
    todayEntry,
    updateEntry,
    todayFiveSecondRuleActions,
    addFiveSecondRuleAction,
    getFiveSecondRuleCounts,
    habits,
    addHabit,
    updateHabit: updateHabitAction,
    deleteHabit: deleteHabitAction,
    todayHabitCompletions,
    toggleHabitCompletion,
    getHabitStreak,
    dailyGoals,
    weeklyGoals,
    monthlyGoals,
    addGoal,
    toggleGoal,
    deleteGoal: deleteGoalAction,
    levelsGameState,
    presenceLevelProgress,
    productivityLevelProgress,
    refreshData: loadData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
