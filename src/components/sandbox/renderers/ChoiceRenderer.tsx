/**
 * Choice Renderer
 * 选择题组件渲染器
 */

import React from "react";
import { SandboxComponentType, ChoiceComponentConfig } from "@/types/sandbox";
import { Language } from "@/types";
import { translations } from "@/i18n";

interface ChoiceRendererProps {
    config: ChoiceComponentConfig;
    selected?: string | string[];
    onSelect?: (id: string) => void;
    showAnswer?: boolean;
    isPreview?: boolean;
    language: Language;
}

export const ChoiceRenderer: React.FC<ChoiceRendererProps> = ({
    config,
    selected,
    onSelect,
    showAnswer,
    isPreview,
    language,
}) => {
    const t = translations[language];
    const isMultiple = config.type === SandboxComponentType.MULTIPLE_CHOICE;
    const selectedSet = new Set(
        Array.isArray(selected) ? selected : selected ? [selected] : []
    );

    return (
        <div>
            {config.question && (
                <div className="text-lg font-bold mb-4">
                    {config.question || (isPreview ? t.questionPreview : "")}
                </div>
            )}
            <div className="space-y-2">
                {config.options.map((option, index) => {
                    const isSelected = selectedSet.has(option.id);
                    const isCorrect = option.isCorrect;
                    const showCorrect = showAnswer && isCorrect;
                    const showWrong = showAnswer && isSelected && !isCorrect;

                    return (
                        <button
                            key={option.id}
                            onClick={() => !isPreview && onSelect?.(option.id)}
                            disabled={isPreview || showAnswer}
                            className={`w-full text-left p-3 border-2 transition-all flex items-center gap-3
                                ${
                                    isSelected && !showAnswer
                                        ? "border-theme bg-theme/10"
                                        : "border-gray-300"
                                }
                                ${
                                    showCorrect
                                        ? "border-green-500 bg-green-100"
                                        : ""
                                }
                                ${showWrong ? "border-red-500 bg-red-100" : ""}
                                ${
                                    !isPreview && !showAnswer
                                        ? "hover:border-theme hover:bg-gray-50"
                                        : ""
                                }
                            `}
                        >
                            <span
                                className={`w-6 h-6 flex items-center justify-center border-2 text-sm font-bold
                                ${isMultiple ? "rounded" : "rounded-full"}
                                ${
                                    isSelected
                                        ? "bg-theme text-white border-theme"
                                        : "border-gray-400"
                                }
                                ${
                                    showCorrect
                                        ? "bg-green-500 border-green-500 text-white"
                                        : ""
                                }
                                ${
                                    showWrong
                                        ? "bg-red-500 border-red-500 text-white"
                                        : ""
                                }
                            `}
                            >
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className="flex-1">
                                {option.text ||
                                    (isPreview
                                        ? t.optionPreview.replace(
                                              "{n}",
                                              String(index + 1)
                                          )
                                        : "")}
                            </span>
                            {showCorrect && (
                                <span className="text-green-600">✓</span>
                            )}
                            {showWrong && (
                                <span className="text-red-600">✗</span>
                            )}
                        </button>
                    );
                })}
            </div>
            {showAnswer && config.explanation && (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm">
                    <span className="font-bold">{t.explanation}: </span>
                    {config.explanation}
                </div>
            )}
        </div>
    );
};
