import { GrammarPoint, PracticeLanguage } from "@/types";

const LOCAL_STORAGE_PREFIX = "rafaam_favorites_";

const hasWindow = typeof window !== "undefined";

const hasLocalStorageSupport = (): boolean =>
    hasWindow && typeof window.localStorage !== "undefined";

const getLocalStorageKey = (language: PracticeLanguage) =>
    `${LOCAL_STORAGE_PREFIX}${language}`;

export const readLocalFavorites = (
    language: PracticeLanguage
): GrammarPoint[] => {
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

export const writeLocalFavorites = (
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

export const upsertLocalFavorite = (point: GrammarPoint): void => {
    const lang = point.practiceLanguage;
    if (!lang) return;

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

export const removeLocalFavorite = (
    pattern: string,
    language: PracticeLanguage
): void => {
    const favorites = readLocalFavorites(language).filter(
        (item) => item.pattern !== pattern
    );
    writeLocalFavorites(language, favorites);
};
