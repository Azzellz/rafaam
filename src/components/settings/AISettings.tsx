import React, { useState, useEffect } from "react";
import { PixelButton, PixelInput } from "@/components/pixel";
import {
    getAIConfig,
    saveAIConfig,
    getApiBaseUrl,
    saveApiBaseUrl,
} from "@/services/storageService";
import { Language, AIConfig } from "@/types";
import { translations } from "@/i18n";

interface Props {
    language: Language;
}

export const AISettings: React.FC<Props> = ({ language }) => {
    const t = translations[language];
    const [config, setConfig] = useState<AIConfig>(getAIConfig());
    const [apiBaseUrl, setApiBaseUrl] = useState<string>(getApiBaseUrl());

    const handleSave = () => {
        saveAIConfig(config);
        saveApiBaseUrl(apiBaseUrl);
        alert(t.saved);
    };

    const handleChange = (key: keyof AIConfig, value: string | number) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl mb-4">{t.aiSettings}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-lg mb-2">{t.apiBaseUrl}</label>
                        <PixelInput
                            value={apiBaseUrl}
                            onChange={(e) => setApiBaseUrl(e.target.value)}
                            placeholder={t.apiBaseUrlPlaceholder}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.apiBaseUrlDesc}
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg mb-2">{t.defaultModel}</label>
                        <PixelInput
                            value={config.defaultModel}
                            onChange={(e) => handleChange("defaultModel", e.target.value)}
                            placeholder="gemini-2.0-flash"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.defaultModelDesc}
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg mb-2">{t.chatModel}</label>
                        <PixelInput
                            value={config.chatModel}
                            onChange={(e) => handleChange("chatModel", e.target.value)}
                            placeholder="gemini-2.0-flash"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.chatModelDesc}
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg mb-2">{t.conversationModel}</label>
                        <PixelInput
                            value={config.conversationModel}
                            onChange={(e) => handleChange("conversationModel", e.target.value)}
                            placeholder="gemini-2.0-flash-exp"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.conversationModelDesc}
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg mb-2">
                            {t.temperature}: {config.temperature}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={config.temperature}
                            onChange={(e) =>
                                handleChange("temperature", parseFloat(e.target.value))
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-theme"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.temperatureDesc}
                        </p>
                    </div>

                    <PixelButton onClick={handleSave}>{t.save}</PixelButton>
                </div>
            </div>
        </div>
    );
};
