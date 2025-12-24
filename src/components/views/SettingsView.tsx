import React, { useState } from "react";
import { Language } from "@/types";
import { PixelButton, PixelCard } from "@/components/layout/PixelUI";
import { translations } from "@/components/i18n";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";

interface Props {
    language: Language;
    onBack: () => void;
}

type SettingsTab = "appearance" | "general";

export const SettingsView: React.FC<Props> = ({ language, onBack }) => {
    const t = translations[language];
    const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");

    const tabs: { id: SettingsTab; label: string; icon: string }[] = [
        { id: "appearance", label: t.bgSettings, icon: "🎨" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-['DotGothic16'] text-[#facc15] drop-shadow-[2px_2px_0_#000] text-stroke-black">
                    {t.settings}
                </h2>
                <PixelButton
                    onClick={onBack}
                    variant="secondary"
                    className="text-sm"
                >
                    {t.backToGenerator}
                </PixelButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 font-['VT323'] text-xl border-2 transition-all ${
                                activeTab === tab.id
                                    ? "bg-[#3b82f6] text-white border-black shadow-[2px_2px_0_#000]"
                                    : "bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:border-gray-200"
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    <PixelCard>
                        {activeTab === "appearance" && (
                            <AppearanceSettings language={language} />
                        )}
                    </PixelCard>
                </div>
            </div>
        </div>
    );
};
