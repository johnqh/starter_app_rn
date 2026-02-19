/**
 * Minimal in-memory localStorage polyfill for React Native.
 *
 * Zustand's persist middleware defaults to `createJSONStorage(() => localStorage)`.
 * When localStorage is missing (React Native), createJSONStorage returns undefined,
 * and the persist middleware skips setting up `api.persist` entirely — making
 * `.persist.setOptions()` / `.rehydrate()` unavailable.
 *
 * This polyfill provides a no-op in-memory shim so the middleware initialises
 * correctly. We immediately swap to AsyncStorage via settingsStore.
 */

if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
}
