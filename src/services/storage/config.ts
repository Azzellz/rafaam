/**
 * Storage Configuration
 * AI 和应用配置的存储管理
 */

import { AIConfig } from "@/types";
import { storageManager } from "./manager";
import { AIProviderType, AIProviderConfig } from "../ai/providers";

// ==================== Storage Keys ====================

const KEYS = {
    AI_CONFIG: "rafaam_ai_config",
    API_BASE_URL: "rafaam_api_base_url",
    API_KEY: "rafaam_api_key",
    AI_PROVIDER_CONFIG: "rafaam_ai_provider_config",
} as const;

// ==================== Legacy Config Helpers ====================

export const getApiBaseUrl = async (): Promise<string> => {
    return (await storageManager.get<string>(KEYS.API_BASE_URL)) || "";
};

export const saveApiBaseUrl = async (url: string): Promise<void> => {
    await storageManager.set(KEYS.API_BASE_URL, url);
};

export const getApiKey = async (): Promise<string> => {
    return (await storageManager.get<string>(KEYS.API_KEY)) || "";
};

export const saveApiKey = async (key: string): Promise<void> => {
    await storageManager.set(KEYS.API_KEY, key);
};

export const getAIConfig = async (): Promise<AIConfig | null> => {
    try {
        return await storageManager.get<AIConfig>(KEYS.AI_CONFIG);
    } catch (error) {
        console.error("[Config] Failed to load AI config", error);
        return null;
    }
};

export const saveAIConfig = async (config: AIConfig): Promise<void> => {
    await storageManager.set(KEYS.AI_CONFIG, config);
};

// ==================== AI Provider Config ====================

/**
 * 迁移旧的单一 provider 配置到新的三模型配置
 */
const migrateOldProviderConfig = (oldConfig: any): AIProviderConfig => {
    return {
        text: {
            type: oldConfig.type,
            apiKey: oldConfig.apiKey,
            baseUrl: oldConfig.baseUrl,
            model: oldConfig.models?.text || "",
            temperature: oldConfig.temperature,
            maxTokens: oldConfig.maxTokens,
            selectedCustomId: oldConfig.selectedCustomId,
        },
        tts: {
            type: oldConfig.type,
            apiKey: oldConfig.apiKey,
            baseUrl: oldConfig.baseUrl,
            model: oldConfig.models?.tts || "",
            temperature: oldConfig.temperature,
            maxTokens: oldConfig.maxTokens,
            selectedCustomId: oldConfig.selectedCustomId,
        },
        live: {
            type: oldConfig.type,
            apiKey: oldConfig.apiKey,
            baseUrl: oldConfig.baseUrl,
            model: oldConfig.models?.live || "",
            temperature: oldConfig.temperature,
            maxTokens: oldConfig.maxTokens,
            selectedCustomId: oldConfig.selectedCustomId,
        },
        customProviders: oldConfig.customProviders || [],
    };
};

/**
 * 从最旧的配置格式迁移（AIConfig + apiKey + baseUrl）
 */
const migrateFromLegacyConfig = async (): Promise<AIProviderConfig | null> => {
    const [oldConfig, apiKey, baseUrl] = await Promise.all([
        getAIConfig(),
        getApiKey(),
        getApiBaseUrl(),
    ]);

    if (!oldConfig) return null;

    return {
        text: {
            type: AIProviderType.GEMINI,
            apiKey,
            baseUrl: baseUrl || undefined,
            model: oldConfig.defaultModel,
            temperature: oldConfig.temperature,
        },
        tts: {
            type: AIProviderType.GEMINI,
            apiKey,
            baseUrl: baseUrl || undefined,
            model: oldConfig.chatModel,
            temperature: oldConfig.temperature,
        },
        live: {
            type: AIProviderType.GEMINI,
            apiKey,
            baseUrl: baseUrl || undefined,
            model: oldConfig.conversationModel,
            temperature: oldConfig.temperature,
        },
        customProviders: [],
    };
};

/**
 * 检查是否是新格式的配置
 */
const isNewFormatConfig = (config: any): config is AIProviderConfig => {
    return config && config.text && config.tts && config.live;
};

/**
 * 获取 AI Provider 配置
 * 自动处理配置迁移
 */
export const getAIProviderConfig =
    async (): Promise<AIProviderConfig | null> => {
        try {
            const stored = await storageManager.get<any>(
                KEYS.AI_PROVIDER_CONFIG
            );

            if (stored) {
                // 新格式配置
                if (isNewFormatConfig(stored)) {
                    return {
                        ...stored,
                        customProviders: stored.customProviders || [],
                    };
                }

                // 旧格式配置 - 迁移
                const migrated = migrateOldProviderConfig(stored);
                await saveAIProviderConfig(migrated);
                return migrated;
            }

            // 尝试从最旧的配置迁移
            const legacyMigrated = await migrateFromLegacyConfig();
            if (legacyMigrated) {
                await saveAIProviderConfig(legacyMigrated);
                return legacyMigrated;
            }

            return null;
        } catch (error) {
            console.error("[Config] Failed to load AI provider config", error);
            return null;
        }
    };

/**
 * 保存 AI Provider 配置
 */
export const saveAIProviderConfig = async (
    config: AIProviderConfig
): Promise<void> => {
    await storageManager.set(KEYS.AI_PROVIDER_CONFIG, config);
};
