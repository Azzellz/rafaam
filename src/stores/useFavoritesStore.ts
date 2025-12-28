"use client";

import { create } from "zustand";
import { GrammarPoint, PracticeLanguage } from "@/types";
import {
    FavoriteStorageStrategy,
    favoritesStorageManager,
} from "@/services/favorites";
import { DEFAULT_PRACTICE_LANGUAGE } from "@/constants/practiceLanguages";

interface FavoritesState {
    favorites: GrammarPoint[];
    storageStrategy: FavoriteStorageStrategy;
    initialized: boolean;
    isInitializing: boolean;
    isMutating: boolean;
    error: string | null;
    initStore: (language?: PracticeLanguage) => Promise<void>;
    addFavorite: (point: GrammarPoint) => Promise<boolean>;
    removeFavorite: (
        pattern: string,
        language?: PracticeLanguage
    ) => Promise<boolean>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],
    storageStrategy: "indexedDB",
    initialized: false,
    isInitializing: false,
    isMutating: false,
    error: null,
    initStore: async (language?: PracticeLanguage) => {
        // Always reload if language is specified or not initialized
        if (get().initialized && !language && !get().isInitializing) {
            return;
        }

        set({ isInitializing: true, error: null });
        try {
            const items = await favoritesStorageManager.getAll(language);
            set({
                favorites: items,
                initialized: true,
                isInitializing: false,
                storageStrategy: favoritesStorageManager.strategy,
            });
        } catch (error) {
            console.error("Failed to initialize favorites store", error);
            set({
                error: "Failed to load favorites",
                isInitializing: false,
            });
        }
    },
    addFavorite: async (point: GrammarPoint) => {
        const previousFavorites = get().favorites;
        // Check if already exists (considering language)
        const targetLang = point.practiceLanguage ?? DEFAULT_PRACTICE_LANGUAGE;

        if (
            previousFavorites.some(
                (item) =>
                    item.pattern === point.pattern &&
                    (item.practiceLanguage ?? DEFAULT_PRACTICE_LANGUAGE) ===
                        targetLang
            )
        ) {
            return true;
        }

        set({
            favorites: [...previousFavorites, point],
            isMutating: true,
            error: null,
        });

        try {
            await favoritesStorageManager.add(point);
            set({
                isMutating: false,
                storageStrategy: favoritesStorageManager.strategy,
            });
            return true;
        } catch (error) {
            console.error("Failed to add favorite", error);
            set({
                favorites: previousFavorites,
                isMutating: false,
                error: "Failed to add favorite",
            });
            return false;
        }
    },
    removeFavorite: async (pattern: string, language?: PracticeLanguage) => {
        const previousFavorites = get().favorites;
        const targetLang = language ?? DEFAULT_PRACTICE_LANGUAGE;

        const updatedFavorites = previousFavorites.filter(
            (item) =>
                !(
                    item.pattern === pattern &&
                    (item.practiceLanguage ?? DEFAULT_PRACTICE_LANGUAGE) ===
                        targetLang
                )
        );

        if (updatedFavorites.length === previousFavorites.length) {
            return true;
        }

        set({ favorites: updatedFavorites, isMutating: true, error: null });

        try {
            await favoritesStorageManager.remove(pattern, targetLang);
            set({
                isMutating: false,
                storageStrategy: favoritesStorageManager.strategy,
            });
            return true;
        } catch (error) {
            console.error("Failed to remove favorite", error);
            set({
                favorites: previousFavorites,
                isMutating: false,
                error: "Failed to remove favorite",
            });
            return false;
        }
    },
}));

