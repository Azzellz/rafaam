import { GrammarPoint, PracticeLanguage } from "@/types";
import { DEFAULT_PRACTICE_LANGUAGE } from "@/constants/practiceLanguages";
import { storageManager } from "@/services/storage";

export type FavoriteStorageStrategy = "indexedDB" | "localStorage";

const FAVORITES_KEY_PREFIX = "favorites_";

class FavoritesStorageManager {
    public get strategy(): FavoriteStorageStrategy {
        return storageManager.strategy;
    }

    private getStorageKey(language: PracticeLanguage): string {
        return `${FAVORITES_KEY_PREFIX}${language}`;
    }

    public async getAll(language?: PracticeLanguage): Promise<GrammarPoint[]> {
        try {
            if (language) {
                const key = this.getStorageKey(language);
                const favorites = await storageManager.get<GrammarPoint[]>(key);
                return favorites || [];
            } else {
                // 如果没有指定语言，返回默认语言的收藏
                const key = this.getStorageKey(DEFAULT_PRACTICE_LANGUAGE);
                const favorites = await storageManager.get<GrammarPoint[]>(key);
                return favorites || [];
            }
        } catch (error) {
            console.error("Failed to get favorites", error);
            return [];
        }
    }

    public async add(point: GrammarPoint): Promise<void> {
        try {
            const language =
                point.practiceLanguage || DEFAULT_PRACTICE_LANGUAGE;
            const key = this.getStorageKey(language);
            const favorites = await this.getAll(language);

            // 检查是否已存在
            const existingIndex = favorites.findIndex(
                (item) => item.pattern === point.pattern
            );

            if (existingIndex >= 0) {
                // 更新现有项
                favorites[existingIndex] = {
                    ...point,
                    practiceLanguage: language,
                };
            } else {
                // 添加新项
                favorites.push({
                    ...point,
                    practiceLanguage: language,
                });
            }

            await storageManager.set(key, favorites);
        } catch (error) {
            console.error("Failed to add favorite", error);
            throw error;
        }
    }

    public async remove(
        pattern: string,
        language: PracticeLanguage
    ): Promise<void> {
        try {
            const key = this.getStorageKey(language);
            const favorites = await this.getAll(language);
            const filtered = favorites.filter(
                (item) => item.pattern !== pattern
            );
            await storageManager.set(key, filtered);
        } catch (error) {
            console.error("Failed to remove favorite", error);
            throw error;
        }
    }
}

export const favoritesStorageManager = new FavoritesStorageManager();
