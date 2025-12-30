// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDNzKxaGEinYjEJLsyTMTEAOvUaJ2sCZ6o",
  authDomain: "the-9th-character.firebaseapp.com",
  projectId: "the-9th-character",
  storageBucket: "the-9th-character.firebasestorage.app",
  messagingSenderId: "892975068334",
  appId: "1:892975068334:web:bb9f9ae96ca8ceb1a61d2e"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'The 9th Character';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.tag || 'default',
    requireInteraction: false,
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Navigate to the app
  event.waitUntil(
    clients.openWindow('/')
  );
});
