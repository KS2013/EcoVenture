# EcoVenture

**Turn Trash Into Rewards** - A cross-platform app that rewards you for cleaning up litter in public places.

## Features

- **Video Recording** - Record yourself picking up and disposing of litter
- **Multi-Model AI Detection** - Real-time litter detection using:
  - TensorFlow.js COCO-SSD (local, offline)
  - MobileNet for enhanced classification
  - TACO dataset categories for specialized trash detection
- **Location Verification** - Ensures you're in a public place (park, street, beach, etc.)
- **Points System** - Earn points for verified litter disposal
- **Gift Card Rewards** - Redeem points for Amazon, Starbucks, Target, and more
- **Organized Cleanups** - Join community cleanup events with RSVP and check-in
- **Cloud Sync** - Supabase backend for user data persistence
- **Cross-Platform** - Desktop (Windows, Mac, Linux) and Android

## Quick Start

### Prerequisites

- Node.js 18+
- Android Studio (for Android builds)

### Installation

```bash
# Install dependencies
npm install

# Run the Electron app
npm start

# Run in dev mode (with DevTools)
npm run dev
```

### Building

```bash
# Build for Windows
npm run build:win

# Build for Mac
npm run build:mac

# Build for Linux
npm run build:linux

# Build for all platforms
npm run build
```

### Android

```bash
# Sync Capacitor
npm run android:sync

# Open in Android Studio
npm run android:open

# Run on device/emulator
npm run android:run
```

## How It Works

1. **Open the app** on your device
2. **Allow camera and location access**
3. **Go to a public place** (park, beach, street, etc.)
4. **Enable live detection** to see AI recognizing litter
5. **Record yourself** picking up litter and disposing of it
6. **Submit for verification** - AI analyzes your recording
7. **Earn points** and redeem for gift cards!

## Points System

| Action | Points |
|--------|--------|
| Verified disposal | 50 pts |
| High confidence (>80%) | +20 pts |
| Multiple items | +10 pts each |
| Daily streak | +25 pts x days |
| First submission | +100 pts |

## Available Rewards

- $5 Gift Card - 5000 pts
- $10 Gift Card - 9500 pts


## Tech Stack

- **Desktop**: Electron
- **Mobile**: Capacitor (Android)
- **AI/ML**: TensorFlow.js COCO-SSD, MobileNet
- **Backend**: Supabase
- **Frontend**: Vanilla JS, CSS3, HTML5
- **Storage**: electron-store (desktop), Supabase (cloud)
- **APIs**: OpenStreetMap Nominatim for geocoding

## Project Structure

```
ecoventure/
├── main.js              # Electron main process
├── preload.js           # Secure bridge between main and renderer
├── capacitor.config.ts  # Capacitor configuration
├── app/
│   ├── index.html       # Main HTML
│   ├── styles.css       # Responsive styles
│   ├── app.js           # Frontend logic with AI detection
│   ├── supabase.js      # Supabase client
│   └── js/              # Modular JS files
│       ├── auth.js      # Authentication
│       ├── camera.js    # Camera handling
│       ├── cleanups.js  # Organized cleanups
│       ├── detection.js # AI detection
│       ├── friends.js   # Social features
│       ├── leaderboard.js
│       ├── rewards.js   # Rewards system
│       └── ui.js        # UI utilities
├── android/             # Android project (Capacitor)
├── assets/              # App icons
└── dist/                # Built executables
```

## AI Detection

The app uses multiple AI models for robust trash detection:

- **COCO-SSD**: Detects 80+ object classes including bottles, cups, food items
- **MobileNet**: Additional classification for confidence boosting
- **TACO Categories**: 60+ specialized trash categories (plastic bags, cigarettes, cans, etc.)

All detection runs locally on your device - no server required.

## License

MIT
