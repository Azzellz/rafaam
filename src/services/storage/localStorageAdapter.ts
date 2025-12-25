import { IStorage } from "./types";

const hasWindow = typeof window !== "undefined";

const hasLocalStorageSupport = (): boolean =>
    hasWindow && typeof window.localStorage !== "undefined";

export class LocalStorageAdapter implements IStorage {
    async get<T>(key: string): Promise<T | null> {
        if (!hasLocalStorageSupport()) {
            return null;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : null;
        } catch (error) {
            console.error(`Failed to get ${key} from localStorage`, error);
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        if (!hasLocalStorageSupport()) {
            throw new Error("localStorage not supported");
        }

        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to set ${key} in localStorage`, error);
            throw error;
        }
    }

    async remove(key: string): Promise<void> {
        if (!hasLocalStorageSupport()) {
            return;
        }

        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove ${key} from localStorage`, error);
        }
    }

    async clear(): Promise<void> {
        if (!hasLocalStorageSupport()) {
            return;
        }

        try {
            window.localStorage.clear();
        } catch (error) {
            console.error("Failed to clear localStorage", error);
        }
    }
}
