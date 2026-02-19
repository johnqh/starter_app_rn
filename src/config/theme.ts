/**
 * Theme configuration
 * Colors matching the web app
 */

export const colors = {
  // Primary brand color (blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic colors
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// React Navigation Theme type
import type { Theme } from '@react-navigation/native';

export const lightTheme: Theme = {
  dark: false,
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
  colors: {
    primary: colors.primary[600],
    background: colors.gray[50],
    card: '#ffffff',
    text: colors.gray[900],
    border: colors.gray[200],
    notification: colors.error,
  },
};

export const darkTheme: Theme = {
  dark: true,
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
  colors: {
    primary: colors.primary[400],
    background: colors.gray[900],
    card: colors.gray[800],
    text: colors.gray[50],
    border: colors.gray[700],
    notification: colors.error,
  },
};

/** Extended semantic colors beyond React Navigation's built-in set */
export interface AppColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  border: string;
  error: string;
  shadow: string;
}

export const lightAppColors: AppColors = {
  background: colors.gray[50],
  card: '#ffffff',
  text: colors.gray[900],
  textSecondary: colors.gray[600],
  textMuted: colors.gray[400],
  primary: colors.primary[600],
  border: colors.gray[200],
  error: '#dc2626',
  shadow: '#000000',
};

export const darkAppColors: AppColors = {
  background: colors.gray[900],
  card: colors.gray[800],
  text: colors.gray[50],
  textSecondary: colors.gray[400],
  textMuted: colors.gray[500],
  primary: colors.primary[400],
  border: colors.gray[700],
  error: '#f87171',
  shadow: '#000000',
};
