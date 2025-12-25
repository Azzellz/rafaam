import { IStorage } from "./types";

const DB_NAME = "rafaam_storage";
const DB_VERSION = 1;
const STORE_NAME = "keyValueStore";

const hasWindow = typeof window !== "undefined";

export const hasIndexedDBSupport = (): boolean =>
    hasWindow && typeof window.indexedDB !== "undefined";

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (!hasIndexedDBSupport()) {
            reject(new Error("IndexedDB not supported"));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export class IndexedDBAdapter implements IStorage {
    private dbPromise: Promise<IDBDatabase> | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (!this.dbPromise) {
            this.dbPromise = openDB();
        }
        return this.dbPromise;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, "readonly");
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(key);

                request.onsuccess = () => {
                    const value = request.result;
                    resolve(value !== undefined ? (value as T) : null);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`Failed to get ${key} from IndexedDB`, error);
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, "readwrite");
                const store = transaction.objectStore(STORE_NAME);
                store.put(value, key);

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (error) {
            console.error(`Failed to set ${key} in IndexedDB`, error);
            throw error;
        }
    }

    async remove(key: string): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, "readwrite");
                const store = transaction.objectStore(STORE_NAME);
                store.delete(key);

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (error) {
            console.error(`Failed to remove ${key} from IndexedDB`, error);
        }
    }

    async clear(): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, "readwrite");
                const store = transaction.objectStore(STORE_NAME);
                store.clear();

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (error) {
            console.error("Failed to clear IndexedDB", error);
        }
    }
}
