/**
 * AI 配置错误处理器
 */

import { showConfirm } from "@/stores/useDialogStore";
import { Language } from "@/types";
import { ModelType } from "./providers/factory";
import { getModelTypeLabel, getFieldLabel } from "./validation";

interface HandleConfigErrorOptions {
    error: Error;
    language: Language;
    onNavigateToSettings: () => void;
}

/**
 * 处理AI配置错误
 * 如果是配置不完整的错误，显示引导dialog
 */
export const handleAIConfigError = ({
    error,
    language,
    onNavigateToSettings,
}: HandleConfigErrorOptions): boolean => {
    const errorMessage = error.message;

    // 检查是否是配置不完整的错误
    if (errorMessage.startsWith("INCOMPLETE_CONFIG:")) {
        const parts = errorMessage.split(":");
        const modelType = parts[1] as ModelType;
        const missingFields = parts[2]?.split(",") || [];

        const modelTypeLabel = getModelTypeLabel(modelType, language);

        const messages: Record<Language, string> = {
            [Language.ZH_CN]: `${modelTypeLabel}尚未配置完整。\n缺少：${getMissingFieldsLabel(
                missingFields,
                language
            )}\n\n是否前往设置页面进行配置？`,
            [Language.EN]: `${modelTypeLabel} is not fully configured.\nMissing: ${getMissingFieldsLabel(
                missingFields,
                language
            )}\n\nWould you like to go to settings?`,
            [Language.JA]: `${modelTypeLabel}が完全に設定されていません。\n不足：${getMissingFieldsLabel(
                missingFields,
                language
            )}\n\n設定ページに移動しますか？`,
        };

        showConfirm(
            messages[language],
            onNavigateToSettings,
            undefined,
            undefined,
            language
        );

        return true;
    }

    return false;
};

/**
 * 获取缺失字段的标签
 */
const getMissingFieldsLabel = (
    fields: string[],
    language: Language
): string => {
    return fields.map((field) => getFieldLabel(field, language)).join(", ");
};
