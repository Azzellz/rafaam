import { BackgroundConfig, AIConfig } from "../types";

const BG_STORAGE_KEY = "rafaam_background_config";
const AI_CONFIG_KEY = "rafaam_ai_config";
const API_BASE_URL_KEY = "rafaam_api_base_url";

export const getApiBaseUrl = (): string => {
    return localStorage.getItem(API_BASE_URL_KEY) || "";
};

export const saveApiBaseUrl = (url: string): void => {
    localStorage.setItem(API_BASE_URL_KEY, url);
};

export const getAIConfig = (): AIConfig => {
    const defaultConfig: AIConfig = {
        defaultModel: "gemini-2.5-flash",
        chatModel: "gemini-2.5-flash-tts",
        conversationModel: "gemini-2.5-flash-native-audio-dialog",
        temperature: 1.0,
    };

    try {
        const stored = localStorage.getItem(AI_CONFIG_KEY);
        return stored
            ? { ...defaultConfig, ...JSON.parse(stored) }
            : defaultConfig;
    } catch (error) {
        console.error("Failed to load AI config", error);
        return defaultConfig;
    }
};

export const saveAIConfig = (config: AIConfig): void => {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
};

export const getBackgroundConfig = (): BackgroundConfig => {
    const defaultConfig: BackgroundConfig = {
        imageData: null,
        blur: 0,
        overlayOpacity: 0.5,
        themeColor: "#4f46e5",
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
