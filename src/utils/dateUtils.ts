import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subDays, getWeek, getYear } from 'date-fns';

export const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const formatWeek = (date: Date): string => {
  const year = getYear(date);
  const week = getWeek(date, { weekStartsOn: 1 });
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

export const formatMonth = (date: Date): string => format(date, 'yyyy-MM');

export const getToday = (): string => formatDate(new Date());

export const getCurrentWeek = (): string => formatWeek(new Date());

export const getCurrentMonth = (): string => formatMonth(new Date());

export const getWeekDates = (date: Date): string[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(formatDate);
};

export const getMonthDates = (date: Date): string[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end }).map(formatDate);
};

export const getLast7Days = (): string[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => formatDate(subDays(today, 6 - i)));
};

export const getLast30Days = (): string[] => {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => formatDate(subDays(today, 29 - i)));
};

export const getDaysInRange = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return eachDayOfInterval({ start, end }).map(formatDate);
};

export const getDayOfWeek = (dateString: string): string => {
  return format(new Date(dateString), 'EEE');
};

export const formatDisplayDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM d, yyyy');
};

export const isToday = (dateString: string): boolean => {
  return dateString === getToday();
};
