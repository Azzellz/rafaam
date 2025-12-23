import { create } from "zustand";
import { GrammarPoint } from "@/types";
import {
    FavoriteStorageStrategy,
    favoritesStorageManager,
} from "@/services/favoritesStorage";

interface FavoritesState {
    favorites: GrammarPoint[];
    storageStrategy: FavoriteStorageStrategy;
    initialized: boolean;
    isInitializing: boolean;
    isMutating: boolean;
    error: string | null;
    initStore: () => Promise<void>;
    addFavorite: (point: GrammarPoint) => Promise<boolean>;
    removeFavorite: (pattern: string) => Promise<boolean>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],
    storageStrategy: "indexedDB",
    initialized: false,
    isInitializing: false,
    isMutating: false,
    error: null,
    initStore: async () => {
        if (get().initialized || get().isInitializing) {
            return;
        }

        set({ isInitializing: true, error: null });
        try {
            const items = await favoritesStorageManager.getAll();
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
        if (previousFavorites.some((item) => item.pattern === point.pattern)) {
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
    removeFavorite: async (pattern: string) => {
        const previousFavorites = get().favorites;
        const updatedFavorites = previousFavorites.filter(
            (item) => item.pattern !== pattern
        );

        if (updatedFavorites.length === previousFavorites.length) {
            return true;
        }

        set({ favorites: updatedFavorites, isMutating: true, error: null });

        try {
            await favoritesStorageManager.remove(pattern);
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
