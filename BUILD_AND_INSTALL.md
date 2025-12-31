# Build and Install Guide - Native Android App

## Version: v12-31-1600

This guide explains how to build and install The 9th Character as a native Android app on your phone without using the Play Store.

---

## ✅ What's Included

The app has been converted from a PWA to a native Android app using Capacitor:

### Native Features:
- ✅ **Native Push Notifications** - Work even when app is fully closed
- ✅ **Hourly Reminders** - Scheduled natively (7 AM - 9 PM by default)
- ✅ **Persistent Notifications** - Android OS manages them, no need to keep app open
- ✅ **All Existing Features** - Habits, Goals, SSR tracking, Firebase sync

### How Notifications Work:
- **On Android (Native App)**: Uses Capacitor Local Notifications API
  - Notifications trigger even when app is closed
  - Managed by Android's notification system
  - Battery efficient
  - Reliable hourly scheduling

- **On Web (PWA)**: Uses Service Worker API
  - Requires app to be running in background
  - Browser-based notifications

---

## 📋 Prerequisites

Before building, ensure you have:

1. **Java Development Kit (JDK) 17**
   ```bash
   # Check if you have JDK installed:
   java --version

   # If not installed, download from:
   # https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   ```

2. **Android SDK** (via Android Studio)
   - Download Android Studio: https://developer.android.com/studio
   - During installation, make sure to install Android SDK
   - Minimum SDK: API 22 (Android 5.1)
   - Target SDK: API 33 (Android 13)

3. **Environment Variables** (Important!)
   ```bash
   # Add to your ~/.bashrc or ~/.zshrc:
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools

   # Apply changes:
   source ~/.bashrc  # or source ~/.zshrc
   ```

---

## 🔨 Building the APK

### Step 1: Navigate to the Android Directory
```bash
cd android
```

### Step 2: Make gradlew Executable (First Time Only)
```bash
chmod +x gradlew
```

### Step 3: Build the Debug APK
```bash
./gradlew assembleDebug
```

This will take a few minutes on the first build as it downloads dependencies.

### Step 4: Locate the APK
After successful build, your APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy it to an easily accessible location:
```bash
cp app/build/outputs/apk/debug/app-debug.apk ~/the-9th-character.apk
```

---

## 📱 Installing on Your Phone

### Method 1: Transfer via USB

1. **Enable USB Debugging on Your Phone:**
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times to enable Developer Options
   - Go back to **Settings** → **Developer Options**
   - Enable **USB Debugging**

2. **Connect Phone to Computer:**
   ```bash
   # Verify connection:
   adb devices

   # You should see your device listed
   ```

3. **Install APK via ADB:**
   ```bash
   cd android
   ./gradlew installDebug

   # Or manually:
   adb install ~/the-9th-character.apk
   ```

### Method 2: Transfer via File Transfer

1. **Copy APK to Phone:**
   - Connect phone to computer via USB
   - Enable **File Transfer** mode on phone
   - Copy `the-9th-character.apk` to your phone's **Downloads** folder

2. **Enable Installation from Unknown Sources:**
   - On Android 8.0+:
     - Go to **Settings** → **Apps & Notifications**
     - Tap **Special App Access**
     - Tap **Install Unknown Apps**
     - Select your **File Manager** app
     - Toggle **Allow from this source**

3. **Install the APK:**
   - Open your phone's **File Manager**
   - Navigate to **Downloads**
   - Tap on `the-9th-character.apk`
   - Tap **Install**
   - Tap **Open** when installation completes

### Method 3: Transfer via Cloud/Email

1. **Upload APK:**
   - Upload `the-9th-character.apk` to Google Drive, Dropbox, or email it to yourself

2. **Download on Phone:**
   - Open the file on your phone
   - Follow installation steps from Method 2

---

## ⚙️ First-Time Setup

### 1. Grant Notification Permissions

When you first open the app:

1. The app will request notification permissions
2. Tap **Allow** to enable notifications
3. This is required for hourly reminders to work

### 2. Enable Hourly Notifications

1. Open the app
2. Go to **Settings**
3. Scroll to **HOURLY NOTIFICATION SCHEDULER**
4. Toggle **Enable Hourly Notifications** to ON (green)
5. Configure:
   - **Start Time**: Default 07:00 (7 AM)
   - **End Time**: Default 21:00 (9 PM)
   - **Message**: Customize your reminder message
6. Tap to save

The app will schedule notifications for every hour between your start and end times.

### 3. Test Notifications

1. In Settings, scroll to **NOTIFICATION TESTER**
2. Tap **Send Test Notification Now**
3. You should see a notification appear immediately
4. If it doesn't appear, check:
   - Notification permissions are granted
   - Battery optimization is OFF for the app (Settings → Battery → App)
   - Do Not Disturb is OFF

---

## 🔧 Development Commands

### Rebuild Web Assets
```bash
npm run build
```

### Sync Web Assets to Android
```bash
npx cap sync android
```

### Open in Android Studio
```bash
npx cap open android
```

### Build Release APK (for distribution)
```bash
cd android
./gradlew assembleRelease
```

Release APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🐛 Troubleshooting

### Build Fails with "SDK location not found"

**Solution:**
Create `android/local.properties`:
```properties
sdk.dir=/path/to/Android/Sdk
```

Replace `/path/to/Android/Sdk` with your actual Android SDK location:
- **macOS/Linux**: `~/Android/Sdk` or `~/Library/Android/sdk`
- **Windows**: `C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk`

### Notifications Not Appearing

1. **Check Permissions:**
   - Settings → Apps → The 9th Character → Notifications → Allow

2. **Disable Battery Optimization:**
   - Settings → Battery → Battery Optimization
   - Find "The 9th Character"
   - Select "Don't optimize"

3. **Check Do Not Disturb:**
   - Ensure Do Not Disturb is OFF or app is whitelisted

4. **Verify Scheduled Notifications:**
   - Open app
   - Check console logs in Android Studio Logcat
   - Look for `[Native]` prefix logs

### App Crashes on Launch

1. **Check Logcat in Android Studio:**
   ```bash
   adb logcat | grep -i "9thcharacter"
   ```

2. **Clear App Data:**
   - Settings → Apps → The 9th Character → Storage → Clear Data

3. **Reinstall:**
   ```bash
   adb uninstall com.mounacademy.the9thcharacter
   adb install ~/the-9th-character.apk
   ```

---

## 📦 App Information

- **Package Name**: `com.mounacademy.the9thcharacter`
- **App Name**: The 9th Character
- **Version**: v12-31-1600
- **Min Android Version**: 5.1 (API 22)
- **Target Android Version**: 13 (API 33)

---

## 🔄 Updating the App

To update to a new version:

1. **Rebuild the APK** (follow build steps above)
2. **Install over existing app** (data will be preserved)
   ```bash
   adb install -r ~/the-9th-character.apk
   ```

Your habits, goals, and settings are stored in Firebase, so they'll sync automatically.

---

## 🎯 What's Different from PWA

| Feature | PWA | Native Android App |
|---------|-----|-------------------|
| Installation | Add to Home Screen | Install APK |
| Notifications (App Closed) | ❌ No | ✅ Yes |
| Notifications (App Open) | ✅ Yes | ✅ Yes |
| Battery Efficient | ⚠️ Moderate | ✅ Yes |
| Offline Support | ✅ Yes | ✅ Yes |
| Auto Updates | ✅ Yes | ⚠️ Manual |
| File Size | ~1 MB | ~10 MB |

---

## 📝 Notes

- Notifications are scheduled locally on your device
- They will trigger even if the app is fully closed
- If you change notification settings, the app will reschedule all notifications
- All your data is synced to Firebase, so you can use both the web and native apps

---

## 🚀 Next Steps

After installation:

1. ✅ Enable notification permissions
2. ✅ Configure hourly notification times in Settings
3. ✅ Test notifications to ensure they work
4. ✅ Start tracking your habits and goals!

---

## 📧 Support

If you encounter any issues:
1. Check the Troubleshooting section
2. View logs in Android Studio Logcat
3. Check console logs in the app (Settings → NOTIFICATION TESTER)

---

**Happy Building! 🎉**
