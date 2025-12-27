/**
 * AI Provider 通用接口定义
 * 支持多种AI模型（Gemini, OpenAI, Claude, etc.）
 */

export enum AIProviderType {
    GEMINI = "gemini",
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    CUSTOM = "custom", // 自定义/本地模型（支持多个）
}

export interface CustomProviderConfig {
    id: string; // 唯一标识
    name: string; // 显示名称
    apiKey: string;
    baseUrl: string;
    temperature?: number;
    maxTokens?: number;
}

// 单个功能的Provider配置
export interface ProviderModelConfig {
    type: AIProviderType;
    apiKey: string;
    baseUrl?: string;
    model: string; // 模型名称
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string; // 自定义系统提示词
    // 当type为CUSTOM时，指定使用哪个自定义Provider
    selectedCustomId?: string;
    // TTS专用：是否使用Edge TTS（无需配置模型）
    useEdgeTTS?: boolean;
    // Edge TTS配置
    edgeTTSConfig?: {
        rate?: number; // 语速: 0.5 到 2.0, 默认 1.0
        pitch?: string; // 音调: x-low, low, medium, high, x-high
        volume?: number; // 音量: 0 到 100, 默认 100
        preferredGender?: "Male" | "Female"; // 偏好性别
        voice?: string; // 指定语音（可选，留空则自动检测）
    };
}

export interface AIProviderConfig {
    // 文本生成配置（翻译、内容生成等）
    text: ProviderModelConfig;
    // 语音合成配置（TTS和文字聊天）
    tts: ProviderModelConfig;
    // 实时对话配置（Live API）
    live: ProviderModelConfig;
    // 自定义Provider列表（共享）
    customProviders?: CustomProviderConfig[];
    // 扩展配置
    [key: string]: any;
}

export interface GenerationOptions {
    temperature?: number;
    maxTokens?: number;
    schema?: any; // JSON Schema for structured output
    systemPrompt?: string;
}

export interface StreamOptions extends GenerationOptions {
    onChunk?: (text: string) => void;
    signal?: AbortSignal;
}

export interface GenerationResponse {
    text: string;
    finishReason?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface StreamGenerationResponse extends GenerationResponse {
    stream: AsyncIterable<string>;
}

/**
 * AI Provider 基础接口
 * 所有AI Provider必须实现此接口
 */
export interface IAIProvider {
    /**
     * Provider类型标识
     */
    readonly type: AIProviderType;

    /**
     * 初始化Provider
     */
    initialize(config: AIProviderConfig): Promise<void>;

    /**
     * 生成文本（支持结构化输出）
     */
    generateText(
        prompt: string,
        modelName?: string,
        options?: GenerationOptions
    ): Promise<GenerationResponse>;

    /**
     * 流式生成文本
     */
    generateTextStream(
        prompt: string,
        modelName?: string,
        options?: StreamOptions
    ): Promise<StreamGenerationResponse>;

    /**
     * 生成结构化数据（JSON）
     */
    generateStructuredData<T = any>(
        prompt: string,
        schema: any,
        modelName?: string,
        options?: GenerationOptions
    ): Promise<T>;

    /**
     * 翻译文本
     */
    translate(
        text: string,
        targetLanguage: string,
        sourceLanguage?: string
    ): Promise<string>;

    /**
     * 语音合成（TTS）
     */
    textToSpeech?(text: string, language?: string): Promise<ArrayBuffer>;

    /**
     * 实时对话（Live API）
     */
    createLiveSession?(): Promise<any>;

    /**
     * 检查Provider是否可用
     */
    isAvailable(): boolean;

    /**
     * 获取支持的功能列表
     */
    getSupportedFeatures(): string[];
}

/**
 * Provider 能力特性
 */
export enum ProviderFeature {
    TEXT_GENERATION = "text_generation",
    STREAMING = "streaming",
    STRUCTURED_OUTPUT = "structured_output",
    TRANSLATION = "translation",
    TEXT_TO_SPEECH = "text_to_speech",
    LIVE_CONVERSATION = "live_conversation",
    VISION = "vision",
    FUNCTION_CALLING = "function_calling",
}
