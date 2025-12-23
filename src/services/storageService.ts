import axios from "axios";
import { GrammarPoint, BackgroundConfig } from "../types";

const API_BASE = "http://127.0.0.1:3000/api";
const BG_STORAGE_KEY = "rafaam_background_config";
const apiClient = axios.create({ baseURL: API_BASE });

// --- API Implementation for Favorites ---

export const getFavorites = async (): Promise<GrammarPoint[]> => {
    try {
        const { data } = await apiClient.get<GrammarPoint[]>("/favorites");
        return data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return [];
        }
        console.error("Failed to load favorites from API", error);
        // Fallback to empty array if API fails, so app doesn't crash
        return [];
    }
};

export const addFavorite = async (point: GrammarPoint): Promise<boolean> => {
    try {
        await apiClient.post("/favorites", point);
        return true;
    } catch (error) {
        console.error("Failed to add favorite", error);
        return false;
    }
};

export const removeFavorite = async (pattern: string): Promise<boolean> => {
    try {
        await apiClient.delete("/favorites", { data: { pattern } });
        return true;
    } catch (error) {
        console.error("Failed to remove favorite", error);
        return false;
    }
};

// --- Background Configuration (Stays in LocalStorage) ---

export const getBackgroundConfig = (): BackgroundConfig => {
    const defaultConfig: BackgroundConfig = {
        imageData: null,
        blur: 0,
        overlayOpacity: 0.5,
    };

    try {
        const stored = localStorage.getItem(BG_STORAGE_KEY);
        return stored
            ? { ...defaultConfig, ...JSON.parse(stored) }
            : defaultConfig;
    } catch (error) {
        console.error("Failed to load background config", error);
        return defaultConfig;
    }
};

export const saveBackgroundConfig = (config: BackgroundConfig): void => {
    try {
        localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
        console.error(
            "Failed to save background config (likely quota exceeded)",
            error
        );
        alert(
            "Image too large to save to local storage. It will be reset on reload."
        );
    }
};
