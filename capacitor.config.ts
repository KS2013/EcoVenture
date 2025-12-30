import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecoventure.app',
  appName: 'EcoVenture',
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
