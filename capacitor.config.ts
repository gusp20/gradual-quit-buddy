import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.gradualquitbuddy',
  appName: 'gradual-quit-buddy',
  webDir: 'dist',
  server: {
    url: 'https://20972364-32c2-469c-9c78-789282ea65ff.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
