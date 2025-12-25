import React from "react";
import { CustomContentData, Language } from "@/types";
import { PixelCard, PixelButton } from "@/components/pixel";
import { translations } from "@/i18n";

interface CustomViewProps {
    data: CustomContentData;
    onBack: () => void;
    language: Language;
}

export const CustomView: React.FC<CustomViewProps> = ({
    data,
    onBack,
    language,
}) => {
    const { title, items, definition } = data;
    const t = translations[language];

    return (
        <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in pb-24">
            <div className="flex items-center mb-6">
                <PixelButton onClick={onBack} className="mr-4">
                    ← {t.backToGenerator}
                </PixelButton>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white font-vt323">
                    {title}
                </h1>
            </div>

            <div className="grid gap-6">
                {items.map((item, index) => (
                    <PixelCard key={index} className="relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-theme text-white border-2 border-black flex items-center justify-center font-bold shadow-[2px_2px_0_0_#000]">
                            {index + 1}
                        </div>
                        <div className="space-y-4 mt-2">
                            {definition.fields.map((field) => (
                                <div
                                    key={field.key}
                                    className="border-b-2 border-dashed border-gray-200 last:border-0 pb-2 last:pb-0"
                                >
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                        {field.label}
                                    </span>
                                    <div className="text-lg md:text-xl text-gray-800">
                                        {item[field.key] || "—"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PixelCard>
                ))}
            </div>
        </div>
    );
};
