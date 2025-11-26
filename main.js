const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let mainWindow;
let store;

// Initialize store after app is ready
function initStore() {
  const Store = require('electron-store');
  store = new Store();

  // Initialize user if not exists
  if (!store.get('userId')) {
    store.set('userId', `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }

  if (!store.get('userData')) {
    store.set('userData', {
      totalPoints: 0,
      lifetimePoints: 0,
      submissions: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastSubmission: null,
      redemptionHistory: []
    });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 850,
    minWidth: 360,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    backgroundColor: '#0F172A',
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  // Open DevTools in dev mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize store
  initStore();

  // Grant camera and microphone permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'mediaKeySystem', 'geolocation'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers

ipcMain.handle('get-user-id', () => {
  return store.get('userId');
});

ipcMain.handle('get-user-data', () => {
  return store.get('userData');
});

ipcMain.handle('update-user-data', (event, data) => {
  const current = store.get('userData');
  const updated = { ...current, ...data };
  store.set('userData', updated);
  return updated;
});

ipcMain.handle('award-points', (event, { points }) => {
  const userData = store.get('userData');
  const now = new Date();

  let newStreak = 1;
  if (userData.lastSubmission) {
    const lastDate = new Date(userData.lastSubmission);
    const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      newStreak = userData.currentStreak + 1;
    } else if (daysDiff === 0) {
      newStreak = userData.currentStreak;
    }
  }

  const updated = {
    ...userData,
    totalPoints: userData.totalPoints + points,
    lifetimePoints: userData.lifetimePoints + points,
    submissions: userData.submissions + 1,
    currentStreak: newStreak,
    longestStreak: Math.max(userData.longestStreak, newStreak),
    lastSubmission: now.toISOString()
  };

  store.set('userData', updated);
  return updated;
});

ipcMain.handle('redeem-reward', (event, { rewardId, pointsCost }) => {
  const userData = store.get('userData');

  if (userData.totalPoints < pointsCost) {
    return { success: false, error: 'Insufficient points' };
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const redemption = {
    id: uuidv4(),
    rewardId,
    code,
    redeemedAt: new Date().toISOString()
  };

  const updated = {
    ...userData,
    totalPoints: userData.totalPoints - pointsCost,
    redemptionHistory: [...userData.redemptionHistory, redemption]
  };

  store.set('userData', updated);

  return {
    success: true,
    code,
    remainingPoints: updated.totalPoints
  };
});

ipcMain.handle('get-rewards', () => {
  return [
    { id: 'amazon_5', name: 'Amazon Gift Card', value: '$5', pointsCost: 500, description: '$5 Amazon.com Gift Card', category: 'gift_card', image: '🛒' },
    { id: 'amazon_10', name: 'Amazon Gift Card', value: '$10', pointsCost: 950, description: '$10 Amazon.com Gift Card', category: 'gift_card', image: '🛒' },
    { id: 'starbucks_5', name: 'Starbucks Gift Card', value: '$5', pointsCost: 500, description: '$5 Starbucks Gift Card', category: 'gift_card', image: '☕' },
    { id: 'target_10', name: 'Target Gift Card', value: '$10', pointsCost: 950, description: '$10 Target Gift Card', category: 'gift_card', image: '🎯' },
    { id: 'donation_trees', name: 'Plant Trees', value: '5 Trees', pointsCost: 300, description: 'Donate to plant 5 trees', category: 'donation', image: '🌳' },
    { id: 'donation_ocean', name: 'Ocean Cleanup', value: '1 lb', pointsCost: 250, description: 'Remove 1 pound of trash from the ocean', category: 'donation', image: '🌊' }
  ];
});
