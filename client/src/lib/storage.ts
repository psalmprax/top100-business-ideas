/**
 * Simple namespaced localStorage utility for Alpha Sentinel
 */

const PREFIX = 'alpha_sentinel_';

export const storage = {
    set: (key: string, value: any) => {
        try {
            window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to storage', e);
        }
    },
    get: <T>(key: string, defaultValue: T): T => {
        try {
            const item = window.localStorage.getItem(`${PREFIX}${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from storage', e);
            return defaultValue;
        }
    },
    remove: (key: string) => {
        window.localStorage.removeItem(`${PREFIX}${key}`);
    },
    clearAll: () => {
        Object.keys(window.localStorage)
            .filter(key => key.startsWith(PREFIX))
            .forEach(key => window.localStorage.removeItem(key));
    }
};
