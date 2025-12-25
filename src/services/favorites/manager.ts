import { GrammarPoint, PracticeLanguage } from "@/types";
import { DEFAULT_PRACTICE_LANGUAGE } from "@/constants/practiceLanguages";
import {
    hasIndexedDBSupport,
    openDB,
    getAllFromIndexedDB,
    addToIndexedDB,
    removeFromIndexedDB,
} from "./indexedDB";
import {
    readLocalFavorites,
    upsertLocalFavorite,
    removeLocalFavorite,
} from "./localStorage";

export type FavoriteStorageStrategy = "indexedDB" | "localStorage";

const FALLBACK_LOG =
    "IndexedDB is unavailable; falling back to localStorage for favorites.";

class FavoritesStorageManager {
    public strategy: FavoriteStorageStrategy = "indexedDB";
    private dbPromise: Promise<IDBDatabase> | null = null;

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
            this.dbPromise = openDB();
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

    public async getAll(language?: PracticeLanguage): Promise<GrammarPoint[]> {
        const db = await this.ensureDB();
        if (db) {
            try {
                return await getAllFromIndexedDB(db, language);
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
                await addToIndexedDB(db, point);
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
                await removeFromIndexedDB(db, pattern, language);
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
