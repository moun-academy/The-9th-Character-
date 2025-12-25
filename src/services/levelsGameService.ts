import type { DailyEntry, Goal, PresenceLevelProgress, ProductivityLevelProgress } from '../types';

// ============= PRESENCE LEVELS GAME =============
// Level 1: Presence for 7 days
// Level 2: Presence for 7 days with average score ≥ 9
// Level 3: Presence for 14 days with average score ≥ 9
// Level 4: Presence for 28 days with average score ≥ 9
// Level 5: Presence for 28 days with average score = 10

interface PresenceLevelRequirements {
  level: number;
  requiredDays: number;
  minAverageScore: number;
  description: string;
}

export const PRESENCE_LEVELS: PresenceLevelRequirements[] = [
  { level: 1, requiredDays: 7, minAverageScore: 0, description: 'Log presence for 7 days' },
  { level: 2, requiredDays: 7, minAverageScore: 9, description: 'Presence for 7 days with average ≥ 9' },
  { level: 3, requiredDays: 14, minAverageScore: 9, description: 'Presence for 14 days with average ≥ 9' },
  { level: 4, requiredDays: 28, minAverageScore: 9, description: 'Presence for 28 days with average ≥ 9' },
  { level: 5, requiredDays: 28, minAverageScore: 10, description: 'Presence for 28 days with average = 10' },
];

export const calculatePresenceLevelProgress = (
  entries: DailyEntry[],
  currentLevel: number,
  levelStartDate: string
): PresenceLevelProgress => {
  // Filter entries since level start with presence scores
  const entriesWithPresence = entries.filter(
    (e) => e.date >= levelStartDate && e.presenceScore !== undefined
  );

  const daysAtCurrentLevel = entriesWithPresence.length;
  const totalScore = entriesWithPresence.reduce((sum, e) => sum + (e.presenceScore || 0), 0);
  const averageScore = daysAtCurrentLevel > 0 ? totalScore / daysAtCurrentLevel : 0;

  const nextLevel = currentLevel < 5 ? PRESENCE_LEVELS[currentLevel] : PRESENCE_LEVELS[4];

  return {
    currentLevel,
    daysAtCurrentLevel,
    averageScore: Math.round(averageScore * 10) / 10,
    requiredDays: nextLevel.requiredDays,
    requiredScore: nextLevel.minAverageScore,
  };
};

export const checkPresenceLevelUp = (
  entries: DailyEntry[],
  currentLevel: number,
  levelStartDate: string
): boolean => {
  if (currentLevel >= 5) return false;

  const nextLevel = PRESENCE_LEVELS[currentLevel];
  const entriesWithPresence = entries.filter(
    (e) => e.date >= levelStartDate && e.presenceScore !== undefined
  );

  if (entriesWithPresence.length < nextLevel.requiredDays) return false;

  const totalScore = entriesWithPresence.reduce((sum, e) => sum + (e.presenceScore || 0), 0);
  const averageScore = totalScore / entriesWithPresence.length;

  return averageScore >= nextLevel.minAverageScore;
};

// ============= PRODUCTIVITY/CHARACTER 9 LEVELS GAME =============
interface ProductivityLevelRequirements {
  level: number;
  requiredDays: number;
  minProductivityScore: number;
  minPresenceScore: number;
  minSetsPerDay: number;
  maxTimeWasterMinutes?: number;
  requiresDailyGoals: boolean;
  requiresWeeklyGoals: boolean;
  requiresMonthlyGoals: boolean;
  description: string;
}

export const PRODUCTIVITY_LEVELS: ProductivityLevelRequirements[] = [
  {
    level: 1,
    requiredDays: 3,
    minProductivityScore: 2,
    minPresenceScore: 2,
    minSetsPerDay: 12,
    requiresDailyGoals: false,
    requiresWeeklyGoals: false,
    requiresMonthlyGoals: false,
    description: 'Productivity ≥2, Presence ≥2, 12+ sets/day for 3 days',
  },
  {
    level: 2,
    requiredDays: 7,
    minProductivityScore: 2,
    minPresenceScore: 2,
    minSetsPerDay: 12,
    maxTimeWasterMinutes: 30,
    requiresDailyGoals: true,
    requiresWeeklyGoals: false,
    requiresMonthlyGoals: false,
    description: 'Level 1 + Time wasters ≤30min + Daily goals for 7 days',
  },
  {
    level: 3,
    requiredDays: 14,
    minProductivityScore: 2,
    minPresenceScore: 2,
    minSetsPerDay: 12,
    maxTimeWasterMinutes: 30,
    requiresDailyGoals: true,
    requiresWeeklyGoals: true,
    requiresMonthlyGoals: false,
    description: 'Level 2 + Weekly goals for 14 days',
  },
  {
    level: 4,
    requiredDays: 28,
    minProductivityScore: 2,
    minPresenceScore: 2,
    minSetsPerDay: 12,
    maxTimeWasterMinutes: 30,
    requiresDailyGoals: true,
    requiresWeeklyGoals: true,
    requiresMonthlyGoals: true,
    description: 'Level 3 + Monthly goals for 28 days',
  },
  {
    level: 5,
    requiredDays: 28,
    minProductivityScore: 3,
    minPresenceScore: 3,
    minSetsPerDay: 12,
    maxTimeWasterMinutes: 30,
    requiresDailyGoals: true,
    requiresWeeklyGoals: true,
    requiresMonthlyGoals: true,
    description: 'Level 4 + Productivity ≥3, Presence ≥3 for 28 days',
  },
];

export const calculateProductivityLevelProgress = (
  entries: DailyEntry[],
  dailyGoals: Goal[],
  weeklyGoals: Goal[],
  monthlyGoals: Goal[],
  currentLevel: number,
  levelStartDate: string
): ProductivityLevelProgress => {
  const relevantEntries = entries.filter((e) => e.date >= levelStartDate);
  const daysAtCurrentLevel = relevantEntries.length;

  // Calculate averages
  const entriesWithProductivity = relevantEntries.filter((e) => e.productivityScore !== undefined);
  const entriesWithPresence = relevantEntries.filter((e) => e.presenceScore !== undefined);
  const entriesWithSets = relevantEntries.filter((e) => e.deepWorkSets !== undefined);
  const entriesWithTimeWaster = relevantEntries.filter((e) => e.timeWasterMinutes !== undefined);

  const avgProductivity =
    entriesWithProductivity.length > 0
      ? entriesWithProductivity.reduce((sum, e) => sum + (e.productivityScore || 0), 0) / entriesWithProductivity.length
      : 0;

  const avgPresence =
    entriesWithPresence.length > 0
      ? entriesWithPresence.reduce((sum, e) => sum + (e.presenceScore || 0), 0) / entriesWithPresence.length
      : 0;

  const avgSets =
    entriesWithSets.length > 0
      ? entriesWithSets.reduce((sum, e) => sum + (e.deepWorkSets || 0), 0) / entriesWithSets.length
      : 0;

  const avgTimeWaster =
    entriesWithTimeWaster.length > 0
      ? entriesWithTimeWaster.reduce((sum, e) => sum + (e.timeWasterMinutes || 0), 0) / entriesWithTimeWaster.length
      : 0;

  // Calculate goal achievement rates
  const relevantDailyGoals = dailyGoals.filter((g) => g.date >= levelStartDate);
  const dailyGoalsAchievedRate =
    relevantDailyGoals.length > 0
      ? relevantDailyGoals.filter((g) => g.completed).length / relevantDailyGoals.length
      : 0;

  const relevantWeeklyGoals = weeklyGoals.filter((g) => g.date >= levelStartDate.slice(0, 8));
  const weeklyGoalsAchievedRate =
    relevantWeeklyGoals.length > 0
      ? relevantWeeklyGoals.filter((g) => g.completed).length / relevantWeeklyGoals.length
      : 0;

  const relevantMonthlyGoals = monthlyGoals.filter((g) => g.date >= levelStartDate.slice(0, 7));
  const monthlyGoalsAchievedRate =
    relevantMonthlyGoals.length > 0
      ? relevantMonthlyGoals.filter((g) => g.completed).length / relevantMonthlyGoals.length
      : 0;

  const nextLevel = currentLevel < 5 ? PRODUCTIVITY_LEVELS[currentLevel] : PRODUCTIVITY_LEVELS[4];

  return {
    currentLevel,
    daysAtCurrentLevel,
    averageProductivityScore: Math.round(avgProductivity * 10) / 10,
    averagePresenceScore: Math.round(avgPresence * 10) / 10,
    averageSetsPerDay: Math.round(avgSets * 10) / 10,
    averageTimeWasterMinutes: Math.round(avgTimeWaster),
    dailyGoalsAchievedRate: Math.round(dailyGoalsAchievedRate * 100),
    weeklyGoalsAchievedRate: Math.round(weeklyGoalsAchievedRate * 100),
    monthlyGoalsAchievedRate: Math.round(monthlyGoalsAchievedRate * 100),
    requiredDays: nextLevel.requiredDays,
    requirements: {
      minProductivityScore: nextLevel.minProductivityScore,
      minPresenceScore: nextLevel.minPresenceScore,
      minSetsPerDay: nextLevel.minSetsPerDay,
      maxTimeWasterMinutes: nextLevel.maxTimeWasterMinutes,
      dailyGoals: nextLevel.requiresDailyGoals,
      weeklyGoals: nextLevel.requiresWeeklyGoals,
      monthlyGoals: nextLevel.requiresMonthlyGoals,
    },
  };
};

export const checkProductivityLevelUp = (
  entries: DailyEntry[],
  dailyGoals: Goal[],
  weeklyGoals: Goal[],
  monthlyGoals: Goal[],
  currentLevel: number,
  levelStartDate: string
): boolean => {
  if (currentLevel >= 5) return false;

  const nextLevel = PRODUCTIVITY_LEVELS[currentLevel];
  const relevantEntries = entries.filter((e) => e.date >= levelStartDate);

  if (relevantEntries.length < nextLevel.requiredDays) return false;

  // Check score requirements
  const entriesWithScores = relevantEntries.filter(
    (e) => e.productivityScore !== undefined && e.presenceScore !== undefined && e.deepWorkSets !== undefined
  );

  if (entriesWithScores.length < nextLevel.requiredDays) return false;

  const avgProductivity =
    entriesWithScores.reduce((sum, e) => sum + (e.productivityScore || 0), 0) / entriesWithScores.length;
  const avgPresence =
    entriesWithScores.reduce((sum, e) => sum + (e.presenceScore || 0), 0) / entriesWithScores.length;
  const avgSets =
    entriesWithScores.reduce((sum, e) => sum + (e.deepWorkSets || 0), 0) / entriesWithScores.length;

  if (avgProductivity < nextLevel.minProductivityScore) return false;
  if (avgPresence < nextLevel.minPresenceScore) return false;
  if (avgSets < nextLevel.minSetsPerDay) return false;

  // Check time waster (Level 2+)
  if (nextLevel.maxTimeWasterMinutes !== undefined) {
    const entriesWithTimeWaster = relevantEntries.filter((e) => e.timeWasterMinutes !== undefined);
    if (entriesWithTimeWaster.length < nextLevel.requiredDays) return false;
    const avgTimeWaster =
      entriesWithTimeWaster.reduce((sum, e) => sum + (e.timeWasterMinutes || 0), 0) / entriesWithTimeWaster.length;
    if (avgTimeWaster > nextLevel.maxTimeWasterMinutes) return false;
  }

  // Check goals
  if (nextLevel.requiresDailyGoals) {
    const relevantDailyGoals = dailyGoals.filter((g) => g.date >= levelStartDate);
    if (relevantDailyGoals.length === 0) return false;
    const allCompleted = relevantDailyGoals.every((g) => g.completed);
    if (!allCompleted) return false;
  }

  if (nextLevel.requiresWeeklyGoals) {
    const relevantWeeklyGoals = weeklyGoals.filter((g) => g.date >= levelStartDate.slice(0, 8));
    if (relevantWeeklyGoals.length === 0) return false;
    const allCompleted = relevantWeeklyGoals.every((g) => g.completed);
    if (!allCompleted) return false;
  }

  if (nextLevel.requiresMonthlyGoals) {
    const relevantMonthlyGoals = monthlyGoals.filter((g) => g.date >= levelStartDate.slice(0, 7));
    if (relevantMonthlyGoals.length === 0) return false;
    const allCompleted = relevantMonthlyGoals.every((g) => g.completed);
    if (!allCompleted) return false;
  }

  return true;
};
