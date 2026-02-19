/**
 * Settings store - Persisted app settings with Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  reset: () => void;
}

const initialState = {
  theme: 'system' as ThemeMode,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setTheme: (theme) => set({ theme }),
      reset: () => set(initialState),
    }),
    {
      name: 'starter-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
