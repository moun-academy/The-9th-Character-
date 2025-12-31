@echo off
REM ###############################################################################
REM The 9th Character - Android APK Build Script (Windows)
REM This script automates the complete build process for the native Android app
REM ###############################################################################

setlocal enabledelayedexpansion

echo ================================================================
echo    The 9th Character - Android APK Build Script
echo ================================================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM ###############################################################################
REM Step 1: Check Prerequisites
REM ###############################################################################
echo.
echo Step 1/6: Checking Prerequisites
echo ----------------------------------------------------------------

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js installed: %NODE_VERSION%

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    echo Please install npm (usually comes with Node.js)
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm installed: %NPM_VERSION%

REM Check Java/JDK
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java/JDK is not installed!
    echo Please install JDK 17 or higher from: https://adoptium.net/
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
echo [OK] Java installed: %JAVA_VERSION%

REM Check for ANDROID_HOME or ANDROID_SDK_ROOT
if "%ANDROID_HOME%"=="" (
    if "%ANDROID_SDK_ROOT%"=="" (
        echo [WARNING] ANDROID_HOME or ANDROID_SDK_ROOT not set
        echo [WARNING] The build will attempt to download required SDK components
        echo [WARNING] This may take some time on first run
    ) else (
        echo [OK] ANDROID_SDK_ROOT: %ANDROID_SDK_ROOT%
    )
) else (
    echo [OK] ANDROID_HOME: %ANDROID_HOME%
)

REM ###############################################################################
REM Step 2: Install Node Dependencies
REM ###############################################################################
echo.
echo Step 2/6: Installing Node Dependencies
echo ----------------------------------------------------------------

if exist "package-lock.json" (
    call npm ci
) else (
    call npm install
)
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed

REM ###############################################################################
REM Step 3: Build Web Assets
REM ###############################################################################
echo.
echo Step 3/6: Building Web Assets with Vite
echo ----------------------------------------------------------------

call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [OK] Web assets built successfully

REM Check if dist directory was created
if not exist "dist" (
    echo [ERROR] Build failed - dist directory not created
    exit /b 1
)

REM ###############################################################################
REM Step 4: Sync to Android
REM ###############################################################################
echo.
echo Step 4/6: Syncing Assets to Android
echo ----------------------------------------------------------------

call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Failed to sync assets to Android
    exit /b 1
)
echo [OK] Assets synced to Android project

REM ###############################################################################
REM Step 5: Build APK
REM ###############################################################################
echo.
echo Step 5/6: Building Android APK
echo ----------------------------------------------------------------

cd android

echo Building debug APK (this may take a few minutes)...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [ERROR] APK build failed
    cd ..
    exit /b 1
)

cd ..

echo [OK] APK built successfully!

REM ###############################################################################
REM Step 6: Locate APK
REM ###############################################################################
echo.
echo Step 6/6: Build Complete!
echo ----------------------------------------------------------------

set APK_PATH=%SCRIPT_DIR%android\app\build\outputs\apk\debug\app-debug.apk

if exist "%APK_PATH%" (
    for %%A in ("%APK_PATH%") do set APK_SIZE=%%~zA
    set /a APK_SIZE_MB=!APK_SIZE! / 1048576

    echo.
    echo ================================================================
    echo    APK BUILD SUCCESSFUL!
    echo ================================================================
    echo.
    echo APK Location:
    echo   %APK_PATH%
    echo.
    echo APK Size: ~!APK_SIZE_MB! MB
    echo.
    echo Next Steps:
    echo   1. Transfer the APK to your Android phone
    echo   2. Enable 'Install from Unknown Sources' in Android settings
    echo   3. Tap the APK file to install
    echo   4. Open the app and grant notification permissions
    echo.
    echo Installation Methods:
    echo   * USB: adb install "%APK_PATH%"
    echo   * Email: Attach the APK file and send to yourself
    echo   * Cloud: Upload to Google Drive/Dropbox and download on phone
    echo.
    echo See BUILD_AND_INSTALL.md for detailed installation instructions
    echo.
) else (
    echo [ERROR] APK file not found at expected location!
    echo Expected: %APK_PATH%
    echo.
    echo Build may have failed. Check the output above for errors.
    exit /b 1
)

endlocal
