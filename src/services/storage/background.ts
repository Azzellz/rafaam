/**
 * Background Configuration Storage
 */

import { BackgroundConfig } from "@/types";
import { storageManager } from "./manager";
import { showAlert } from "@/stores/useDialogStore";

const BG_STORAGE_KEY = "rafaam_background_config";

const DEFAULT_CONFIG: BackgroundConfig = {
    imageData: null,
    blur: 0,
    overlayOpacity: 0.5,
    themeColor: "#4f46e5",
};

/**
 * 获取背景配置
 */
export const getBackgroundConfig = async (): Promise<BackgroundConfig> => {
    try {
        const stored =
            await storageManager.get<BackgroundConfig>(BG_STORAGE_KEY);
        return stored ? { ...DEFAULT_CONFIG, ...stored } : DEFAULT_CONFIG;
    } catch (error) {
        console.error("[Background] Failed to load config", error);
        return DEFAULT_CONFIG;
    }
};

/**
 * 保存背景配置
 */
export const saveBackgroundConfig = async (
    config: BackgroundConfig
): Promise<void> => {
    try {
        await storageManager.set(BG_STORAGE_KEY, config);
    } catch (error) {
        console.error("[Background] Failed to save config", error);
        showAlert(
            "Image too large to save to local storage. It will be reset on reload."
        );
        throw error;
    }
};
