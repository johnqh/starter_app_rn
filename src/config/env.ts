/**
 * Environment configuration
 *
 * Uses react-native-config which reads from .env files.
 */

import Config from 'react-native-config';

const getEnv = (key: string, defaultValue: string = ''): string => {
  return (Config as Record<string, string | undefined>)[key] ?? defaultValue;
};

export const env = {
  // API URL
  API_URL: getEnv('EXPO_PUBLIC_API_URL', 'http://localhost:3001'),

  // Firebase
  FIREBASE_API_KEY: getEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  FIREBASE_AUTH_DOMAIN: getEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  FIREBASE_PROJECT_ID: getEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  FIREBASE_STORAGE_BUCKET: getEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  FIREBASE_MESSAGING_SENDER_ID: getEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  FIREBASE_APP_ID: getEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),

  // Development
  DEV_MODE: getEnv('EXPO_PUBLIC_DEV_MODE', 'false') === 'true',
};
