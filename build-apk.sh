#!/bin/bash

###############################################################################
# The 9th Character - Android APK Build Script
# This script automates the complete build process for the native Android app
###############################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   The 9th Character - Android APK Build Script${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to print step headers
print_step() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────────────────────${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

###############################################################################
# Step 1: Check Prerequisites
###############################################################################
print_step "Step 1/6: Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js installed: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm installed: $NPM_VERSION"

# Check Java/JDK
if ! command -v java &> /dev/null; then
    print_error "Java/JDK is not installed!"
    echo "Please install JDK 17 or higher from: https://adoptium.net/"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -1)
print_success "Java installed: $JAVA_VERSION"

# Check for ANDROID_HOME or ANDROID_SDK_ROOT
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    print_warning "ANDROID_HOME or ANDROID_SDK_ROOT not set"
    print_warning "The build will attempt to download required SDK components"
    print_warning "This may take some time on first run"
else
    if [ ! -z "$ANDROID_HOME" ]; then
        print_success "ANDROID_HOME: $ANDROID_HOME"
    else
        print_success "ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
    fi
fi

###############################################################################
# Step 2: Install Node Dependencies
###############################################################################
print_step "Step 2/6: Installing Node Dependencies"

if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
print_success "Dependencies installed"

###############################################################################
# Step 3: Build Web Assets
###############################################################################
print_step "Step 3/6: Building Web Assets with Vite"

npm run build
print_success "Web assets built successfully"

# Check if dist directory was created
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not created"
    exit 1
fi

###############################################################################
# Step 4: Sync to Android
###############################################################################
print_step "Step 4/6: Syncing Assets to Android"

npx cap sync android
print_success "Assets synced to Android project"

###############################################################################
# Step 5: Build APK
###############################################################################
print_step "Step 5/6: Building Android APK"

cd android

# Make gradlew executable
chmod +x gradlew

# Build debug APK
echo "Building debug APK (this may take a few minutes)..."
./gradlew assembleDebug

cd ..

print_success "APK built successfully!"

###############################################################################
# Step 6: Locate APK
###############################################################################
print_step "Step 6/6: Build Complete!"

APK_PATH="$SCRIPT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   ✓ APK BUILD SUCCESSFUL!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}APK Location:${NC}"
    echo -e "  $APK_PATH"
    echo ""
    echo -e "${BLUE}APK Size:${NC} $APK_SIZE"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Transfer the APK to your Android phone"
    echo "  2. Enable 'Install from Unknown Sources' in Android settings"
    echo "  3. Tap the APK file to install"
    echo "  4. Open the app and grant notification permissions"
    echo ""
    echo -e "${BLUE}Installation Methods:${NC}"
    echo "  • USB: adb install $APK_PATH"
    echo "  • Email: Attach the APK file and send to yourself"
    echo "  • Cloud: Upload to Google Drive/Dropbox and download on phone"
    echo ""
    echo -e "See ${BLUE}BUILD_AND_INSTALL.md${NC} for detailed installation instructions"
    echo ""
else
    print_error "APK file not found at expected location!"
    echo "Expected: $APK_PATH"
    echo ""
    echo "Build may have failed. Check the output above for errors."
    exit 1
fi
