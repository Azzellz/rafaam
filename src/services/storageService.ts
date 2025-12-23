import { BackgroundConfig } from "../types";

const BG_STORAGE_KEY = "rafaam_background_config";

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
