import { GrammarPoint, BackgroundConfig } from "../types";

const STORAGE_KEY = "rafaam_favorites";
const BG_STORAGE_KEY = "rafaam_background_config";

export const getFavorites = (): GrammarPoint[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load favorites", error);
    return [];
  }
};

export const isFavorite = (pattern: string): boolean => {
  const favorites = getFavorites();
  return favorites.some((p) => p.pattern === pattern);
};

export const toggleFavorite = (point: GrammarPoint): boolean => {
  const favorites = getFavorites();
  const exists = favorites.some((p) => p.pattern === point.pattern);

  let newFavorites;
  if (exists) {
    newFavorites = favorites.filter((p) => p.pattern !== point.pattern);
  } else {
    newFavorites = [point, ...favorites];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    return !exists; // Returns true if added, false if removed
  } catch (error) {
    console.error("Failed to save favorites", error);
    return false;
  }
};

export const removeFavorite = (pattern: string): void => {
  const favorites = getFavorites();
  const newFavorites = favorites.filter((p) => p.pattern !== pattern);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
};

// --- Background Configuration ---

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