/**
 * Ordering Renderer
 * 排序题组件渲染器
 */

import React from "react";
import { OrderingComponentConfig } from "@/types/sandbox";
import { Language } from "@/types";
import { translations } from "@/i18n";

interface OrderingRendererProps {
    config: OrderingComponentConfig;
    currentOrder?: string[];
    onReorder?: (newOrder: string[]) => void;
    showAnswer?: boolean;
    isPreview?: boolean;
    language: Language;
}

export const OrderingRenderer: React.FC<OrderingRendererProps> = ({
    config,
    currentOrder,
    onReorder,
    showAnswer,
    isPreview,
    language,
}) => {
    const t = translations[language];
    const items = currentOrder
        ? currentOrder.map((id) => config.items.find((i) => i.id === id)!)
        : config.items;

    const handleMoveUp = (index: number) => {
        if (index === 0 || isPreview || showAnswer) return;
        const newOrder = items.map((i) => i.id);
        [newOrder[index], newOrder[index - 1]] = [
            newOrder[index - 1],
            newOrder[index],
        ];
        onReorder?.(newOrder);
    };

    const handleMoveDown = (index: number) => {
        if (index === items.length - 1 || isPreview || showAnswer) return;
        const newOrder = items.map((i) => i.id);
        [newOrder[index], newOrder[index + 1]] = [
            newOrder[index + 1],
            newOrder[index],
        ];
        onReorder?.(newOrder);
    };

    return (
        <div className="space-y-2">
            {items.map((item, index) => {
                if (!item) return null;
                const correctOrder =
                    showAnswer &&
                    config.items.findIndex((i) => i.id === item.id) ===
                        item.order - 1;

                return (
                    <div
                        key={item.id}
                        className={`flex items-center gap-2 p-3 border-2 transition-all
                            ${
                                correctOrder
                                    ? "border-green-500 bg-green-100"
                                    : "border-gray-300"
                            }
                        `}
                    >
                        <span className="font-bold text-gray-500 w-6">
                            {index + 1}.
                        </span>
                        <span className="flex-1">
                            {item.text ||
                                (isPreview
                                    ? t.itemPreview.replace(
                                          "{n}",
                                          String(index + 1)
                                      )
                                    : "")}
                        </span>
                        {!isPreview && !showAnswer && (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    className="px-2 py-1 border border-gray-300 disabled:opacity-30"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === items.length - 1}
                                    className="px-2 py-1 border border-gray-300 disabled:opacity-30"
                                >
                                    ↓
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
            {showAnswer && (
                <div className="mt-4 p-3 bg-gray-100 border-l-4 border-gray-500">
                    <span className="font-bold">{t.correctOrder}: </span>
                    {config.items
                        .sort((a, b) => a.order - b.order)
                        .map((i, idx) => (
                            <span key={i.id}>
                                {idx + 1}. {i.text}
                                {idx < config.items.length - 1 ? " → " : ""}
                            </span>
                        ))}
                </div>
            )}
        </div>
    );
};
