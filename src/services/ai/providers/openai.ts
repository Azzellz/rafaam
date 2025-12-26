/**
 * OpenAI Provider 实现
 * 支持 OpenAI API 和兼容接口（如 Azure OpenAI, 本地模型等）
 */

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
    private baseUrl: string = "https://api.openai.com/v1";

    protected async onInitialize(): Promise<void> {
        if (this.config?.baseUrl) {
            this.baseUrl = this.config.baseUrl;
        }
    }

    async generateText(
        prompt: string,
        modelName?: string,
        options?: GenerationOptions
    ): Promise<GenerationResponse> {
        this.ensureInitialized();
        const model = modelName || this.getModelName("text");
        const mergedOptions = this.mergeOptions(options);

        const messages = [];
        if (mergedOptions.systemPrompt) {
            messages.push({
                role: "system",
                content: mergedOptions.systemPrompt,
            });
        }
        messages.push({ role: "user", content: prompt });

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config!.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: mergedOptions.temperature,
                max_tokens: mergedOptions.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const choice = data.choices[0];

        return {
            text: choice.message.content,
            finishReason: choice.finish_reason,
            usage: data.usage
                ? {
                      promptTokens: data.usage.prompt_tokens,
                      completionTokens: data.usage.completion_tokens,
                      totalTokens: data.usage.total_tokens,
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

        const messages = [];
        if (mergedOptions.systemPrompt) {
            messages.push({
                role: "system",
                content: mergedOptions.systemPrompt,
            });
        }
        messages.push({ role: "user", content: prompt });

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config!.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: mergedOptions.temperature,
                max_tokens: mergedOptions.maxTokens,
                stream: true,
            }),
            signal: options?.signal,
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        let fullText = "";
        const stream = (async function* () {
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") continue;

                            try {
                                const json = JSON.parse(data);
                                const content =
                                    json.choices[0]?.delta?.content || "";
                                if (content) {
                                    fullText += content;
                                    options?.onChunk?.(content);
                                    yield content;
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
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

        const messages = [];
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

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config!.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: mergedOptions.temperature,
                max_tokens: mergedOptions.maxTokens,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

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
