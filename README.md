# The 9th Character

Your daily cockpit for presence and action - a personal development web app based on the 5 Second Rule.

## Features

- **Identity Tracking**: Daily votes on living as your true self with streaks
- **5 Second Rule**: Track aligned actions across Social, Productivity, and Presence categories
- **Habit Tracking**: Atomic Habits-style habit management with streaks
- **Goals**: Daily, weekly, and monthly goal setting and tracking
- **Levels Games**: Two progression systems:
  - Presence Levels (1-5)
  - Productivity/Character 9 Levels (1-5)
- **Daily Scores**: Track presence and productivity scores (1-10)
- **Deep Work Sets**: Log 30-minute focused work sessions
- **Progress Charts**: Weekly and monthly trends visualization
- **PWA Support**: Install on phone or desktop, works offline
- **Cloud Sync**: Data syncs across all your devices

## Philosophy

> "Enjoy the ride. This moment is all I have. Live it and embrace it."

> "The 5 second rule is my path to living on my own terms, being in the driver seat, increasing confidence, and choosing presence."

> "Wherever I am, I am always 5 seconds away from getting back to the straight line."

## Setup

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the configuration values

### 2. Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration values:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Enable Firebase Services

1. **Authentication**: Enable Google and Email/Password sign-in methods
2. **Firestore Database**: Create a Firestore database in production mode

### 4. Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

### 7. Build for Production

```bash
npm run build
```

## Deployment

The app can be deployed to any static hosting service:

- **Firebase Hosting** (recommended for full Firebase integration)
- **Vercel**
- **Netlify**

### Firebase Hosting Deployment

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## PWA Installation

### On Mobile (iOS/Android)
1. Open the app in your browser
2. Tap "Share" button
3. Select "Add to Home Screen"

### On Desktop (Chrome)
1. Open the app
2. Click the install icon in the address bar
3. Click "Install"

## Notifications

Enable notifications in Settings to receive:
- **Morning**: Identity vote reminder, set daily goals
- **Midday**: 5 Second Rule reminder
- **Evening**: Enter scores and log deep work sets

## Levels Games

### Presence Levels
- **Level 1**: Log presence for 7 days
- **Level 2**: 7 days with average score >= 9
- **Level 3**: 14 days with average score >= 9
- **Level 4**: 28 days with average score >= 9
- **Level 5**: 28 days with average score = 10

### Character 9 Levels
- **Level 1**: 3 days with productivity >= 2, presence >= 2, 12+ sets/day
- **Level 2**: 7 days + time wasters <= 30min + daily goals
- **Level 3**: 14 days + weekly goals
- **Level 4**: 28 days + monthly goals
- **Level 5**: 28 days + productivity >= 3, presence >= 3

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Firebase** (Auth, Firestore)
- **Recharts** for data visualization
- **Lucide React** for icons
- **PWA** with Workbox for offline support

## License

Personal use only.
