import { GrammarPoint, PracticeLanguage } from "@/types";
import { DEFAULT_PRACTICE_LANGUAGE } from "@/constants/practiceLanguages";

const DB_NAME = "rafaam_client_store";
const DB_VERSION = 2;
const STORE_NAME_V1 = "favorites";
const STORE_NAME_V2 = "favorites_v2";

const hasWindow = typeof window !== "undefined";

export const hasIndexedDBSupport = (): boolean =>
    hasWindow && typeof window.indexedDB !== "undefined";

export const openDB = (): Promise<IDBDatabase> => {
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
                        const items = getAllRequest.result as GrammarPoint[];
                        const storeV2 = transaction.objectStore(STORE_NAME_V2);
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
};

export const getAllFromIndexedDB = (
    db: IDBDatabase,
    language?: PracticeLanguage
): Promise<GrammarPoint[]> => {
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
};

export const addToIndexedDB = (
    db: IDBDatabase,
    point: GrammarPoint
): Promise<void> => {
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
};

export const removeFromIndexedDB = (
    db: IDBDatabase,
    pattern: string,
    language: PracticeLanguage
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME_V2, "readwrite");
        const store = transaction.objectStore(STORE_NAME_V2);
        // Key is composite: [language, pattern]
        store.delete([language, pattern]);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
