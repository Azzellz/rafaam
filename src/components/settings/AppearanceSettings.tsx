import React, { useRef } from "react";
import { BackgroundConfig, Language } from "@/types";
import { PixelButton } from "@/components/pixel";
import { translations } from "@/i18n";
import { useAppStore } from "@/stores/useAppStore";
import { saveBackgroundConfig } from "@/services/storage";

interface Props {
    language: Language;
}

export const AppearanceSettings: React.FC<Props> = ({ language }) => {
    const t = translations[language];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { bgConfig, setBgConfig } = useAppStore();

    const handleConfigChange = (newConfig: BackgroundConfig) => {
        setBgConfig(newConfig);
        saveBackgroundConfig(newConfig);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            handleConfigChange({ ...bgConfig, imageData: base64 });
        };
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        handleConfigChange({
            imageData: null,
            blur: 0,
            overlayOpacity: 0.5,
            themeColor: "#4f46e5",
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const THEME_PRESETS = [
        "#4f46e5", // Indigo
        "#3b82f6", // Blue
        "#ef4444", // Red
        "#22c55e", // Green
        "#a855f7", // Purple
        "#f97316", // Orange
        "#ec4899", // Pink
        "#06b6d4", // Cyan
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Theme Color */}
            <div>
                <label className="block text-xl mb-2">{t.themeColor}</label>
                <div className="flex flex-wrap gap-3 mb-3">
                    {THEME_PRESETS.map((color) => (
                        <button
                            key={color}
                            onClick={() =>
                                handleConfigChange({
                                    ...bgConfig,
                                    themeColor: color,
                                })
                            }
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                                bgConfig.themeColor === color
                                    ? "border-black ring-2 ring-offset-2 ring-gray-400"
                                    : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="">{t.custom}:</span>
                    <input
                        type="color"
                        value={bgConfig.themeColor || "#4f46e5"}
                        onChange={(e) =>
                            handleConfigChange({
                                ...bgConfig,
                                themeColor: e.target.value,
                            })
                        }
                        className="h-8 w-16 cursor-pointer border-2 border-black p-0"
                    />
                </div>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-xl mb-2">{t.uploadImage}</label>
                <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="border-2 border-black border-dashed bg-gray-50 hover:bg-gray-100 p-3 text-center text-gray-600 truncate">
                            {bgConfig.imageData
                                ? "🖼️ Image Selected"
                                : t.noImage}
                        </div>
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.bgNote}</p>
            </div>

            {/* Blur Slider */}
            <div>
                <div className="flex justify-between text-xl mb-1">
                    <label>{t.blur}</label>
                    <span>{bgConfig.blur}px</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={bgConfig.blur}
                    onChange={(e) =>
                        handleConfigChange({
                            ...bgConfig,
                            blur: parseInt(e.target.value),
                        })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border-2 border-black accent-theme"
                />
            </div>

            {/* Opacity Slider */}
            <div>
                <div className="flex justify-between text-xl mb-1">
                    <label>{t.opacity}</label>
                    <span>{Math.round(bgConfig.overlayOpacity * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgConfig.overlayOpacity}
                    onChange={(e) =>
                        handleConfigChange({
                            ...bgConfig,
                            overlayOpacity: parseFloat(e.target.value),
                        })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border-2 border-black accent-theme"
                />
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t-2 border-dashed border-gray-300">
                <PixelButton
                    onClick={handleReset}
                    variant="danger"
                    className="w-full"
                >
                    {t.reset}
                </PixelButton>
            </div>
        </div>
    );
};
