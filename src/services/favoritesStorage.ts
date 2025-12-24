import { GrammarPoint, PracticeLanguage } from "@/types";
import { DEFAULT_PRACTICE_LANGUAGE } from "@/constants/practiceLanguages";

export type FavoriteStorageStrategy = "indexedDB" | "localStorage";

const DB_NAME = "rafaam_client_store";
const DB_VERSION = 2; // Upgraded version
const STORE_NAME_V1 = "favorites";
const STORE_NAME_V2 = "favorites_v2";
const LOCAL_STORAGE_PREFIX = "rafaam_favorites_";
const FALLBACK_LOG =
    "IndexedDB is unavailable; falling back to localStorage for favorites.";

const hasWindow = typeof window !== "undefined";

const hasIndexedDBSupport = (): boolean =>
    hasWindow && typeof window.indexedDB !== "undefined";

const hasLocalStorageSupport = (): boolean =>
    hasWindow && typeof window.localStorage !== "undefined";

const getLocalStorageKey = (language: PracticeLanguage) =>
    `${LOCAL_STORAGE_PREFIX}${language}`;

const readLocalFavorites = (language: PracticeLanguage): GrammarPoint[] => {
    if (!hasLocalStorageSupport()) {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(getLocalStorageKey(language));
        return raw ? (JSON.parse(raw) as GrammarPoint[]) : [];
    } catch (error) {
        console.error("Failed to read favorites from localStorage", error);
        return [];
    }
};

const writeLocalFavorites = (
    language: PracticeLanguage,
    favorites: GrammarPoint[]
): void => {
    if (!hasLocalStorageSupport()) {
        return;
    }
    try {
        window.localStorage.setItem(
            getLocalStorageKey(language),
            JSON.stringify(favorites)
        );
    } catch (error) {
        console.error("Failed to write favorites to localStorage", error);
    }
};

const upsertLocalFavorite = (point: GrammarPoint): void => {
    const lang = point.practiceLanguage ?? DEFAULT_PRACTICE_LANGUAGE;
    const favorites = readLocalFavorites(lang);
    const existingIndex = favorites.findIndex(
        (item) => item.pattern === point.pattern
    );
    if (existingIndex >= 0) {
        favorites[existingIndex] = point;
    } else {
        favorites.push(point);
    }
    writeLocalFavorites(lang, favorites);
};

const removeLocalFavorite = (
    pattern: string,
    language: PracticeLanguage
): void => {
    const favorites = readLocalFavorites(language).filter(
        (item) => item.pattern !== pattern
    );
    writeLocalFavorites(language, favorites);
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

            request.onupgradeneeded = (event) => {
                const db = request.result;
                const transaction = request.transaction;

                // Migration from V1 to V2
                if (event.oldVersion < 2) {
                    // Create V2 store with composite key
                    if (!db.objectStoreNames.contains(STORE_NAME_V2)) {
                        const storeV2 = db.createObjectStore(STORE_NAME_V2, {
                            keyPath: ["practiceLanguage", "pattern"],
                        });
                        storeV2.createIndex(
                            "practiceLanguage",
                            "practiceLanguage",
                            {
                                unique: false,
                            }
                        );
                    }

                    // Migrate data if V1 exists
                    if (
                        db.objectStoreNames.contains(STORE_NAME_V1) &&
                        transaction
                    ) {
                        const storeV1 = transaction.objectStore(STORE_NAME_V1);
                        const getAllRequest = storeV1.getAll();

                        getAllRequest.onsuccess = () => {
                            const items =
                                getAllRequest.result as GrammarPoint[];
                            const storeV2 =
                                transaction.objectStore(STORE_NAME_V2);
                            items.forEach((item) => {
                                // Assign default language if missing (migration strategy)
                                const migratedItem = {
                                    ...item,
                                    practiceLanguage:
                                        item.practiceLanguage ??
                                        DEFAULT_PRACTICE_LANGUAGE,
                                };
                                storeV2.put(migratedItem);
                            });
                            // Optional: db.deleteObjectStore(STORE_NAME_V1);
                            // Keeping it for safety or deleting it later
                        };
                    }
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

    private getAllFromIndexedDB(
        db: IDBDatabase,
        language?: PracticeLanguage
    ): Promise<GrammarPoint[]> {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME_V2, "readonly");
            const store = transaction.objectStore(STORE_NAME_V2);

            let request: IDBRequest;

            if (language) {
                const index = store.index("practiceLanguage");
                request = index.getAll(IDBKeyRange.only(language));
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => resolve(request.result as GrammarPoint[]);
            request.onerror = () => reject(request.error);
        });
    }

    private addToIndexedDB(
        db: IDBDatabase,
        point: GrammarPoint
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME_V2, "readwrite");
            const store = transaction.objectStore(STORE_NAME_V2);

            // Ensure practiceLanguage is set
            const itemToSave = {
                ...point,
                practiceLanguage:
                    point.practiceLanguage ?? DEFAULT_PRACTICE_LANGUAGE,
            };

            store.put(itemToSave);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    private removeFromIndexedDB(
        db: IDBDatabase,
        pattern: string,
        language: PracticeLanguage
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME_V2, "readwrite");
            const store = transaction.objectStore(STORE_NAME_V2);
            // Key is composite: [language, pattern]
            store.delete([language, pattern]);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    public async getAll(language?: PracticeLanguage): Promise<GrammarPoint[]> {
        const db = await this.ensureDB();
        if (db) {
            try {
                return await this.getAllFromIndexedDB(db, language);
            } catch (error) {
                console.error("Failed to read favorites from IndexedDB", error);
                this.strategy = "localStorage";
            }
        }

        if (language) {
            return readLocalFavorites(language);
        } else {
            // If no language specified, we might want to aggregate all local storage keys
            // But for simplicity and current requirements, we might just return empty or handle it if needed.
            // For now, let's just return the default language ones or implement aggregation if requested.
            // Given the requirement "independent storage space", aggregation might be expensive.
            // Let's return default language as fallback or empty.
            return readLocalFavorites(DEFAULT_PRACTICE_LANGUAGE);
        }
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

    public async remove(
        pattern: string,
        language: PracticeLanguage
    ): Promise<void> {
        const db = await this.ensureDB();
        if (db) {
            try {
                await this.removeFromIndexedDB(db, pattern, language);
                return;
            } catch (error) {
                console.error(
                    "Failed to remove favorite from IndexedDB",
                    error
                );
                this.strategy = "localStorage";
            }
        }
        removeLocalFavorite(pattern, language);
    }
}

export const favoritesStorageManager = new FavoritesStorageManager();
