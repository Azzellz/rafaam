"use client";

import React, { useState, useRef, useEffect } from "react";

export interface PixelTab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface PixelTabsProps {
    tabs: PixelTab[];
    defaultTabId?: string;
    className?: string;
}

export const PixelTabs: React.FC<PixelTabsProps> = ({
    tabs,
    defaultTabId,
    className = "",
}) => {
    const [activeTabId, setActiveTabId] = useState(
        defaultTabId || (tabs && tabs[0]?.id)
    );
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const updateArrowVisibility = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        updateArrowVisibility();
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => updateArrowVisibility();
        container.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", updateArrowVisibility);

        return () => {
            container.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", updateArrowVisibility);
        };
    }, [tabs]);

    const scroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 200;
        const targetScroll =
            direction === "left"
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: targetScroll,
            behavior: "smooth",
        });
    };

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="absolute -top-5 md:-top-6 left-2 md:left-4 right-2 md:right-4 z-10 flex items-center pb-2">
                {/* 左箭头 */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll("left")}
                        className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-black flex items-center justify-center hover:bg-gray-100 shadow-[2px_2px_0_0_#000] mr-2 transition-all hover:-translate-y-0.5"
                        aria-label="向左滚动"
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            className="text-black"
                        >
                            <path
                                d="M8 2L4 6L8 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="square"
                            />
                        </svg>
                    </button>
                )}

                {/* 标签滚动容器 */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide py-1"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        overflowY: "visible",
                    }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`flex-shrink-0 px-3 py-1 md:px-4 md:py-1 font-bold border-2 border-black transition-all text-sm md:text-base uppercase tracking-wider ${
                                activeTabId === tab.id
                                    ? "bg-[var(--theme-color)] text-white shadow-[2px_2px_0_0_#000]"
                                    : "bg-white text-gray-600 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_#ccc]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 右箭头 */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll("right")}
                        className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-black flex items-center justify-center hover:bg-gray-100 shadow-[2px_2px_0_0_#000] ml-2 transition-all hover:-translate-y-0.5"
                        aria-label="向右滚动"
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            className="text-black"
                        >
                            <path
                                d="M4 2L8 6L4 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="square"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex-1 pt-2">
                {tabs.find((t) => t.id === activeTabId)?.content}
            </div>
        </div>
    );
};
