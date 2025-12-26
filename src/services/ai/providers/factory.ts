/**
 * AI Provider 工厂
 * 负责创建和管理 AI Provider 实例
 */

import {
    IAIProvider,
    AIProviderType,
    AIProviderConfig,
    ProviderModelConfig,
} from "./types";
import { GeminiProvider } from "./gemini";
import { OpenAIProvider } from "./openai";
import { getAIProviderConfig } from "../../storage";

// Provider 注册表
const PROVIDER_REGISTRY: Record<AIProviderType, new () => IAIProvider> = {
    [AIProviderType.GEMINI]: GeminiProvider,
    [AIProviderType.OPENAI]: OpenAIProvider,
    [AIProviderType.ANTHROPIC]: OpenAIProvider, // TODO: 实现 Anthropic provider
    [AIProviderType.CUSTOM]: OpenAIProvider, // 自定义provider使用OpenAI兼容接口
};

export type ModelType = "text" | "tts" | "live";

/**
 * 当前活动的 Provider 实例缓存（按功能类型分别缓存）
 */
const providerCache: Record<ModelType, IAIProvider | null> = {
    text: null,
    tts: null,
    live: null,
};
const configCache: Record<ModelType, ProviderModelConfig | null> = {
    text: null,
    tts: null,
    live: null,
};

/**
 * Provider 工厂类
 */
export class AIProviderFactory {
    /**
     * 创建 Provider 实例
     */
    static createProvider(type: AIProviderType): IAIProvider {
        const ProviderClass = PROVIDER_REGISTRY[type];
        if (!ProviderClass) {
            throw new Error(`Unknown provider type: ${type}`);
        }
        return new ProviderClass();
    }

    /**
     * 根据功能类型获取对应的Provider
     */
    static async getProviderForType(
        modelType: ModelType
    ): Promise<IAIProvider> {
        const config = await getAIProviderConfig();
        const modelConfig = config[modelType];

        if (!modelConfig) {
            throw new Error(
                `No configuration found for model type: ${modelType}`
            );
        }

        // 获取实际使用的配置（处理自定义Provider）
        const effectiveConfig = this.getEffectiveModelConfig(
            modelConfig,
            config
        );

        // 如果配置没变，返回现有实例
        const cachedProvider = providerCache[modelType];
        const cachedConfig = configCache[modelType];
        if (
            cachedProvider &&
            cachedConfig &&
            this.isSameModelConfig(cachedConfig, effectiveConfig)
        ) {
            return cachedProvider;
        }

        // 创建新实例
        const provider = this.createProvider(effectiveConfig.type);
        // 将ProviderModelConfig转换为旧的AIProviderConfig格式用于初始化
        const initConfig: any = {
            type: effectiveConfig.type,
            apiKey: effectiveConfig.apiKey,
            baseUrl: effectiveConfig.baseUrl,
            models: {
                text: effectiveConfig.model,
                tts: effectiveConfig.model,
                live: effectiveConfig.model,
            },
            temperature: effectiveConfig.temperature,
            maxTokens: effectiveConfig.maxTokens,
        };
        await provider.initialize(initConfig);

        providerCache[modelType] = provider;
        configCache[modelType] = effectiveConfig;

        return provider;
    }

    /**
     * 获取当前 Provider（向后兼容，默认使用text配置）
     * @deprecated 使用 getProviderForType 代替
     */
    static async getCurrentProvider(): Promise<IAIProvider> {
        return this.getProviderForType("text");
    }

    /**
     * 获取有效的模型配置（处理自定义Provider选择）
     */
    private static getEffectiveModelConfig(
        modelConfig: ProviderModelConfig,
        fullConfig: AIProviderConfig
    ): ProviderModelConfig {
        // 如果是CUSTOM类型且有选中的自定义Provider
        if (
            modelConfig.type === AIProviderType.CUSTOM &&
            modelConfig.selectedCustomId
        ) {
            const customProvider = fullConfig.customProviders?.find(
                (cp) => cp.id === modelConfig.selectedCustomId
            );

            if (customProvider) {
                // 使用选中的自定义Provider配置，但保留modelConfig中的model字段
                return {
                    ...modelConfig,
                    apiKey: customProvider.apiKey,
                    baseUrl: customProvider.baseUrl,
                    temperature:
                        customProvider.temperature ?? modelConfig.temperature,
                    maxTokens:
                        customProvider.maxTokens ?? modelConfig.maxTokens,
                };
            }
        }

        return modelConfig;
    }

    /**
     * 重置当前 Provider（强制重新初始化）
     */
    static resetProvider(): void {
        providerCache.text = null;
        providerCache.tts = null;
        providerCache.live = null;
        configCache.text = null;
        configCache.tts = null;
        configCache.live = null;
    }

    /**
     * 检查模型配置是否相同
     */
    private static isSameModelConfig(
        config1: ProviderModelConfig,
        config2: ProviderModelConfig
    ): boolean {
        return (
            config1.type === config2.type &&
            config1.apiKey === config2.apiKey &&
            config1.baseUrl === config2.baseUrl &&
            config1.model === config2.model &&
            config1.selectedCustomId === config2.selectedCustomId
        );
    }

    /**
     * 获取所有可用的 Provider 类型
     */
    static getAvailableProviders(): AIProviderType[] {
        return Object.keys(PROVIDER_REGISTRY) as AIProviderType[];
    }

    /**
     * 注册自定义 Provider
     */
    static registerProvider(
        type: AIProviderType,
        providerClass: new () => IAIProvider
    ): void {
        PROVIDER_REGISTRY[type] = providerClass;
    }
}

/**
 * 便捷函数：获取当前 Provider（默认使用text配置）
 * @deprecated 使用 getProviderForType 代替
 */
export const getAIProvider = async (): Promise<IAIProvider> => {
    return AIProviderFactory.getCurrentProvider();
};

/**
 * 根据模型类型获取Provider
 */
export const getProviderForType = async (
    modelType: ModelType
): Promise<IAIProvider> => {
    return AIProviderFactory.getProviderForType(modelType);
};
