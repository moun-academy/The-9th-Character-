# Quick Start - Build Android APK

This guide will help you quickly build the Android APK for **The 9th Character** app on your local machine.

## Prerequisites

Before running the build script, ensure you have:

### Required:
- ✅ **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **JDK 17+** (JDK 21 recommended) - [Download](https://adoptium.net/)

### Optional but Recommended:
- **Android SDK** - The build script can work without it, but having it installed makes builds faster
  - Option 1: Install [Android Studio](https://developer.android.com/studio) (easiest)
  - Option 2: Install [Command-line tools only](https://developer.android.com/studio#command-line-tools-only)

If you install Android SDK, set the environment variable:
```bash
export ANDROID_HOME=$HOME/Android/Sdk  # Linux/Mac
# or
set ANDROID_HOME=%USERPROFILE%\Android\Sdk  # Windows
```

---

## One-Command Build

Once you have the prerequisites installed:

### On Linux/Mac:
```bash
./build-apk.sh
```

### On Windows:
```cmd
build-apk.bat
```

That's it! The script will:
1. ✅ Check prerequisites
2. ✅ Install dependencies
3. ✅ Build web assets
4. ✅ Sync to Android
5. ✅ Build the APK
6. ✅ Show you where the APK is located

---

## Step-by-Step (If You Prefer Manual Control)

If you want to run each step manually:

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Web Assets
```bash
npm run build
```

### 3. Sync to Android
```bash
npx cap sync android
```

### 4. Build APK
```bash
cd android
./gradlew assembleDebug
```

### 5. Find Your APK
```bash
# APK location:
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Installing on Your Phone

Once you have the APK file:

### Method 1: USB Cable (Fastest)
```bash
# Enable USB debugging on your phone first
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 2: File Transfer
1. Copy `app-debug.apk` to your phone (USB, Bluetooth, or cloud)
2. On your phone: Settings → Security → Enable "Install from Unknown Sources"
3. Use a file manager to find and tap the APK file
4. Tap "Install"

### Method 3: Email/Cloud
1. Email the APK to yourself or upload to Google Drive/Dropbox
2. Open the email/cloud file on your phone
3. Download and tap to install

---

## Troubleshooting

### Build fails with "ANDROID_HOME not set"
This is just a warning. The build will download SDK components automatically. If you want faster builds, install Android SDK and set ANDROID_HOME.

### Build fails with "Could not resolve dependency"
Make sure you have an active internet connection. Gradle needs to download Android build tools on first run.

### Build fails with "Java version"
You need JDK 17 or higher. Download from: https://adoptium.net/

### "Permission denied" error
Make the script executable:
```bash
chmod +x build-apk.sh
```

### APK won't install on phone
1. Enable "Install from Unknown Sources" in Settings → Security
2. Make sure you have enough storage space (at least 100MB free)
3. If updating an existing app, uninstall the old version first

---

## What's Next?

After installation:

1. **Open the app** on your phone
2. **Grant notification permissions** when prompted
3. **Configure your identity** (the 9th character of your identity)
4. **Set up hourly notifications** in Settings if desired
5. **Start tracking habits** and goals!

---

## App Features

- ✅ **Native Android app** - No browser required
- ✅ **Hourly notifications** - Even when app is closed
- ✅ **Offline support** - Works without internet
- ✅ **Firebase sync** - Data syncs across devices
- ✅ **Habit tracking** - Daily habits and goals
- ✅ **SSR tracking** - Start, Stop, Reflect moments

---

## Need Help?

- 📖 **Detailed Instructions**: See `BUILD_AND_INSTALL.md`
- 🐛 **Issues**: Check the error messages - they usually tell you what's wrong
- 📱 **Installation Guide**: See the "Installation on Your Phone" section in `BUILD_AND_INSTALL.md`

---

## Build Output

After a successful build, you'll see:

```
════════════════════════════════════════════════════════════
   ✓ APK BUILD SUCCESSFUL!
════════════════════════════════════════════════════════════

APK Location:
  /path/to/The-9th-Character-/android/app/build/outputs/apk/debug/app-debug.apk

APK Size: 15M

Next Steps:
  1. Transfer the APK to your Android phone
  2. Enable 'Install from Unknown Sources' in Android settings
  3. Tap the APK file to install
  4. Open the app and grant notification permissions
```

Happy building! 🚀
