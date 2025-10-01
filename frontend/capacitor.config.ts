import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hundredgram.messenger',
  appName: '100GRAM',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: process.env.NEXT_PUBLIC_API_URL?.replace(':3001', ':5000') || 'http://localhost:5000',
    cleartext: true
  }
};

export default config;
