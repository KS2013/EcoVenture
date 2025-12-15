import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecoquest.app',
  appName: 'EcoQuest',
  webDir: 'app',
  android: {
    allowMixedContent: true
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
