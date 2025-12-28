"use client";

import React from "react";

export const PixelTooltip: React.FC<{
    content: string;
    children: React.ReactNode;
    className?: string;
}> = ({ content, children, className = "" }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-48 z-50 animate-fade-in pointer-events-none">
                    <div className="bg-white border-2 border-black p-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] text-sm text-center relative">
                        {content}
                        {/* Arrow border */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-black"></div>
                        {/* Arrow background to cover border overlap */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full -mt-[3px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

