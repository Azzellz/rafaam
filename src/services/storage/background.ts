import { BackgroundConfig } from "../../types";
import { storageManager } from "./manager";
import { showAlert } from "@/stores/useDialogStore";

const BG_STORAGE_KEY = "rafaam_background_config";

export const getBackgroundConfig = async (): Promise<BackgroundConfig> => {
    const defaultConfig: BackgroundConfig = {
        imageData: null,
        blur: 0,
        overlayOpacity: 0.5,
        themeColor: "#4f46e5",
    };

    try {
        const stored = await storageManager.get<BackgroundConfig>(
            BG_STORAGE_KEY
        );
        return stored ? { ...defaultConfig, ...stored } : defaultConfig;
    } catch (error) {
        console.error("Failed to load background config", error);
        return defaultConfig;
    }
};

export const saveBackgroundConfig = async (
    config: BackgroundConfig
): Promise<void> => {
    try {
        await storageManager.set(BG_STORAGE_KEY, config);
    } catch (error) {
        console.error(
            "Failed to save background config (likely quota exceeded)",
            error
        );
        showAlert(
            "Image too large to save to local storage. It will be reset on reload."
        );
        throw error;
    }
};
