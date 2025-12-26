/**
 * OpenAI Provider 实现
 * 支持 OpenAI API 和兼容接口（如 Azure OpenAI, 本地模型等）
 */

import OpenAI from "openai";
import { BaseAIProvider } from "./base";
import {
    AIProviderType,
    GenerationOptions,
    GenerationResponse,
    StreamOptions,
    StreamGenerationResponse,
    ProviderFeature,
} from "./types";

export class OpenAIProvider extends BaseAIProvider {
    readonly type = AIProviderType.OPENAI;
    private client: OpenAI | null = null;

    protected async onInitialize(): Promise<void> {
        this.client = new OpenAI({
            apiKey: this.config!.apiKey,
            baseURL: this.config?.baseUrl,
            dangerouslyAllowBrowser: true,
        });
    }

    async generateText(
        prompt: string,
        modelName?: string,
        options?: GenerationOptions
    ): Promise<GenerationResponse> {
        this.ensureInitialized();
        const model = modelName || this.getModelName("text");
        const mergedOptions = this.mergeOptions(options);

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
        if (mergedOptions.systemPrompt) {
            messages.push({
                role: "system",
                content: mergedOptions.systemPrompt,
            });
        }
        messages.push({ role: "user", content: prompt });

        const response = await this.client!.chat.completions.create({
            model,
            messages,
            temperature: mergedOptions.temperature,
            max_tokens: mergedOptions.maxTokens,
        });

        const choice = response.choices[0];

        return {
            text: choice.message.content || "",
            finishReason: choice.finish_reason,
            usage: response.usage
                ? {
                      promptTokens: response.usage.prompt_tokens,
                      completionTokens: response.usage.completion_tokens,
                      totalTokens: response.usage.total_tokens,
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
        const model = modelName || this.getModelName("text");
        const mergedOptions = this.mergeOptions(options);

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
        if (mergedOptions.systemPrompt) {
            messages.push({
                role: "system",
                content: mergedOptions.systemPrompt,
            });
        }
        messages.push({ role: "user", content: prompt });

        const response = await this.client!.chat.completions.create({
            model,
            messages,
            temperature: mergedOptions.temperature,
            max_tokens: mergedOptions.maxTokens,
            stream: true,
        });

        let fullText = "";
        const stream = (async function* () {
            try {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        fullText += content;
                        options?.onChunk?.(content);
                        yield content;
                    }
                }
            } catch (e) {
                console.error("Stream error:", e);
                throw e;
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
        const model = modelName || this.getModelName("text");
        const mergedOptions = this.mergeOptions(options);

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
        if (mergedOptions.systemPrompt) {
            messages.push({
                role: "system",
                content: mergedOptions.systemPrompt,
            });
        }
        messages.push({
            role: "user",
            content: `${prompt}\n\nPlease respond with valid JSON matching this schema:\n${JSON.stringify(
                schema,
                null,
                2
            )}`,
        });

        const response = await this.client!.chat.completions.create({
            model,
            messages,
            temperature: mergedOptions.temperature,
            max_tokens: mergedOptions.maxTokens,
            response_format: { type: "json_object" },
        });

        const text = response.choices[0].message.content || "{}";

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
            ProviderFeature.FUNCTION_CALLING,
        ];
    }
}
