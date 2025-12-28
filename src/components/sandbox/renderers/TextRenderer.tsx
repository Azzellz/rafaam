/**
 * Text Renderer
 * 文本和文本输入组件渲染器
 */

import React from "react";
import {
    SandboxComponentType,
    TextComponentConfig,
    TextInputComponentConfig,
} from "@/types/sandbox";
import { Language } from "@/types";
import { translations } from "@/i18n";

// ==================== 文本组件 ====================

interface TextRendererProps {
    config: TextComponentConfig;
    isPreview?: boolean;
    language: Language;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
    config,
    isPreview,
    language,
}) => {
    const t = translations[language];
    const styleClasses = {
        normal: "text-gray-800",
        highlight: "bg-yellow-100 border-l-4 border-yellow-500 pl-4 py-2",
        quote: "italic border-l-4 border-gray-300 pl-4 text-gray-600",
    };

    const content = config.content || (isPreview ? t.aiGeneratedPreview : "");

    return (
        <div
            className={`text-lg leading-relaxed ${
                styleClasses[config.style || "normal"]
            }`}
        >
            {config.type === SandboxComponentType.PASSAGE ? (
                <div className="whitespace-pre-wrap">{content}</div>
            ) : (
                content
            )}
        </div>
    );
};

// ==================== 文本输入组件 ====================

interface TextInputRendererProps {
    config: TextInputComponentConfig;
    value?: string;
    onChange?: (value: string) => void;
    showAnswer?: boolean;
    isPreview?: boolean;
    language: Language;
}

export const TextInputRenderer: React.FC<TextInputRendererProps> = ({
    config,
    value = "",
    onChange,
    showAnswer,
    isPreview,
    language,
}) => {
    const t = translations[language];
    const isCorrect = showAnswer && value === config.correctAnswer;
    const isWrong =
        showAnswer && value !== config.correctAnswer && value !== "";

    const baseClass =
        "w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-theme";
    const stateClass = isCorrect
        ? "bg-green-100 border-green-500"
        : isWrong
        ? "bg-red-100 border-red-500"
        : "";

    if (config.type === SandboxComponentType.TEXT_AREA) {
        return (
            <div>
                {config.label && (
                    <label className="block text-sm font-bold mb-2">
                        {config.label}
                    </label>
                )}
                <textarea
                    className={`${baseClass} ${stateClass} resize-y min-h-[100px]`}
                    rows={config.rows || 4}
                    placeholder={
                        config.placeholder || (isPreview ? t.userInputArea : "")
                    }
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={isPreview}
                />
                {showAnswer && config.correctAnswer && (
                    <div className="mt-2 text-sm text-green-700">
                        {t.referenceAnswer}: {config.correctAnswer}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            {config.label && (
                <label className="block text-sm font-bold mb-2">
                    {config.label}
                </label>
            )}
            <input
                type="text"
                className={`${baseClass} ${stateClass}`}
                placeholder={
                    config.placeholder || (isPreview ? t.userInput : "")
                }
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={isPreview}
            />
            {showAnswer && config.correctAnswer && (
                <div className="mt-2 text-sm text-green-700">
                    {t.referenceAnswer}: {config.correctAnswer}
                </div>
            )}
        </div>
    );
};
