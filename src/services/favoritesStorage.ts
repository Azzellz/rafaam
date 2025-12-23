import { GrammarPoint } from "@/types";

export type FavoriteStorageStrategy = "indexedDB" | "localStorage";

const DB_NAME = "rafaam_client_store";
const DB_VERSION = 1;
const STORE_NAME = "favorites";
const LOCAL_STORAGE_KEY = "rafaam_favorites_fallback";
const FALLBACK_LOG =
    "IndexedDB is unavailable; falling back to localStorage for favorites.";

const hasWindow = typeof window !== "undefined";

const hasIndexedDBSupport = (): boolean =>
    hasWindow && typeof window.indexedDB !== "undefined";

const hasLocalStorageSupport = (): boolean =>
    hasWindow && typeof window.localStorage !== "undefined";

const readLocalFavorites = (): GrammarPoint[] => {
    if (!hasLocalStorageSupport()) {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as GrammarPoint[]) : [];
    } catch (error) {
        console.error("Failed to read favorites from localStorage", error);
        return [];
    }
};

const writeLocalFavorites = (favorites: GrammarPoint[]): void => {
    if (!hasLocalStorageSupport()) {
        return;
    }
    try {
        window.localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(favorites)
        );
    } catch (error) {
        console.error("Failed to write favorites to localStorage", error);
    }
};

const upsertLocalFavorite = (point: GrammarPoint): void => {
    const favorites = readLocalFavorites();
    const existingIndex = favorites.findIndex(
        (item) => item.pattern === point.pattern
    );
    if (existingIndex >= 0) {
        favorites[existingIndex] = point;
    } else {
        favorites.push(point);
    }
    writeLocalFavorites(favorites);
};

const removeLocalFavorite = (pattern: string): void => {
    const favorites = readLocalFavorites().filter(
        (item) => item.pattern !== pattern
    );
    writeLocalFavorites(favorites);
};

class FavoritesStorageManager {
    public strategy: FavoriteStorageStrategy = "indexedDB";
    private dbPromise: Promise<IDBDatabase> | null = null;

    private openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (!hasIndexedDBSupport()) {
                reject(new Error("IndexedDB not supported"));
                return;
            }

            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: "pattern" });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    private async ensureDB(): Promise<IDBDatabase | null> {
        if (this.strategy === "localStorage") {
            return null;
        }

        if (!hasIndexedDBSupport()) {
            console.warn(FALLBACK_LOG);
            this.strategy = "localStorage";
            return null;
        }

        if (!this.dbPromise) {
            this.dbPromise = this.openDB();
        }

        try {
            return await this.dbPromise;
        } catch (error) {
            console.error("IndexedDB initialization failed", error);
            this.dbPromise = null;
            this.strategy = "localStorage";
            return null;
        }
    }

    private getAllFromIndexedDB(db: IDBDatabase): Promise<GrammarPoint[]> {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result as GrammarPoint[]);
            request.onerror = () => reject(request.error);
        });
    }

    private addToIndexedDB(
        db: IDBDatabase,
        point: GrammarPoint
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            store.put(point);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    private removeFromIndexedDB(
        db: IDBDatabase,
        pattern: string
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            store.delete(pattern);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    public async getAll(): Promise<GrammarPoint[]> {
        const db = await this.ensureDB();
        if (db) {
            try {
                return await this.getAllFromIndexedDB(db);
            } catch (error) {
                console.error("Failed to read favorites from IndexedDB", error);
                this.strategy = "localStorage";
            }
        }
        return readLocalFavorites();
    }

    public async add(point: GrammarPoint): Promise<void> {
        const db = await this.ensureDB();
        if (db) {
            try {
                await this.addToIndexedDB(db, point);
                return;
            } catch (error) {
                console.error("Failed to add favorite to IndexedDB", error);
                this.strategy = "localStorage";
            }
        }
        upsertLocalFavorite(point);
    }

    public async remove(pattern: string): Promise<void> {
        const db = await this.ensureDB();
        if (db) {
            try {
                await this.removeFromIndexedDB(db, pattern);
                return;
            } catch (error) {
                console.error(
                    "Failed to remove favorite from IndexedDB",
                    error
                );
                this.strategy = "localStorage";
            }
        }
        removeLocalFavorite(pattern);
    }
}

export const favoritesStorageManager = new FavoritesStorageManager();
