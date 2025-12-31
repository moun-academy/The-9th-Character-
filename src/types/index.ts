// Identity and Daily Vote
export interface DailyVote {
  id: string;
  date: string; // YYYY-MM-DD
  vote: 'yes' | 'no';
  note?: string;
  timestamp: number;
}

// 5 Second Rule Action
export interface FiveSecondRuleAction {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'social' | 'productivity' | 'presence';
  note?: string;
  timestamp: number;
}

// Daily Entry (scores, sets, time waster)
export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  presenceScore?: number; // 1-10
  productivityScore?: number; // 1-10
  deepWorkSets?: number; // 30-min sets
  timeWasterMinutes?: number; // manual input for Level 2+
  timestamp: number;
}

// Habit
export interface Habit {
  id: string;
  name: string;
  category?: string;
  createdAt: number;
  archived: boolean;
}

// Habit Completion
export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  timestamp: number;
}

// Goal Types
export type GoalType = 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD for daily, YYYY-WW for weekly, YYYY-MM for monthly
  createdAt: number;
}

// User Settings (identity, preferences)
export interface UserSettings {
  identity: string;
  notificationsEnabled: boolean;
  morningReminderTime: string; // HH:MM
  middayReminderTime: string;
  eveningReminderTime: string;
  // Hourly notifications
  hourlyNotificationsEnabled?: boolean;
  hourlyNotificationStartTime?: string; // HH:MM
  hourlyNotificationEndTime?: string; // HH:MM
  hourlyNotificationMessage?: string;
}

// Levels Game State
export interface LevelsGameState {
  presenceLevel: number;
  presenceLevelStartDate: string;
  productivityLevel: number;
  productivityLevelStartDate: string;
}

// App State for a specific date
export interface DayData {
  vote?: DailyVote;
  entry?: DailyEntry;
  fiveSecondRuleActions: FiveSecondRuleAction[];
  habitCompletions: HabitCompletion[];
  dailyGoals: Goal[];
}

// Streak Information
export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalVotes: number;
}

// Presence Levels Game Progress
export interface PresenceLevelProgress {
  currentLevel: number;
  daysAtCurrentLevel: number;
  averageScore: number;
  requiredDays: number;
  requiredScore: number;
}

// Productivity Levels Game Progress
export interface ProductivityLevelProgress {
  currentLevel: number;
  daysAtCurrentLevel: number;
  averageProductivityScore: number;
  averagePresenceScore: number;
  averageSetsPerDay: number;
  averageTimeWasterMinutes: number;
  dailyGoalsAchievedRate: number;
  weeklyGoalsAchievedRate: number;
  monthlyGoalsAchievedRate: number;
  requiredDays: number;
  requirements: {
    minProductivityScore: number;
    minPresenceScore: number;
    minSetsPerDay: number;
    maxTimeWasterMinutes?: number;
    dailyGoals: boolean;
    weeklyGoals: boolean;
    monthlyGoals: boolean;
  };
}

// Weekly Trends
export interface WeeklyTrends {
  dates: string[];
  presenceScores: (number | null)[];
  productivityScores: (number | null)[];
  fiveSecondRuleSocial: number[];
  fiveSecondRuleProductivity: number[];
  fiveSecondRulePresence: number[];
  deepWorkSets: number[];
  habitCompletionRates: number[];
}
