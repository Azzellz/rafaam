/**
 * AI Provider 抽象基类
 * 提供通用实现和工具方法
 */

import {
    IAIProvider,
    AIProviderType,
    AIProviderConfig,
    GenerationOptions,
    GenerationResponse,
    StreamOptions,
    StreamGenerationResponse,
    ProviderFeature,
} from "./types";

export abstract class BaseAIProvider implements IAIProvider {
    abstract readonly type: AIProviderType;
    protected config: AIProviderConfig | null = null;
    protected initialized = false;

    async initialize(config: AIProviderConfig): Promise<void> {
        this.config = config;
        await this.onInitialize();
        this.initialized = true;
    }

    /**
     * 子类可以覆盖此方法进行特定初始化
     */
    protected async onInitialize(): Promise<void> {
        // Default: do nothing
    }

    abstract generateText(
        prompt: string,
        modelName?: string,
        options?: GenerationOptions
    ): Promise<GenerationResponse>;

    abstract generateTextStream(
        prompt: string,
        modelName?: string,
        options?: StreamOptions
    ): Promise<StreamGenerationResponse>;

    abstract generateStructuredData<T = any>(
        prompt: string,
        schema: any,
        modelName?: string,
        options?: GenerationOptions
    ): Promise<T>;

    abstract translate(
        text: string,
        targetLanguage: string,
        sourceLanguage?: string
    ): Promise<string>;

    isAvailable(): boolean {
        return this.initialized && !!this.config?.apiKey;
    }

    abstract getSupportedFeatures(): string[];

    /**
     * 获取配置的模型名称
     */
    protected getModelName(type: "text" | "tts" | "live"): string {
        if (!this.config) {
            throw new Error("Provider not initialized");
        }
        // 直接返回 config 中的 model 字段
        return this.config.model || this.config.models?.[type] || "";
    }

    /**
     * 验证Provider已初始化
     */
    protected ensureInitialized(): void {
        if (!this.initialized || !this.config) {
            throw new Error(
                `${this.type} provider not initialized. Call initialize() first.`
            );
        }
    }

    /**
     * 合并配置选项
     */
    protected mergeOptions(options?: GenerationOptions): Required<
        Omit<GenerationOptions, "schema" | "systemPrompt">
    > & {
        schema?: any;
        systemPrompt?: string;
    } {
        return {
            temperature:
                options?.temperature ?? this.config?.temperature ?? 1.0,
            maxTokens: options?.maxTokens ?? this.config?.maxTokens ?? 2048,
            schema: options?.schema,
            systemPrompt: options?.systemPrompt,
        };
    }
}
