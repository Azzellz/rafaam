/**
 * Google Gemini AI Provider 实现
 */

import { GoogleGenAI, GoogleGenAIOptions } from "@google/genai";
import { BaseAIProvider } from "./base";
import {
    AIProviderType,
    AIProviderConfig,
    GenerationOptions,
    GenerationResponse,
    StreamOptions,
    StreamGenerationResponse,
    ProviderFeature,
} from "./types";

export class GeminiProvider extends BaseAIProvider {
    readonly type = AIProviderType.GEMINI;
    private client: GoogleGenAI | null = null;

    protected async onInitialize(): Promise<void> {
        if (!this.config) {
            throw new Error("Config is required");
        }

        const options: GoogleGenAIOptions = {
            apiKey: this.config.apiKey,
        };

        if (this.config.baseUrl) {
            options.httpOptions = { baseUrl: this.config.baseUrl };
        }

        this.client = new GoogleGenAI(options);
    }

    async generateText(
        prompt: string,
        modelName?: string,
        options?: GenerationOptions
    ): Promise<GenerationResponse> {
        this.ensureInitialized();
        if (!this.client) throw new Error("Client not initialized");

        const model = modelName || this.getModelName("text");
        const mergedOptions = this.mergeOptions(options);

        const response = await this.client.models.generateContent({
            model,
            contents: prompt,
            config: {
                temperature: mergedOptions.temperature,
                maxOutputTokens: mergedOptions.maxTokens,
                systemInstruction: mergedOptions.systemPrompt,
            },
        });

        return {
            text: response.text || "",
            finishReason: response.candidates?.[0]?.finishReason,
            usage: response.usageMetadata
                ? {
                      promptTokens:
                          response.usageMetadata.promptTokenCount || 0,
                      completionTokens:
                          response.usageMetadata.candidatesTokenCount || 0,
                      totalTokens: response.usageMetadata.totalTokenCount || 0,
                  }
                : undefined,
        };
    }

    async generateTextStream(
        prompt: string,
        modelName?: string,
        options?: StreamOptions
    ): Promise<StreamGenerationResponse> {
        this.ensureInitialized();
        if (!this.client) throw new Error("Client not initialized");

        const model = modelName || this.getModelName("text");
        const mergedOptions = this.mergeOptions(options);

        const resultStream = await this.client.models.generateContentStream({
            model,
            contents: prompt,
            config: {
                temperature: mergedOptions.temperature,
                maxOutputTokens: mergedOptions.maxTokens,
                systemInstruction: mergedOptions.systemPrompt,
            },
        });

        let fullText = "";
        const stream = (async function* () {
            for await (const chunk of resultStream) {
                const text = chunk.text || "";
                fullText += text;
                options?.onChunk?.(text);
                yield text;
            }
        })();

        return {
            text: fullText,
            stream,
        };
    }

    async generateStructuredData<T = any>(
        prompt: string,
        schema: any,
        modelName?: string,
        options?: GenerationOptions
    ): Promise<T> {
        this.ensureInitialized();
        if (!this.client) throw new Error("Client not initialized");

        const model = modelName || this.getModelName("text");
        const mergedOptions = this.mergeOptions(options);

        const response = await this.client.models.generateContent({
            model,
            contents: prompt,
            config: {
                temperature: mergedOptions.temperature,
                maxOutputTokens: mergedOptions.maxTokens,
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: mergedOptions.systemPrompt,
            },
        });

        const text = response.text || "";
        return JSON.parse(text) as T;
    }

    async translate(
        text: string,
        targetLanguage: string,
        sourceLanguage?: string
    ): Promise<string> {
        const prompt = sourceLanguage
            ? `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only output the translation, nothing else:\n\n${text}`
            : `Translate the following text to ${targetLanguage}. Only output the translation, nothing else:\n\n${text}`;

        const response = await this.generateText(
            prompt,
            this.getModelName("tts")
        );
        return response.text;
    }

    getSupportedFeatures(): string[] {
        return [
            ProviderFeature.TEXT_GENERATION,
            ProviderFeature.STREAMING,
            ProviderFeature.STRUCTURED_OUTPUT,
            ProviderFeature.TRANSLATION,
            ProviderFeature.TEXT_TO_SPEECH,
            ProviderFeature.LIVE_CONVERSATION,
            ProviderFeature.VISION,
            ProviderFeature.FUNCTION_CALLING,
        ];
    }

    /**
     * 生成语音 (TTS)
     * @param text 要转换的文本
     * @param voiceName Gemini 语音名称
     * @returns Base64 编码的音频数据
     */
    async generateSpeech(text: string, voiceName: string): Promise<string> {
        this.ensureInitialized();
        if (!this.client) throw new Error("Client not initialized");

        if (!text || !text.trim()) {
            throw new Error("Text is empty");
        }

        const response = await this.client.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text.trim() }] }],
            config: {
                // Cast string to Modality to avoid potential enum resolution issues
                responseModalities: ["AUDIO" as any],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];

        if (part?.inlineData?.data) {
            return part.inlineData.data;
        }

        if (part?.text) {
            console.warn("TTS returned text instead of audio:", part.text);
            throw new Error(`TTS generation failed: ${part.text}`);
        }

        throw new Error("No audio data returned");
    }

    /**
     * 获取原生 Gemini 客户端（用于特殊功能）
     */
    getNativeClient(): GoogleGenAI {
        this.ensureInitialized();
        if (!this.client) throw new Error("Client not initialized");
        return this.client;
    }
}
