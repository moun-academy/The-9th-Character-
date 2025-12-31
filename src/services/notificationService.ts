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
  if (!checkNotificationSupport()) {
    console.log('[Notification] Browser does not support notifications');
    return 'denied';
  }

  try {
    console.log('[Notification] Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('[Notification] Permission result:', permission);
    return permission;
  } catch (error) {
    console.error('[Notification] Error requesting permission:', error);
    return 'denied';
  }
};

// FCM Token Management
export const getFCMToken = async (): Promise<string | null> => {
  try {
    console.log('[FCM] Starting token generation...');
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log('[FCM] Not supported on this browser');
      return null;
    }
    console.log('[FCM] Messaging instance obtained');

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission not granted:', permission);
      return null;
    }
    console.log('[FCM] Permission granted, registering service worker...');

    // Register the Firebase messaging service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[FCM] Service Worker registered:', registration);

    console.log('[FCM] Requesting FCM token with VAPID key...');
    const token = await getToken(messaging, {
      vapidKey: 'BNh9mYnbeNvtt7Fwg7YruqCS8qfLwnuCmLs_QQtHdK0Mb210JdOUVbfOD92i0cZemuOcjhV66kjmb3FW0RAGI7k',
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('[FCM] ✅ Token generated successfully:', token);
      return token;
    } else {
      console.log('[FCM] ❌ No registration token available');
      return null;
    }
  } catch (error) {
    console.error('[FCM] ❌ Error getting token:', error);
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

export const showLocalNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
  console.log('[Notification] Attempting to show notification:', title);

  if (!checkNotificationSupport()) {
    console.log('[Notification] ❌ Not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('[Notification] ❌ Permission not granted:', Notification.permission);
    return;
  }

  try {
    console.log('[Notification] ✅ Getting service worker registration...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[Notification] ✅ Service worker ready, showing notification...');

    // Use Service Worker API for notifications (required for mobile/PWA)
    await registration.showNotification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });

    console.log('[Notification] ✅ Notification displayed successfully');
  } catch (error) {
    console.error('[Notification] ❌ Error showing notification:', error);
    throw error;
  }
};

// Test notification function for debugging
export const sendTestNotification = async (): Promise<{ success: boolean; message: string }> => {
  console.log('[TEST] ========== NOTIFICATION TEST STARTED ==========');

  try {
    // Check support
    if (!checkNotificationSupport()) {
      const msg = 'Notifications not supported in this browser';
      console.log('[TEST] ❌', msg);
      return { success: false, message: msg };
    }
    console.log('[TEST] ✅ Browser supports notifications');

    // Check permission
    const currentPermission = Notification.permission;
    console.log('[TEST] Current permission:', currentPermission);

    if (currentPermission !== 'granted') {
      const msg = `Permission is ${currentPermission}. Please grant permission first.`;
      console.log('[TEST] ❌', msg);
      return { success: false, message: msg };
    }
    console.log('[TEST] ✅ Permission is granted');

    // Check service worker
    if (!('serviceWorker' in navigator)) {
      const msg = 'Service Worker not supported';
      console.log('[TEST] ❌', msg);
      return { success: false, message: msg };
    }
    console.log('[TEST] ✅ Service Worker supported');

    // Wait for service worker to be ready
    console.log('[TEST] Waiting for service worker to be ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[TEST] ✅ Service worker ready:', registration);

    // Send test notification using Service Worker API
    console.log('[TEST] Sending test notification...');
    await showLocalNotification('Test - Are you doing what\'s right?', {
      body: 'If not, use the 5 second rule!',
      tag: 'test-notification',
      requireInteraction: false,
    });

    console.log('[TEST] ========== NOTIFICATION TEST COMPLETED ==========');
    return {
      success: true,
      message: 'Test notification sent! Check if it appeared on your device.'
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[TEST] ❌ Error:', error);
    console.log('[TEST] ========== NOTIFICATION TEST FAILED ==========');
    return {
      success: false,
      message: `Error: ${errorMsg}`
    };
  }
};

// Hourly Notification Scheduler
let hourlyNotificationInterval: number | null = null;

export const startHourlyNotifications = async (config: {
  startTime: string;
  endTime: string;
  message: string;
}) => {
  console.log('[Hourly] Starting hourly notifications:', config);

  // Clear any existing interval
  stopHourlyNotifications();

  // Schedule the next notification
  await scheduleNextHourlyNotification(config);

  // Set up hourly interval (check every minute to ensure we don't miss the hour)
  hourlyNotificationInterval = window.setInterval(async () => {
    await scheduleNextHourlyNotification(config);
  }, 60000); // Check every minute

  console.log('[Hourly] ✅ Hourly notifications started');
};

export const stopHourlyNotifications = () => {
  if (hourlyNotificationInterval !== null) {
    clearInterval(hourlyNotificationInterval);
    hourlyNotificationInterval = null;
    console.log('[Hourly] ✅ Hourly notifications stopped');
  }
};

export const scheduleNextHourlyNotification = async (config: {
  startTime: string;
  endTime: string;
  message: string;
}) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const [startHour] = config.startTime.split(':').map(Number);
  const [endHour] = config.endTime.split(':').map(Number);

  console.log('[Hourly] Checking schedule - Current:', `${currentHour}:${currentMinute}`, 'Range:', `${startHour}:00 - ${endHour}:00`);

  // Check if we're within the notification window and at the start of an hour
  if (currentHour >= startHour && currentHour < endHour && currentMinute === 0) {
    console.log('[Hourly] ✅ Time to send hourly notification!');
    try {
      await showLocalNotification('Hourly Reminder', {
        body: config.message,
        tag: `hourly-${currentHour}`,
        requireInteraction: false,
      });
    } catch (error) {
      console.error('[Hourly] ❌ Error sending notification:', error);
    }
  }
};

export const getNextHourlyNotificationTime = (config: {
  startTime: string;
  endTime: string;
}): string | null => {
  const now = new Date();
  const currentHour = now.getHours();

  const [startHour] = config.startTime.split(':').map(Number);
  const [endHour] = config.endTime.split(':').map(Number);

  // Find next notification time
  if (currentHour < startHour) {
    return `${config.startTime}`;
  } else if (currentHour >= endHour) {
    return `Tomorrow at ${config.startTime}`;
  } else {
    const nextHour = currentHour + 1;
    if (nextHour < endHour) {
      return `${nextHour.toString().padStart(2, '0')}:00`;
    } else {
      return `Tomorrow at ${config.startTime}`;
    }
  }
};

export const calculateNotificationsPerDay = (startTime: string, endTime: string): number => {
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  if (endHour <= startHour) return 0;
  return endHour - startHour;
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
