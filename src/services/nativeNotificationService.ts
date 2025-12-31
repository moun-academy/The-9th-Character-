import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Check if we're running on a native platform
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Request notification permissions
export const requestNativeNotificationPermission = async (): Promise<'granted' | 'denied'> => {
  console.log('[Native] Requesting notification permissions...');

  try {
    const result = await LocalNotifications.requestPermissions();
    console.log('[Native] Permission result:', result.display);

    return result.display === 'granted' ? 'granted' : 'denied';
  } catch (error) {
    console.error('[Native] Error requesting permissions:', error);
    return 'denied';
  }
};

// Check notification permissions
export const checkNativeNotificationPermission = async (): Promise<'granted' | 'denied'> => {
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted' ? 'granted' : 'denied';
  } catch (error) {
    console.error('[Native] Error checking permissions:', error);
    return 'denied';
  }
};

// Schedule hourly notifications
export const scheduleHourlyNotifications = async (config: {
  startHour: number;
  endHour: number;
  message: string;
}) => {
  console.log('[Native] Scheduling hourly notifications:', config);

  try {
    // Cancel existing notifications
    await LocalNotifications.cancel({ notifications: [] });
    console.log('[Native] Cancelled existing notifications');

    // Check permissions
    const permission = await checkNativeNotificationPermission();
    if (permission !== 'granted') {
      console.log('[Native] ❌ Permission not granted');
      return false;
    }

    // Create notifications for each hour in the range
    const notifications = [];
    let notificationId = 1;

    for (let hour = config.startHour; hour < config.endHour; hour++) {
      // Schedule for today if hour hasn't passed, otherwise tomorrow
      const scheduleDate = new Date();

      if (scheduleDate.getHours() >= hour) {
        // Hour has passed today, schedule for tomorrow
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      scheduleDate.setHours(hour, 0, 0, 0);

      notifications.push({
        id: notificationId++,
        title: 'Hourly Reminder',
        body: config.message,
        schedule: {
          at: scheduleDate,
          every: 'day' as const, // Repeat daily
          allowWhileIdle: true
        },
        sound: undefined,
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#f59e0b',
      });
    }

    console.log(`[Native] Scheduling ${notifications.length} notifications`);
    await LocalNotifications.schedule({ notifications });

    console.log('[Native] ✅ Hourly notifications scheduled successfully');
    return true;
  } catch (error) {
    console.error('[Native] ❌ Error scheduling notifications:', error);
    return false;
  }
};

// Cancel all scheduled notifications
export const cancelHourlyNotifications = async () => {
  console.log('[Native] Cancelling all notifications...');

  try {
    const pending = await LocalNotifications.getPending();
    console.log('[Native] Pending notifications:', pending.notifications.length);

    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
      console.log('[Native] ✅ Cancelled all notifications');
    }
  } catch (error) {
    console.error('[Native] ❌ Error cancelling notifications:', error);
  }
};

// Show an immediate test notification
export const showTestNotification = async (message: string) => {
  console.log('[Native] Showing test notification...');

  try {
    const permission = await checkNativeNotificationPermission();

    if (permission !== 'granted') {
      console.log('[Native] ❌ Permission not granted');
      return { success: false, message: 'Permission not granted' };
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: 999,
        title: 'Test Notification',
        body: message,
        schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
        sound: undefined,
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#f59e0b',
      }]
    });

    console.log('[Native] ✅ Test notification scheduled');
    return { success: true, message: 'Test notification sent!' };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Native] ❌ Error:', error);
    return { success: false, message: `Error: ${errorMsg}` };
  }
};

// Get pending notifications
export const getPendingNotifications = async (): Promise<number> => {
  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications.length;
  } catch (error) {
    console.error('[Native] Error getting pending notifications:', error);
    return 0;
  }
};
