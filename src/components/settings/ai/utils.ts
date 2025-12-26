import { AIProviderType } from "@/services/ai/providers";
import { TranslationContent } from "@/i18n/types";
import { ModelType } from "./types";

export const getProviderLabel = (
    type: AIProviderType,
    t: TranslationContent
): string => {
    switch (type) {
        case AIProviderType.GEMINI:
            return t.providerGemini;
        case AIProviderType.OPENAI:
            return t.providerOpenAI;
        case AIProviderType.ANTHROPIC:
            return t.providerAnthropic;
        case AIProviderType.CUSTOM:
            return t.providerCustom;
        default:
            return type;
    }
};

export const getModelPlaceholder = (
    providerType: AIProviderType,
    modelType: ModelType
): string => {
    switch (providerType) {
        case AIProviderType.GEMINI:
            if (modelType === "text") return "e.g., gemini-2.5-flash";
            if (modelType === "tts") return "e.g., gemini-2.5-flash-tts";
            return "e.g., gemini-2.5-flash-native-audio-dialog";

        case AIProviderType.OPENAI:
            if (modelType === "live") return "e.g., gpt-4o-realtime-preview";
            return "e.g., gpt-4o";

        case AIProviderType.ANTHROPIC:
            return "e.g., claude-3-5-sonnet-20241022";

        default:
            return "e.g., model-name";
    }
};
