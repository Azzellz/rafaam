import React, { useState, useEffect } from "react";
import { PixelButton, PixelInput } from "@/components/pixel";
import {
    getAIConfig,
    saveAIConfig,
    getApiBaseUrl,
    saveApiBaseUrl,
    getApiKey,
    saveApiKey,
} from "@/services/storage";
import { Language, AIConfig } from "@/types";
import { translations } from "@/i18n";
import { showAlert } from "@/stores/useDialogStore";

interface Props {
    language: Language;
}

export const AISettings: React.FC<Props> = ({ language }) => {
    const t = translations[language];
    const [config, setConfig] = useState<AIConfig | null>(null);
    const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
    const [apiKey, setApiKey] = useState<string>("");
    const [showApiKey, setShowApiKey] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [loadedConfig, loadedUrl, loadedKey] = await Promise.all([
                    getAIConfig(),
                    getApiBaseUrl(),
                    getApiKey(),
                ]);
                setConfig(loadedConfig);
                setApiBaseUrl(loadedUrl);
                setApiKey(loadedKey);
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        if (!config) return;
        try {
            await Promise.all([
                saveAIConfig(config),
                saveApiBaseUrl(apiBaseUrl),
                saveApiKey(apiKey),
            ]);
            showAlert(t.saved, undefined, language);
        } catch (error) {
            console.error("Failed to save settings", error);
            showAlert("Failed to save settings", undefined, language);
        }
    };

    const handleChange = (key: keyof AIConfig, value: string | number) => {
        setConfig((prev) => (prev ? { ...prev, [key]: value } : null));
    };

    if (isLoading || !config) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl mb-4">{t.aiSettings}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-lg mb-2">{t.apiKey}</label>
                        <div className="relative">
                            <PixelInput
                                type={showApiKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={t.apiKeyPlaceholder}
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showApiKey ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                            clipRule="evenodd"
                                        />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {t.apiKeyDesc}
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg mb-2">
                            {t.apiBaseUrl}
                        </label>
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
                        <label className="block text-lg mb-2">
                            {t.defaultModel}
                        </label>
                        <PixelInput
                            value={config.defaultModel}
                            onChange={(e) =>
                                handleChange("defaultModel", e.target.value)
                            }
                            placeholder="gemini-2.0-flash"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.defaultModelDesc}
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg mb-2">
                            {t.chatModel}
                        </label>
                        <PixelInput
                            value={config.chatModel}
                            onChange={(e) =>
                                handleChange("chatModel", e.target.value)
                            }
                            placeholder="gemini-2.0-flash"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.chatModelDesc}
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg mb-2">
                            {t.conversationModel}
                        </label>
                        <PixelInput
                            value={config.conversationModel}
                            onChange={(e) =>
                                handleChange(
                                    "conversationModel",
                                    e.target.value
                                )
                            }
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
                                handleChange(
                                    "temperature",
                                    parseFloat(e.target.value)
                                )
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
