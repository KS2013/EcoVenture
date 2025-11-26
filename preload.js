const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // User data
  getUserId: () => ipcRenderer.invoke('get-user-id'),
  getUserData: () => ipcRenderer.invoke('get-user-data'),
  updateUserData: (data) => ipcRenderer.invoke('update-user-data', data),

  // Points system
  awardPoints: (pointsData) => ipcRenderer.invoke('award-points', pointsData),

  // Rewards
  getRewards: () => ipcRenderer.invoke('get-rewards'),
  redeemReward: (rewardData) => ipcRenderer.invoke('redeem-reward', rewardData),

  // Platform info
  platform: process.platform
});
