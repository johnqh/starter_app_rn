/**
 * i18n Configuration for Starter App
 *
 * Simple i18next setup with embedded translations.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPPORTED_LANGUAGES = [
  'en', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'sv', 'th', 'uk', 'vi', 'zh', 'zh-Hant',
] as const;

const LANGUAGE_STORAGE_KEY = '@starter/language';

// Embedded translations
const resources = {
  en: {
    translation: {
      common: {
        loading: 'Loading...',
        error: 'Error',
        cancel: 'Cancel',
        delete: 'Delete',
        back: 'Back',
        or: 'or',
      },
      histories: {
        title: 'Histories',
        loginPrompt: 'Sign in to view and manage your histories.',
        add: 'Add History',
        create: 'Create',
        empty: 'No histories yet. Add your first one!',
        detail: 'History Detail',
        notFound: 'History not found.',
        datetime: 'Date & Time',
        value: 'Value',
        createdAt: 'Created At',
        yourTotal: 'Your Total',
        globalTotal: 'Global Total',
        percentage: 'Your Share',
        deleteConfirm: 'Are you sure you want to delete this history?',
      },
      settings: {
        title: 'Settings',
        appearance: 'Appearance',
        theme: {
          label: 'Theme',
          system: 'System',
          light: 'Light',
          dark: 'Dark',
        },
        selectTheme: 'Select Theme',
        themeDescription: 'App color scheme',
        language: 'Language',
        languageDescription: 'Select your preferred language',
        account: 'Account',
        signInDescription: 'Sync data across devices',
        about: 'About',
        version: 'Version 1.0.0',
        copyright: '2024 Sudobility',
      },
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        signOutConfirm: 'Are you sure you want to sign out?',
        email: 'Email',
        password: 'Password',
        continueWithGoogle: 'Continue with Google',
        noAccount: "Don't have an account? Sign Up",
        hasAccount: 'Already have an account? Sign In',
        fillAllFields: 'Please fill in all fields',
        error: 'An error occurred',
        guest: 'Guest',
        signedIn: 'Signed In',
        createAccount: 'Create Account',
        createAccountDescription: 'Save your data and sync across devices',
      },
      tabs: {
        histories: 'Histories',
        settings: 'Settings',
      },
    },
  },
};

// Detect the best initial language
function getInitialLanguage(): string {
  try {
    const locales = getLocales();
    if (locales.length > 0) {
      const deviceLang = locales[0].languageCode;
      if (SUPPORTED_LANGUAGES.includes(deviceLang as any)) {
        return deviceLang;
      }
    }
  } catch {
    // Fallback to English
  }
  return 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

/**
 * Load stored language preference from AsyncStorage and apply it.
 * Called once at app startup.
 */
export async function loadStoredLanguagePreference(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as any)) {
      await i18n.changeLanguage(stored);
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Change language and persist the preference.
 */
export async function changeLanguage(lang: string): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Ignore errors
  }
}

export default i18n;
