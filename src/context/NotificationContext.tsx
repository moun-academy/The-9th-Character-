import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  requestNotificationPermission,
  getFCMToken,
  setupForegroundMessageListener,
  checkNotificationSupport
} from '../services/notificationService';

interface NotificationContextType {
  notificationPermission: NotificationPermission;
  fcmToken: string | null;
  requestPermission: () => Promise<void>;
  isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported] = useState(checkNotificationSupport());

  // Request permission and setup FCM
  const requestPermission = async () => {
    if (!isSupported) {
      console.log('Notifications not supported');
      return;
    }

    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        // Get FCM token
        const token = await getFCMToken();
        setFcmToken(token);

        // Setup foreground message listener
        await setupForegroundMessageListener();

        // Save token to Firestore (optional, for server-side push)
        if (token && user) {
          // You can save the token to the user's document in Firestore
          // This allows sending push notifications from a server
          console.log('FCM Token for user:', user.uid, token);
          // await saveFCMTokenToFirestore(user.uid, token);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Auto-request permission on mobile when user is authenticated
  useEffect(() => {
    if (!user || !isSupported) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const currentPermission = Notification.permission;

    // Only auto-request on mobile devices if not already decided
    if (isMobile && currentPermission === 'default') {
      // Small delay to avoid overwhelming the user immediately
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000); // 3 seconds after login

      return () => clearTimeout(timer);
    } else if (currentPermission === 'granted') {
      // If already granted, just get the token
      getFCMToken().then(setFcmToken);
      setupForegroundMessageListener();
    }

    setNotificationPermission(currentPermission);
  }, [user, isSupported]);

  const value: NotificationContextType = {
    notificationPermission,
    fcmToken,
    requestPermission,
    isSupported,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
