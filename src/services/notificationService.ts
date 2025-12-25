export interface NotificationPermissionStatus {
  permission: NotificationPermission;
  supported: boolean;
}

export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!checkNotificationSupport()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!checkNotificationSupport()) return 'denied';

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

export const showLocalNotification = (title: string, options?: NotificationOptions): void => {
  if (!checkNotificationSupport() || Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

// Schedule notifications using the browser's native scheduling
// For production, you'd use Firebase Cloud Messaging or a service worker
export const scheduleReminders = (settings: {
  morningTime: string;
  middayTime: string;
  eveningTime: string;
}) => {
  // Clear any existing scheduled notifications
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_NOTIFICATIONS',
      payload: settings,
    });
  }
};

// Morning reminder messages
export const MORNING_REMINDERS = [
  "Time for your identity vote. Who will you be today?",
  "Cast your vote: Are you living as your true self?",
  "New day, new opportunity. Set your intentions.",
];

// Midday reminder messages
export const MIDDAY_REMINDERS = [
  "5, 4, 3, 2, 1... Choose presence right now.",
  "Wherever you are, you're 5 seconds from the straight line.",
  "Take action. Use the 5 Second Rule.",
];

// Evening reminder messages
export const EVENING_REMINDERS = [
  "Time to reflect. Enter your presence and productivity scores.",
  "How did today go? Log your deep work sets.",
  "End your day with intention. Complete your daily log.",
];

export const getRandomReminder = (type: 'morning' | 'midday' | 'evening'): string => {
  const reminders = type === 'morning'
    ? MORNING_REMINDERS
    : type === 'midday'
      ? MIDDAY_REMINDERS
      : EVENING_REMINDERS;
  return reminders[Math.floor(Math.random() * reminders.length)];
};

// Calculate streak warning
export const shouldShowStreakWarning = (
  lastVoteDate: string | null,
  currentStreak: number
): boolean => {
  if (!lastVoteDate || currentStreak === 0) return false;

  const today = new Date();
  const lastVote = new Date(lastVoteDate);
  const diffTime = today.getTime() - lastVote.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Warn if it's getting late in the day and no vote today
  const hour = today.getHours();
  return diffDays >= 1 || (diffDays === 0 && hour >= 20);
};
