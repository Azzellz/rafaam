import React from "react";
import { Language } from "@/types";
import { translations } from "@/components/i18n";

interface Props {
    language: Language;
}

export const LoadingSprite: React.FC<Props> = ({ language }) => {
    const t = translations[language];
    return (
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh] w-full">
            {/* Simple CSS-only animated pixel blob */}
            <div className="relative w-16 h-16 animate-bounce">
                <div className="absolute inset-0 bg-[#3b82f6] shadow-[4px_4px_0_0_#000] border-2 border-black"></div>
                <div className="absolute top-2 left-2 w-4 h-4 bg-white border border-black"></div>
                <div className="absolute top-2 right-2 w-4 h-4 bg-white border border-black"></div>
                <div className="absolute bottom-3 left-4 right-4 h-2 bg-black"></div>
            </div>
            <p className="font-['VT323'] text-2xl text-slate-600 animate-pulse">
                {t.generating}
            </p>
        </div>
    );
};
