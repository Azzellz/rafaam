"use client";

/**
 * Matching Renderer
 * 配对题组件渲染器
 */

import React, { useState, useMemo } from "react";
import { MatchingComponentConfig } from "@/types/sandbox";
import { Language } from "@/types";
import { translations } from "@/i18n";

interface MatchingRendererProps {
    config: MatchingComponentConfig;
    matches?: Record<string, string>; // left id -> right id
    onMatch?: (leftId: string, rightId: string) => void;
    showAnswer?: boolean;
    isPreview?: boolean;
    language: Language;
}

// Helper function to shuffle array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const MatchingRenderer: React.FC<MatchingRendererProps> = ({
    config,
    matches = {},
    onMatch,
    showAnswer,
    isPreview,
    language,
}) => {
    const t = translations[language];
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

    const rightItems = useMemo(() => {
        if (config.shuffleRight) {
            return shuffleArray(config.pairs);
        }
        return config.pairs;
    }, [config.pairs, config.shuffleRight]);

    const handleLeftClick = (id: string) => {
        if (isPreview || showAnswer) return;
        setSelectedLeft(id);
    };

    const handleRightClick = (rightId: string) => {
        if (isPreview || showAnswer || !selectedLeft) return;
        onMatch?.(selectedLeft, rightId);
        setSelectedLeft(null);
    };

    return (
        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
                {config.pairs.map((pair, index) => {
                    const isSelected = selectedLeft === pair.id;
                    const matchedRight = matches[pair.id];
                    const isCorrect = showAnswer && matchedRight === pair.id;

                    return (
                        <button
                            key={pair.id}
                            onClick={() => handleLeftClick(pair.id)}
                            className={`w-full p-3 border-2 text-left transition-all
                                ${
                                    isSelected
                                        ? "border-theme bg-theme/10"
                                        : "border-gray-300"
                                }
                                ${
                                    isCorrect
                                        ? "border-green-500 bg-green-100"
                                        : ""
                                }
                                ${
                                    !isPreview && !showAnswer
                                        ? "hover:border-theme"
                                        : ""
                                }
                            `}
                        >
                            <span className="font-bold mr-2">{index + 1}.</span>
                            {pair.left ||
                                (isPreview
                                    ? t.leftItem.replace(
                                          "{n}",
                                          String(index + 1)
                                      )
                                    : "")}
                        </button>
                    );
                })}
            </div>
            <div className="space-y-2">
                {rightItems.map((pair, index) => {
                    const isMatched = Object.values(matches).includes(pair.id);

                    return (
                        <button
                            key={pair.id}
                            onClick={() => handleRightClick(pair.id)}
                            className={`w-full p-3 border-2 text-left transition-all
                                ${
                                    isMatched
                                        ? "border-gray-400 bg-gray-100"
                                        : "border-gray-300"
                                }
                                ${
                                    !isPreview && !showAnswer && selectedLeft
                                        ? "hover:border-theme"
                                        : ""
                                }
                            `}
                        >
                            <span className="font-bold mr-2">
                                {String.fromCharCode(65 + index)}.
                            </span>
                            {pair.right ||
                                (isPreview
                                    ? t.rightItem.replace(
                                          "{n}",
                                          String(index + 1)
                                      )
                                    : "")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
