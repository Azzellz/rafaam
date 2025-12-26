import { AIConfig } from "../../types";
import { storageManager } from "./manager";
import { AIProviderType, AIProviderConfig } from "../ai/providers";

const AI_CONFIG_KEY = "rafaam_ai_config";
const API_BASE_URL_KEY = "rafaam_api_base_url";
const API_KEY = "rafaam_api_key";
const AI_PROVIDER_CONFIG_KEY = "rafaam_ai_provider_config";

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

// AI Provider Configuration
export const getAIProviderConfig = async (): Promise<AIProviderConfig> => {
    const defaultConfig: AIProviderConfig = {
        text: {
            type: AIProviderType.GEMINI,
            apiKey: "",
            model: "gemini-2.5-flash",
            temperature: 1.0,
        },
        tts: {
            type: AIProviderType.GEMINI,
            apiKey: "",
            model: "gemini-2.5-flash-tts",
            temperature: 1.0,
        },
        live: {
            type: AIProviderType.GEMINI,
            apiKey: "",
            model: "gemini-2.5-flash-native-audio-dialog",
            temperature: 1.0,
        },
        customProviders: [],
    };

    try {
        const stored = await storageManager.get<any>(AI_PROVIDER_CONFIG_KEY);
        if (stored) {
            // 检查是否是新格式（有text/tts/live三个配置）
            if (stored.text && stored.tts && stored.live) {
                return {
                    ...defaultConfig,
                    ...stored,
                    customProviders: stored.customProviders || [],
                };
            }

            // 迁移旧格式（单一provider配置）到新格式
            const oldConfig = stored as {
                type: AIProviderType;
                apiKey: string;
                baseUrl?: string;
                models: { text: string; tts: string; live: string };
                temperature?: number;
                maxTokens?: number;
                customProviders?: any[];
                selectedCustomId?: string;
            };

            const migratedConfig: AIProviderConfig = {
                text: {
                    type: oldConfig.type,
                    apiKey: oldConfig.apiKey,
                    baseUrl: oldConfig.baseUrl,
                    model: oldConfig.models.text,
                    temperature: oldConfig.temperature,
                    maxTokens: oldConfig.maxTokens,
                    selectedCustomId: oldConfig.selectedCustomId,
                },
                tts: {
                    type: oldConfig.type,
                    apiKey: oldConfig.apiKey,
                    baseUrl: oldConfig.baseUrl,
                    model: oldConfig.models.tts,
                    temperature: oldConfig.temperature,
                    maxTokens: oldConfig.maxTokens,
                    selectedCustomId: oldConfig.selectedCustomId,
                },
                live: {
                    type: oldConfig.type,
                    apiKey: oldConfig.apiKey,
                    baseUrl: oldConfig.baseUrl,
                    model: oldConfig.models.live,
                    temperature: oldConfig.temperature,
                    maxTokens: oldConfig.maxTokens,
                    selectedCustomId: oldConfig.selectedCustomId,
                },
                customProviders: oldConfig.customProviders || [],
            };

            // 保存迁移后的配置
            await saveAIProviderConfig(migratedConfig);
            return migratedConfig;
        }

        // 从更旧的配置迁移
        const [oldConfig, apiKey, baseUrl] = await Promise.all([
            getAIConfig(),
            getApiKey(),
            getApiBaseUrl(),
        ]);

        const migratedConfig: AIProviderConfig = {
            text: {
                type: AIProviderType.GEMINI,
                apiKey: apiKey,
                baseUrl: baseUrl || undefined,
                model: oldConfig.defaultModel,
                temperature: oldConfig.temperature,
            },
            tts: {
                type: AIProviderType.GEMINI,
                apiKey: apiKey,
                baseUrl: baseUrl || undefined,
                model: oldConfig.chatModel,
                temperature: oldConfig.temperature,
            },
            live: {
                type: AIProviderType.GEMINI,
                apiKey: apiKey,
                baseUrl: baseUrl || undefined,
                model: oldConfig.conversationModel,
                temperature: oldConfig.temperature,
            },
            customProviders: [],
        };

        // 保存迁移后的配置
        await saveAIProviderConfig(migratedConfig);

        return migratedConfig;
    } catch (error) {
        console.error("Failed to load AI provider config", error);
        return defaultConfig;
    }
};

export const saveAIProviderConfig = async (
    config: AIProviderConfig
): Promise<void> => {
    await storageManager.set(AI_PROVIDER_CONFIG_KEY, config);
};
