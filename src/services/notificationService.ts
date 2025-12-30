import { getMessagingInstance } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';

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

// FCM Token Management
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log('FCM is not supported on this browser');
      return null;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Register the Firebase messaging service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);

    const token = await getToken(messaging, {
      vapidKey: 'BKagOny0KF_2pCJQ3m....', // You'll need to generate this from Firebase Console
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Setup foreground message listener
export const setupForegroundMessageListener = async () => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);

      const notificationTitle = payload.notification?.title || 'The 9th Character';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: payload.data?.tag || 'default',
      };

      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
      }
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
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
