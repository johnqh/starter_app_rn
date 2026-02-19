/**
 * App constants
 */

export const APP_NAME = 'Starter App';

// Default language
export const DEFAULT_LANGUAGE = 'en';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  'en', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'sv', 'th', 'uk', 'vi', 'zh', 'zh-Hant',
];

// Storage keys
export const STORAGE_KEYS = {
  LANGUAGE: '@starter/language',
  SETTINGS: '@starter/settings',
} as const;

// Tab names
export const TAB_NAMES = {
  HISTORIES: 'HistoriesTab',
  SETTINGS: 'SettingsTab',
} as const;
