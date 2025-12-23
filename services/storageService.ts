import { GrammarPoint, BackgroundConfig } from "../types";

const API_BASE = "http://127.0.0.1:3000/api";
const BG_STORAGE_KEY = "rafaam_background_config";

// --- API Implementation for Favorites ---

export const getFavorites = async (): Promise<GrammarPoint[]> => {
  try {
    const response = await fetch(API_BASE + "/favorites");
    if (!response.ok) {
      if (response.status === 404) return []; // Handle no backend gracefully
      throw new Error(`Error fetching favorites: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to load favorites from API", error);
    // Fallback to empty array if API fails, so app doesn't crash
    return [];
  }
};

export const addFavorite = async (point: GrammarPoint): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE + "/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(point),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to add favorite", error);
    return false;
  }
};

export const removeFavorite = async (pattern: string): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE + "/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pattern }),
    });
    return response.ok;
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
    overlayOpacity: 0.5
  };

  try {
    const stored = localStorage.getItem(BG_STORAGE_KEY);
    return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
  } catch (error) {
    console.error("Failed to load background config", error);
    return defaultConfig;
  }
};

export const saveBackgroundConfig = (config: BackgroundConfig): void => {
  try {
    localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save background config (likely quota exceeded)", error);
    alert("Image too large to save to local storage. It will be reset on reload.");
  }
};