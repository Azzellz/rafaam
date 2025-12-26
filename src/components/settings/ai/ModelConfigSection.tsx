import React from "react";
import { PixelButton, PixelInput, PixelSelect } from "@/components/pixel";
import { AIProviderType, ProviderModelConfig } from "@/services/ai/providers";
import { Language } from "@/types";
import { translations } from "@/i18n";
import { ModelType } from "./types";
import { getProviderLabel, getModelPlaceholder } from "./utils";

interface Props {
    modelType: ModelType;
    title: string;
    description: string;
    modelConfig: ProviderModelConfig;
    customProviderOptions: { value: string; label: string }[];
    showApiKey: boolean;
    onProviderChange: (updates: Partial<ProviderModelConfig>) => void;
    onToggleApiKey: () => void;
    language: Language;
}

export const ModelConfigSection: React.FC<Props> = ({
    modelType,
    title,
    description,
    modelConfig,
    customProviderOptions,
    showApiKey,
    onProviderChange,
    onToggleApiKey,
    language,
}) => {
    const t = translations[language];

    return (
        <div className="border-2 border-gray-300 rounded p-4 space-y-4">
            <div>
                <h4 className="text-xl font-bold mb-1">{title}</h4>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            {/* Provider类型选择 */}
            <div>
                <label className="block text-lg mb-2">{t.aiProvider}</label>
                <PixelSelect
                    value={modelConfig.type}
                    onChange={(value) =>
                        onProviderChange({ type: value as AIProviderType })
                    }
                    options={Object.values(AIProviderType).map((type) => ({
                        value: type,
                        label: getProviderLabel(type, t),
                    }))}
                />
            </div>

            {/* 如果是自定义类型，显示自定义Provider选择 */}
            {modelConfig.type === AIProviderType.CUSTOM && (
                <div>
                    <label className="block text-lg mb-2">
                        {t.selectCustomProvider}
                    </label>
                    <PixelSelect
                        value={modelConfig.selectedCustomId || ""}
                        onChange={(value) =>
                            onProviderChange({ selectedCustomId: value })
                        }
                        options={[
                            {
                                value: "",
                                label: t.selectCustomProviderPlaceholder,
                            },
                            ...customProviderOptions,
                        ]}
                    />
                </div>
            )}

            {/* API Key (非自定义Provider才显示) */}
            {modelConfig.type !== AIProviderType.CUSTOM && (
                <div>
                    <label className="block text-lg mb-2">API Key</label>
                    <div className="flex gap-2">
                        <PixelInput
                            type={showApiKey ? "text" : "password"}
                            value={modelConfig.apiKey}
                            onChange={(e) =>
                                onProviderChange({ apiKey: e.target.value })
                            }
                            placeholder="sk-..."
                        />
                        <PixelButton onClick={onToggleApiKey}>
                            {showApiKey ? "🙈" : "👁️"}
                        </PixelButton>
                    </div>
                </div>
            )}

            {/* Base URL (OpenAI/Anthropic/非自定义才显示) */}
            {modelConfig.type !== AIProviderType.GEMINI &&
                modelConfig.type !== AIProviderType.CUSTOM && (
                    <div>
                        <label className="block text-lg mb-2">Base URL</label>
                        <PixelInput
                            value={modelConfig.baseUrl || ""}
                            onChange={(e) =>
                                onProviderChange({ baseUrl: e.target.value })
                            }
                            placeholder="https://api.openai.com/v1"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.baseUrlDesc}
                        </p>
                    </div>
                )}

            {/* 模型名称 */}
            <div>
                <label className="block text-lg mb-2">{t.modelName}</label>
                <PixelInput
                    value={modelConfig.model}
                    onChange={(e) =>
                        onProviderChange({ model: e.target.value })
                    }
                    placeholder={getModelPlaceholder(
                        modelConfig.type,
                        modelType
                    )}
                />
            </div>

            {/* Temperature */}
            <div>
                <label className="block text-lg mb-2">
                    Temperature: {modelConfig.temperature?.toFixed(1) || "1.0"}
                </label>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={modelConfig.temperature || 1.0}
                    onChange={(e) =>
                        onProviderChange({
                            temperature: parseFloat(e.target.value),
                        })
                    }
                    className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                    {t.temperatureDesc}
                </p>
            </div>

            {/* Max Tokens */}
            <div>
                <label className="block text-lg mb-2">{t.maxTokens}</label>
                <PixelInput
                    type="number"
                    value={modelConfig.maxTokens?.toString() || ""}
                    onChange={(e) =>
                        onProviderChange({
                            maxTokens: parseInt(e.target.value) || undefined,
                        })
                    }
                    placeholder="4096"
                />
                <p className="text-sm text-gray-500 mt-1">{t.maxTokensDesc}</p>
            </div>
        </div>
    );
};
