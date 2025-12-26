/**
 * AI 配置验证工具
 */

import { AIProviderType, ProviderModelConfig } from "./providers/types";
import { ModelType } from "./providers/factory";
import { Language } from "@/types";
import { translations } from "@/i18n";

export interface ValidationResult {
    isValid: boolean;
    missingFields: string[];
}

/**
 * 验证单个模型配置是否完整
 */
export const validateModelConfig = (
    modelConfig: ProviderModelConfig,
    modelType: ModelType
): ValidationResult => {
    const missingFields: string[] = [];

    // 检查模型名称
    if (!modelConfig.model || modelConfig.model.trim() === "") {
        missingFields.push("model");
    }

    // 如果不是自定义Provider，需要检查API Key
    if (modelConfig.type !== AIProviderType.CUSTOM) {
        if (!modelConfig.apiKey || modelConfig.apiKey.trim() === "") {
            missingFields.push("apiKey");
        }
    } else {
        // 自定义Provider需要有selectedCustomId
        if (!modelConfig.selectedCustomId) {
            missingFields.push("customProvider");
        }
    }

    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
};

/**
 * 获取模型类型的显示名称
 */
export const getModelTypeLabel = (
    modelType: ModelType,
    language: Language
): string => {
    const t = translations[language];
    switch (modelType) {
        case "text":
            return t.modelTypeText;
        case "tts":
            return t.modelTypeTts;
        case "live":
            return t.modelTypeLive;
        default:
            return modelType;
    }
};

/**
 * 获取字段标签
 */
export const getFieldLabel = (field: string, language: Language): string => {
    const t = translations[language];
    switch (field) {
        case "model":
            return t.fieldModel;
        case "apiKey":
            return t.fieldApiKey;
        case "customProvider":
            return t.fieldCustomProvider;
        default:
            return field;
    }
};
