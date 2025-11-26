# 🗑️ Litteryl

**Turn Trash Into Rewards** - A desktop and mobile app that rewards you for cleaning up litter in public places.

## Features

- 📹 **Video Recording** - Record yourself picking up and disposing of litter
- 🤖 **Real-Time AI Detection** - Live litter detection using TensorFlow.js COCO-SSD model
- 📍 **Location Verification** - Ensures you're in a public place (park, street, beach, etc.)
- 🏆 **Points System** - Earn points for verified litter disposal
- 🎁 **Gift Card Rewards** - Redeem points for Amazon, Starbucks, Target, and more
- 💾 **Persistent Storage** - Your progress is saved locally
- 📱 **Cross-Platform** - Works on Windows, Mac, and Linux

## Quick Start

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
# Install dependencies
npm install

# Run the app
npm start

# Run in dev mode (with DevTools)
npm run dev
```

### Building for Distribution

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

## How It Works

1. **Open the app** on your computer
2. **Allow camera and location access**
3. **Go to a public place** (park, beach, street, etc.)
4. **Enable live detection** to see AI recognizing objects
5. **Record yourself** picking up litter and disposing of it
6. **Submit for verification** - AI analyzes your recording
7. **Earn points** and redeem for gift cards!

## Points System

| Action | Points |
|--------|--------|
| Verified disposal | 50 pts |
| High confidence (>80%) | +20 pts |
| Multiple items | +10 pts each |
| Daily streak | +25 pts × days |
| First submission | +100 pts |

## Available Rewards

- $5 Amazon Gift Card - 500 pts
- $10 Amazon Gift Card - 950 pts
- $5 Starbucks Gift Card - 500 pts
- $10 Target Gift Card - 950 pts
- Plant 5 Trees - 300 pts
- Ocean Cleanup (1 lb) - 250 pts
- And more!

## Tech Stack

- **Desktop**: Electron
- **AI/ML**: TensorFlow.js COCO-SSD (browser-based, no Python needed!)
- **Frontend**: Vanilla JS, CSS3, HTML5
- **Storage**: electron-store (persistent local storage)
- **APIs**: OpenStreetMap Nominatim for geocoding

## Project Structure

```
litteryl/
├── main.js           # Electron main process
├── preload.js        # Secure bridge between main and renderer
├── app/
│   ├── index.html    # Main HTML
│   ├── styles.css    # Responsive styles
│   └── app.js        # Frontend logic with AI detection
├── assets/           # App icons
└── dist/             # Built executables (after build)
```

## AI Detection

The app uses TensorFlow.js COCO-SSD model running directly in the browser:
- **No server needed** - AI runs locally on your device
- **Real-time detection** - See bounding boxes around detected objects
- **Litter classes** - Detects bottles, cups, food items, and more

## Notes

- Camera and microphone permissions are automatically granted
- Location is verified using OpenStreetMap (free, no API key)
- Points and user data persist between sessions
- Gift card codes are demo codes (integrate with real API for production)

## License

MIT
