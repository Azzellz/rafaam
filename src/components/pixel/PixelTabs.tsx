import React, { useState } from "react";

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

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="absolute -top-5 md:-top-6 left-2 md:left-4 flex flex-wrap gap-2 z-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`px-3 py-1 md:px-4 md:py-1 font-bold border-2 border-black transition-all text-sm md:text-base uppercase tracking-wider ${
                            activeTabId === tab.id
                                ? "bg-[var(--theme-color)] text-white shadow-[2px_2px_0_0_#000]"
                                : "bg-white text-gray-600 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_#ccc]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 pt-2">
                {tabs.find((t) => t.id === activeTabId)?.content}
            </div>
        </div>
    );
};
