/**
 * Fill Blank Renderer
 * 填空题组件渲染器
 */

import React from "react";
import { FillBlankComponentConfig } from "@/types/sandbox";
import { Language } from "@/types";
import { translations } from "@/i18n";

interface FillBlankRendererProps {
    config: FillBlankComponentConfig;
    answers?: Record<string, string>;
    onAnswer?: (blankId: string, value: string) => void;
    showAnswer?: boolean;
    isPreview?: boolean;
    language: Language;
}

export const FillBlankRenderer: React.FC<FillBlankRendererProps> = ({
    config,
    answers = {},
    onAnswer,
    showAnswer,
    isPreview,
    language,
}) => {
    const t = translations[language];
    const passage = config.passage || (isPreview ? t.blankPlaceholder : "");

    // 解析并渲染带空格的文章
    const renderPassage = () => {
        const parts = passage.split(/(\[BLANK_\d+\])/g);

        return parts.map((part, index) => {
            const match = part.match(/\[BLANK_(\d+)\]/);
            if (match) {
                const blankIndex = parseInt(match[1]);
                const blank = config.blanks[blankIndex];
                if (!blank) return <span key={index}>[___]</span>;

                const userAnswer = answers[blank.id] || "";
                const isCorrect =
                    showAnswer &&
                    userAnswer.toLowerCase() ===
                        blank.correctAnswer.toLowerCase();
                const isWrong = showAnswer && userAnswer && !isCorrect;

                if (blank.options && blank.options.length > 0) {
                    // 有选项的填空
                    return (
                        <select
                            key={index}
                            value={userAnswer}
                            onChange={(e) =>
                                onAnswer?.(blank.id, e.target.value)
                            }
                            disabled={isPreview || showAnswer}
                            className={`mx-1 px-2 py-1 border-2 border-b-4 border-black rounded
                                ${
                                    isCorrect
                                        ? "bg-green-100 border-green-500"
                                        : ""
                                }
                                ${isWrong ? "bg-red-100 border-red-500" : ""}
                            `}
                        >
                            <option value="">--</option>
                            {blank.options.map((opt, i) => (
                                <option key={i} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    );
                }

                // 无选项的填空
                return (
                    <input
                        key={index}
                        type="text"
                        value={userAnswer}
                        onChange={(e) => onAnswer?.(blank.id, e.target.value)}
                        disabled={isPreview || showAnswer}
                        placeholder="____"
                        className={`mx-1 w-24 px-2 py-1 border-b-2 border-black text-center
                            ${isCorrect ? "bg-green-100 border-green-500" : ""}
                            ${isWrong ? "bg-red-100 border-red-500" : ""}
                        `}
                    />
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div>
            <div className="text-lg leading-loose">{renderPassage()}</div>
            {showAnswer && (
                <div className="mt-4 p-3 bg-gray-100 border-l-4 border-gray-500">
                    <span className="font-bold">{t.answer}: </span>
                    {config.blanks.map((b, i) => (
                        <span key={b.id} className="mr-3">
                            {i + 1}. {b.correctAnswer}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
