# Push Notifications Setup Guide

This guide explains how to complete the setup for mobile push notifications in The 9th Character PWA.

## Version: v30-12-1612

## Overview

The PWA now supports Firebase Cloud Messaging (FCM) for push notifications on mobile devices. The basic infrastructure is in place, but you need to complete a few steps in the Firebase Console.

## Setup Steps

### 1. Generate VAPID Key (Web Push Certificate)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `the-9th-character`
3. Navigate to **Project Settings** (gear icon) → **Cloud Messaging** tab
4. Scroll down to **Web configuration** section
5. Under **Web Push certificates**, click **Generate key pair**
6. Copy the generated key (starts with "B...")

### 2. Update the VAPID Key in Code

Open `src/services/notificationService.ts` and replace the placeholder VAPID key:

```typescript
const token = await getToken(messaging, {
  vapidKey: 'YOUR_GENERATED_VAPID_KEY_HERE', // Replace this line
  serviceWorkerRegistration: registration
});
```

### 3. Verify Firebase Configuration

The following files already have Firebase configuration:
- `public/firebase-messaging-sw.js` - Service worker for background notifications
- `src/firebase.ts` - Firebase initialization
- `vite.config.ts` - Manifest with FCM sender ID

## Features Implemented

### ✅ Completed
- [x] Firebase Cloud Messaging integration
- [x] Notification permission request on mobile
- [x] Service worker for push notifications (`firebase-messaging-sw.js`)
- [x] FCM token management
- [x] Foreground message listener
- [x] Notification context provider
- [x] Settings screen notification controls
- [x] Version display (v30-12-1612) in footer and settings
- [x] Manifest updated with `gcm_sender_id`

### 📋 Next Steps (Optional Enhancements)

1. **Server-side Push Notifications**
   - Set up Cloud Functions to send scheduled reminders
   - Send notifications for habit/goal reminders based on user settings

2. **Token Persistence**
   - Save FCM tokens to Firestore user documents
   - Enable server to send personalized notifications

3. **Notification Scheduling**
   - Implement morning/midday/evening reminders
   - Use user's configured reminder times from settings

## Testing Push Notifications

### Local Testing (Browser)

1. **Build and serve the app:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Test notification permission:**
   - Open the app in a browser
   - Go to Settings
   - Click "Enable Notifications"
   - Accept the permission prompt

3. **Check FCM token:**
   - Open browser DevTools Console
   - Look for "FCM Token:" message
   - This confirms FCM is working

### Mobile Testing

1. **Deploy to a server** (required for mobile testing):
   - Push notifications require HTTPS
   - Deploy to Vercel, Netlify, or similar
   - Or use `ngrok` for local testing with HTTPS

2. **Install PWA on mobile:**
   - Open the deployed URL on mobile
   - Add to Home Screen (iOS) or Install (Android)
   - Open the installed PWA

3. **Test notifications:**
   - Grant notification permission in Settings
   - Send a test notification from Firebase Console:
     - Firebase Console → Cloud Messaging → Send test message
     - Add your FCM token
     - Send the notification

## Sending Test Notifications from Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Click **Send your first message**
3. Enter:
   - **Notification title**: "Test from The 9th Character"
   - **Notification text**: "Your notifications are working!"
4. Click **Send test message**
5. Paste your FCM token (from console logs)
6. Click **Test**

## Code Structure

```
src/
├── context/
│   └── NotificationContext.tsx    # Manages FCM tokens and permissions
├── services/
│   └── notificationService.ts     # Notification helpers and FCM setup
└── firebase.ts                    # Firebase initialization

public/
└── firebase-messaging-sw.js       # Service worker for background push

vite.config.ts                     # PWA manifest with FCM sender ID
```

## Important Notes

- **VAPID Key is Required**: Push notifications won't work until you add your VAPID key
- **HTTPS Required**: Push notifications only work on HTTPS (or localhost)
- **Mobile-First**: The app auto-requests permissions on mobile devices
- **Background Messages**: Handled by `firebase-messaging-sw.js`
- **Foreground Messages**: Handled by `NotificationContext.tsx`

## Troubleshooting

### Notifications not appearing?
1. Check browser console for errors
2. Verify notification permission is "granted"
3. Ensure VAPID key is correctly set
4. Test on HTTPS (not HTTP)

### FCM token not generating?
1. Check Firebase configuration in `.env` file
2. Verify service worker is registered
3. Check browser console for Firebase errors

### Mobile notifications not working?
1. Ensure app is served over HTTPS
2. Install as PWA (Add to Home Screen)
3. Check if notifications are blocked in device settings

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Version**: v30-12-1612
**Last Updated**: December 30, 2024
