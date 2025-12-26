import { AIConfig } from "../../types";
import { storageManager } from "./manager";

const AI_CONFIG_KEY = "rafaam_ai_config";
const API_BASE_URL_KEY = "rafaam_api_base_url";
const API_KEY = "rafaam_api_key";

export const getApiBaseUrl = async (): Promise<string> => {
    const url = await storageManager.get<string>(API_BASE_URL_KEY);
    return url || "";
};

export const saveApiBaseUrl = async (url: string): Promise<void> => {
    await storageManager.set(API_BASE_URL_KEY, url);
};

export const getApiKey = async (): Promise<string> => {
    const key = await storageManager.get<string>(API_KEY);
    return key || "";
};

export const saveApiKey = async (key: string): Promise<void> => {
    await storageManager.set(API_KEY, key);
};

export const getAIConfig = async (): Promise<AIConfig> => {
    const defaultConfig: AIConfig = {
        defaultModel: "gemini-2.5-flash",
        chatModel: "gemini-2.5-flash-tts",
        conversationModel: "gemini-2.5-flash-native-audio-dialog",
        temperature: 1.0,
    };

    try {
        const stored = await storageManager.get<AIConfig>(AI_CONFIG_KEY);
        return stored ? { ...defaultConfig, ...stored } : defaultConfig;
    } catch (error) {
        console.error("Failed to load AI config", error);
        return defaultConfig;
    }
};

export const saveAIConfig = async (config: AIConfig): Promise<void> => {
    await storageManager.set(AI_CONFIG_KEY, config);
};
