/**
 * Storage Adapters
 * IndexedDB 和 LocalStorage 的适配器实现
 */

import { IStorage } from "./types";

// ==================== 环境检测 ====================

const hasWindow = typeof window !== "undefined";

export const hasIndexedDBSupport = (): boolean =>
    hasWindow && typeof window.indexedDB !== "undefined";

export const hasLocalStorageSupport = (): boolean =>
    hasWindow && typeof window.localStorage !== "undefined";

// ==================== IndexedDB Adapter ====================

const DB_NAME = "rafaam_storage";
const DB_VERSION = 1;
const STORE_NAME = "keyValueStore";

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
                const tx = db.transaction(STORE_NAME, "readonly");
                const store = tx.objectStore(STORE_NAME);
                const request = store.get(key);

                request.onsuccess = () => {
                    const value = request.result;
                    resolve(value !== undefined ? (value as T) : null);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`[IndexedDB] Failed to get "${key}"`, error);
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.put(value, key);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async remove(key: string): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                store.delete(key);

                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch (error) {
            console.error(`[IndexedDB] Failed to remove "${key}"`, error);
        }
    }

    async clear(): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                store.clear();

                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch (error) {
            console.error("[IndexedDB] Failed to clear", error);
        }
    }
}

// ==================== LocalStorage Adapter ====================

export class LocalStorageAdapter implements IStorage {
    async get<T>(key: string): Promise<T | null> {
        if (!hasLocalStorageSupport()) return null;

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : null;
        } catch (error) {
            console.error(`[LocalStorage] Failed to get "${key}"`, error);
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        if (!hasLocalStorageSupport()) {
            throw new Error("localStorage not supported");
        }
        window.localStorage.setItem(key, JSON.stringify(value));
    }

    async remove(key: string): Promise<void> {
        if (!hasLocalStorageSupport()) return;

        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`[LocalStorage] Failed to remove "${key}"`, error);
        }
    }

    async clear(): Promise<void> {
        if (!hasLocalStorageSupport()) return;

        try {
            // 只清除 rafaam_ 前缀的键
            const keys = Object.keys(window.localStorage).filter((k) =>
                k.startsWith("rafaam_")
            );
            keys.forEach((k) => window.localStorage.removeItem(k));
        } catch (error) {
            console.error("[LocalStorage] Failed to clear", error);
        }
    }
}
