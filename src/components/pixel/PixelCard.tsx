import React from "react";

export const PixelCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    title?: string;
}> = ({ children, className = "", title }) => {
    return (
        <div
            className={`bg-white border-2 md:border-4 border-black shadow-[4px_4px_0_0_#cbd5e1] md:shadow-[8px_8px_0_0_#cbd5e1] p-4 md:p-6 relative ${className}`}
        >
            {title && (
                <div className="absolute -top-4 md:-top-5 left-2 md:left-4 bg-[var(--theme-color)] text-white px-3 py-0.5 md:px-4 md:py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">
                    <span className="text-lg md:text-xl uppercase tracking-wider">
                        {title}
                    </span>
                </div>
            )}
            <div className="mb-2"></div>
            {children}
        </div>
    );
};
