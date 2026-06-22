/**
 * Simple namespaced localStorage utility for Alpha Hecta
 */

const PREFIX = "alpha_hecta_";

export const storage = {
  set: (key: string, value: unknown) => {
    try {
      window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving to storage", e);
    }
  },
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(`${PREFIX}${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Error reading from storage", e);
      return defaultValue;
    }
  },
  remove: (key: string) => {
    try {
      window.localStorage.removeItem(`${PREFIX}${key}`);
    } catch (e) {
      console.error("Error removing from storage", e);
    }
  },
  clearAll: () => {
    try {
      Object.keys(window.localStorage)
        .filter(key => key.startsWith(PREFIX))
        .forEach(key => window.localStorage.removeItem(key));
    } catch (e) {
      console.error("Error clearing storage", e);
    }
  },
};
