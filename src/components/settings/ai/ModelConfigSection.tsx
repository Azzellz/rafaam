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
    const isTTS = modelType === "tts";
    const useEdgeTTS = modelConfig.useEdgeTTS || false;

    return (
        <div className="space-y-4 py-2">
            <div>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            {/* TTS专用：EdgeTTS选项 */}
            {isTTS && (
                <div className="border-2 border-black p-4 bg-blue-50 space-y-4">
                    <div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useEdgeTTS}
                                onChange={(e) =>
                                    onProviderChange({
                                        useEdgeTTS: e.target.checked,
                                    })
                                }
                                className="w-5 h-5 border-2 border-black cursor-pointer"
                            />
                            <span className="ml-3 text-lg font-bold">
                                {t.useEdgeTTS}
                            </span>
                        </label>
                        <p className="text-sm text-gray-600 mt-2 ml-8">
                            {t.useEdgeTTSDesc}
                        </p>
                    </div>

                    {/* Edge TTS 详细配置 */}
                    {useEdgeTTS && (
                        <div className="ml-8 space-y-4 border-l-4 border-blue-300 pl-4">
                            {/* 性别偏好 */}
                            <div>
                                <label className="block text-base mb-2 font-semibold">
                                    {t.edgeTTSGender}
                                </label>
                                <PixelSelect
                                    value={
                                        modelConfig.edgeTTSConfig
                                            ?.preferredGender || "Female"
                                    }
                                    onChange={(value) =>
                                        onProviderChange({
                                            edgeTTSConfig: {
                                                rate: 1.0,
                                                pitch: "medium",
                                                volume: 100,
                                                ...modelConfig.edgeTTSConfig,
                                                preferredGender: value as
                                                    | "Male"
                                                    | "Female",
                                            },
                                        })
                                    }
                                    options={[
                                        { value: "Female", label: t.female },
                                        { value: "Male", label: t.male },
                                    ]}
                                />
                            </div>

                            {/* 语速 */}
                            <div>
                                <label className="block text-base mb-2 font-semibold">
                                    {t.edgeTTSRate}:{" "}
                                    {(
                                        modelConfig.edgeTTSConfig?.rate || 1.0
                                    ).toFixed(1)}
                                    x
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={
                                        modelConfig.edgeTTSConfig?.rate || 1.0
                                    }
                                    onChange={(e) =>
                                        onProviderChange({
                                            edgeTTSConfig: {
                                                pitch: "medium",
                                                volume: 100,
                                                preferredGender: "Female",
                                                ...modelConfig.edgeTTSConfig,
                                                rate: parseFloat(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    {t.edgeTTSRateDesc}
                                </p>
                            </div>

                            {/* 音调 */}
                            <div>
                                <label className="block text-base mb-2 font-semibold">
                                    {t.edgeTTSPitch}
                                </label>
                                <PixelSelect
                                    value={
                                        modelConfig.edgeTTSConfig?.pitch ||
                                        "medium"
                                    }
                                    onChange={(value) =>
                                        onProviderChange({
                                            edgeTTSConfig: {
                                                rate: 1.0,
                                                volume: 100,
                                                preferredGender: "Female",
                                                ...modelConfig.edgeTTSConfig,
                                                pitch: value,
                                            },
                                        })
                                    }
                                    options={[
                                        { value: "x-low", label: t.veryLow },
                                        { value: "low", label: t.low },
                                        { value: "medium", label: t.medium },
                                        { value: "high", label: t.high },
                                        { value: "x-high", label: t.veryHigh },
                                    ]}
                                />
                            </div>

                            {/* 音量 */}
                            <div>
                                <label className="block text-base mb-2 font-semibold">
                                    {t.edgeTTSVolume}:{" "}
                                    {modelConfig.edgeTTSConfig?.volume || 100}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={
                                        modelConfig.edgeTTSConfig?.volume || 100
                                    }
                                    onChange={(e) =>
                                        onProviderChange({
                                            edgeTTSConfig: {
                                                rate: 1.0,
                                                pitch: "medium",
                                                preferredGender: "Female",
                                                ...modelConfig.edgeTTSConfig,
                                                volume: parseInt(
                                                    e.target.value
                                                ),
                                            },
                                        })
                                    }
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    {t.edgeTTSVolumeDesc}
                                </p>
                            </div>

                            {/* 自定义语音（可选） */}
                            <div>
                                <label className="block text-base mb-2 font-semibold">
                                    {t.edgeTTSVoice}
                                </label>
                                <PixelInput
                                    value={
                                        modelConfig.edgeTTSConfig?.voice || ""
                                    }
                                    onChange={(e) =>
                                        onProviderChange({
                                            edgeTTSConfig: {
                                                rate: 1.0,
                                                pitch: "medium",
                                                volume: 100,
                                                preferredGender: "Female",
                                                ...modelConfig.edgeTTSConfig,
                                                voice: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="en-US-AvaNeural, zh-CN-XiaoxiaoNeural..."
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    {t.edgeTTSVoiceDesc}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 如果启用了EdgeTTS，隐藏模型配置 */}
            {!(isTTS && useEdgeTTS) && (
                <>
                    {/* Provider类型选择 */}
                    <div>
                        <label className="block text-lg mb-2">
                            {t.aiProvider}
                        </label>
                        <PixelSelect
                            value={modelConfig.type}
                            onChange={(value) =>
                                onProviderChange({
                                    type: value as AIProviderType,
                                })
                            }
                            options={Object.values(AIProviderType).map(
                                (type) => ({
                                    value: type,
                                    label: getProviderLabel(type, t),
                                })
                            )}
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
                                    onProviderChange({
                                        selectedCustomId: value,
                                    })
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
                            <label className="block text-lg mb-2">
                                {t.apiKey}
                            </label>
                            <div className="relative">
                                <PixelInput
                                    type={showApiKey ? "text" : "password"}
                                    value={modelConfig.apiKey}
                                    onChange={(e) =>
                                        onProviderChange({
                                            apiKey: e.target.value,
                                        })
                                    }
                                    placeholder="sk-..."
                                    className="pr-20"
                                />
                                <button
                                    type="button"
                                    onClick={onToggleApiKey}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors rounded"
                                >
                                    {showApiKey ? t.hide : t.show}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Base URL (OpenAI/Anthropic/非自定义才显示) */}
                    {modelConfig.type !== AIProviderType.GEMINI &&
                        modelConfig.type !== AIProviderType.CUSTOM && (
                            <div>
                                <label className="block text-lg mb-2">
                                    {t.apiBaseUrl}
                                </label>
                                <PixelInput
                                    value={modelConfig.baseUrl || ""}
                                    onChange={(e) =>
                                        onProviderChange({
                                            baseUrl: e.target.value,
                                        })
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
                        <label className="block text-lg mb-2">
                            {t.modelName}
                        </label>
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
                            Temperature:{" "}
                            {modelConfig.temperature?.toFixed(1) || "1.0"}
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
                        <label className="block text-lg mb-2">
                            {t.maxTokens}
                        </label>
                        <PixelInput
                            type="number"
                            value={modelConfig.maxTokens?.toString() || ""}
                            onChange={(e) =>
                                onProviderChange({
                                    maxTokens:
                                        parseInt(e.target.value) || undefined,
                                })
                            }
                            placeholder="4096"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.maxTokensDesc}
                        </p>
                    </div>

                    {/* 自定义系统提示词 */}
                    <div>
                        <label className="block text-lg mb-2 font-bold">
                            {t.systemPrompt}
                        </label>
                        <textarea
                            value={modelConfig.systemPrompt || ""}
                            onChange={(e) =>
                                onProviderChange({
                                    systemPrompt: e.target.value,
                                })
                            }
                            placeholder={t.systemPromptPlaceholder}
                            rows={4}
                            className="w-full px-4 py-2 border-2 border-black font-mono text-sm resize-y"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t.systemPromptDesc}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};
