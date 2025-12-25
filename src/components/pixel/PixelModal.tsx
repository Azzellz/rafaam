import React from "react";
import { PixelCard } from "./PixelCard";

interface PixelModalProps {
    isOpen?: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const PixelModal: React.FC<PixelModalProps> = ({
    isOpen = true,
    onClose,
    title,
    children,
    className = "",
    noPadding = false,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className={`w-full max-w-2xl max-h-[90vh] flex flex-col mt-6 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <PixelCard
                    className="flex-1 flex flex-col min-h-0"
                    title={title}
                    noPadding={noPadding}
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-red-500 text-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-red-600 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all z-20"
                        aria-label="Close"
                    >
                        <span className="text-xl md:text-2xl font-bold leading-none mb-1">
                            ×
                        </span>
                    </button>
                    {children}
                </PixelCard>
            </div>
        </div>
    );
};
