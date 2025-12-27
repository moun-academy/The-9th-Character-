import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  DailyVote,
  DailyEntry,
  FiveSecondRuleAction,
  Habit,
  HabitCompletion,
  Goal,
  UserSettings,
  LevelsGameState,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// Helper to get user document path
const getUserPath = (userId: string) => `users/${userId}`;

// Helper to remove undefined values from objects before saving to Firestore
// Firestore doesn't accept undefined values, so we need to clean them out
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cleanData = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) return obj;
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).filter(([, v]) => v !== undefined)
  ) as T;
};

// ============= USER SETTINGS =============
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const docRef = doc(db, getUserPath(userId), 'settings', 'main');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserSettings) : null;
};

export const saveUserSettings = async (userId: string, settings: UserSettings): Promise<void> => {
  const docRef = doc(db, getUserPath(userId), 'settings', 'main');
  await setDoc(docRef, cleanData(settings));
};

// ============= LEVELS GAME STATE =============
export const getLevelsGameState = async (userId: string): Promise<LevelsGameState | null> => {
  const docRef = doc(db, getUserPath(userId), 'gameState', 'levels');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as LevelsGameState) : null;
};

export const saveLevelsGameState = async (userId: string, state: LevelsGameState): Promise<void> => {
  const docRef = doc(db, getUserPath(userId), 'gameState', 'levels');
  await setDoc(docRef, cleanData(state));
};

// ============= DAILY VOTES =============
export const getDailyVote = async (userId: string, date: string): Promise<DailyVote | null> => {
  const docRef = doc(db, getUserPath(userId), 'votes', date);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as DailyVote) : null;
};

export const saveDailyVote = async (userId: string, vote: Omit<DailyVote, 'id' | 'timestamp'>): Promise<DailyVote> => {
  const id = vote.date;
  const fullVote: DailyVote = {
    ...vote,
    id,
    timestamp: Date.now(),
  };
  const docRef = doc(db, getUserPath(userId), 'votes', id);
  await setDoc(docRef, cleanData(fullVote));
  return fullVote;
};

export const getAllVotes = async (userId: string): Promise<DailyVote[]> => {
  const votesRef = collection(db, getUserPath(userId), 'votes');
  const q = query(votesRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DailyVote);
};

// ============= DAILY ENTRIES =============
export const getDailyEntry = async (userId: string, date: string): Promise<DailyEntry | null> => {
  const docRef = doc(db, getUserPath(userId), 'entries', date);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as DailyEntry) : null;
};

export const saveDailyEntry = async (userId: string, entry: Partial<DailyEntry> & { date: string }): Promise<DailyEntry> => {
  const existing = await getDailyEntry(userId, entry.date);
  const fullEntry: DailyEntry = {
    id: entry.date,
    date: entry.date,
    presenceScore: entry.presenceScore ?? existing?.presenceScore,
    productivityScore: entry.productivityScore ?? existing?.productivityScore,
    deepWorkSets: entry.deepWorkSets ?? existing?.deepWorkSets,
    timeWasterMinutes: entry.timeWasterMinutes ?? existing?.timeWasterMinutes,
    timestamp: Date.now(),
  };
  const docRef = doc(db, getUserPath(userId), 'entries', entry.date);
  await setDoc(docRef, cleanData(fullEntry));
  return fullEntry;
};

export const getEntriesInRange = async (userId: string, startDate: string, endDate: string): Promise<DailyEntry[]> => {
  const entriesRef = collection(db, getUserPath(userId), 'entries');
  const q = query(
    entriesRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DailyEntry);
};

// ============= 5 SECOND RULE ACTIONS =============
export const getFiveSecondRuleActions = async (userId: string, date: string): Promise<FiveSecondRuleAction[]> => {
  const actionsRef = collection(db, getUserPath(userId), 'fiveSecondRuleActions');
  const q = query(actionsRef, where('date', '==', date), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as FiveSecondRuleAction);
};

export const addFiveSecondRuleAction = async (
  userId: string,
  action: Omit<FiveSecondRuleAction, 'id' | 'timestamp'>
): Promise<FiveSecondRuleAction> => {
  const id = uuidv4();
  const fullAction: FiveSecondRuleAction = {
    ...action,
    id,
    timestamp: Date.now(),
  };
  const docRef = doc(db, getUserPath(userId), 'fiveSecondRuleActions', id);
  await setDoc(docRef, cleanData(fullAction));
  return fullAction;
};

export const getFiveSecondRuleActionsInRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<FiveSecondRuleAction[]> => {
  const actionsRef = collection(db, getUserPath(userId), 'fiveSecondRuleActions');
  const q = query(
    actionsRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as FiveSecondRuleAction);
};

// ============= HABITS =============
export const getHabits = async (userId: string): Promise<Habit[]> => {
  const habitsRef = collection(db, getUserPath(userId), 'habits');
  const q = query(habitsRef, where('archived', '==', false), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Habit);
};

export const addHabit = async (userId: string, habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>): Promise<Habit> => {
  const id = uuidv4();
  const fullHabit: Habit = {
    ...habit,
    id,
    createdAt: Date.now(),
    archived: false,
  };
  const docRef = doc(db, getUserPath(userId), 'habits', id);
  await setDoc(docRef, cleanData(fullHabit));
  return fullHabit;
};

export const updateHabit = async (userId: string, habitId: string, updates: Partial<Habit>): Promise<void> => {
  const docRef = doc(db, getUserPath(userId), 'habits', habitId);
  await updateDoc(docRef, cleanData(updates));
};

export const deleteHabit = async (userId: string, habitId: string): Promise<void> => {
  const docRef = doc(db, getUserPath(userId), 'habits', habitId);
  await updateDoc(docRef, { archived: true });
};

// ============= HABIT COMPLETIONS =============
export const getHabitCompletions = async (userId: string, date: string): Promise<HabitCompletion[]> => {
  const completionsRef = collection(db, getUserPath(userId), 'habitCompletions');
  const q = query(completionsRef, where('date', '==', date));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as HabitCompletion);
};

export const toggleHabitCompletion = async (
  userId: string,
  habitId: string,
  date: string,
  completed: boolean
): Promise<HabitCompletion> => {
  const id = `${habitId}_${date}`;
  const completion: HabitCompletion = {
    id,
    habitId,
    date,
    completed,
    timestamp: Date.now(),
  };
  const docRef = doc(db, getUserPath(userId), 'habitCompletions', id);
  await setDoc(docRef, cleanData(completion));
  return completion;
};

export const getHabitCompletionsInRange = async (
  userId: string,
  habitId: string,
  startDate: string,
  endDate: string
): Promise<HabitCompletion[]> => {
  const completionsRef = collection(db, getUserPath(userId), 'habitCompletions');
  const q = query(
    completionsRef,
    where('habitId', '==', habitId),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as HabitCompletion);
};

export const getAllHabitCompletionsInRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<HabitCompletion[]> => {
  const completionsRef = collection(db, getUserPath(userId), 'habitCompletions');
  const q = query(
    completionsRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as HabitCompletion);
};

// ============= GOALS =============
export const getGoals = async (userId: string, type: string, dateKey: string): Promise<Goal[]> => {
  const goalsRef = collection(db, getUserPath(userId), 'goals');
  const q = query(goalsRef, where('type', '==', type), where('date', '==', dateKey), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Goal);
};

export const addGoal = async (userId: string, goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> => {
  const id = uuidv4();
  const fullGoal: Goal = {
    ...goal,
    id,
    createdAt: Date.now(),
  };
  const docRef = doc(db, getUserPath(userId), 'goals', id);
  await setDoc(docRef, cleanData(fullGoal));
  return fullGoal;
};

export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>): Promise<void> => {
  const docRef = doc(db, getUserPath(userId), 'goals', goalId);
  await updateDoc(docRef, cleanData(updates));
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
  const docRef = doc(db, getUserPath(userId), 'goals', goalId);
  await deleteDoc(docRef);
};

export const getGoalsInRange = async (userId: string, type: string, startKey: string, endKey: string): Promise<Goal[]> => {
  const goalsRef = collection(db, getUserPath(userId), 'goals');
  const q = query(
    goalsRef,
    where('type', '==', type),
    where('date', '>=', startKey),
    where('date', '<=', endKey)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Goal);
};
