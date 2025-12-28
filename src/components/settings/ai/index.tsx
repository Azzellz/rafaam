"use client";

import React, { useState, useEffect } from "react";
import { PixelButton, PixelTabs, PixelTab } from "@/components/pixel";
import { getAIProviderConfig, saveAIProviderConfig } from "@/services/storage";
import { Language } from "@/types";
import { translations } from "@/i18n";
import { showAlert, showConfirm } from "@/stores/useDialogStore";
import {
    AIProviderConfig,
    AIProviderType,
    CustomProviderConfig,
    ProviderModelConfig,
} from "@/services/ai/providers";
import { AIProviderFactory } from "@/services/ai";
import { ModelType } from "./types";
import { CustomProviderManager } from "./CustomProviderManager";
import { CustomProviderForm } from "./CustomProviderForm";
import { ModelConfigSection } from "./ModelConfigSection";

interface Props {
    language: Language;
}

export const AISettings: React.FC<Props> = ({ language }) => {
    const t = translations[language];
    const [config, setConfig] = useState<AIProviderConfig | null>(null);
    const [showApiKeys, setShowApiKeys] = useState<Record<ModelType, boolean>>({
        text: false,
        tts: false,
        live: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [editingCustom, setEditingCustom] =
        useState<CustomProviderConfig | null>(null);
    const [showCustomForm, setShowCustomForm] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const loadedConfig = await getAIProviderConfig();
                if (loadedConfig) {
                    // 确保 TTS 配置有默认的 Edge TTS 设置（向后兼容）
                    if (loadedConfig.tts && !loadedConfig.tts.edgeTTSConfig) {
                        loadedConfig.tts.edgeTTSConfig = {
                            rate: 1.0,
                            pitch: "medium",
                            volume: 100,
                            preferredGender: "Female",
                        };
                    }
                    setConfig(loadedConfig);
                } else {
                    // 初始化空配置
                    setConfig({
                        text: {
                            type: AIProviderType.GEMINI,
                            apiKey: "",
                            model: "",
                        },
                        tts: {
                            type: AIProviderType.GEMINI,
                            apiKey: "",
                            model: "",
                            useEdgeTTS: true, // 默认启用 Edge TTS
                            edgeTTSConfig: {
                                rate: 1.0,
                                pitch: "medium",
                                volume: 100,
                                preferredGender: "Female",
                            },
                        },
                        live: {
                            type: AIProviderType.GEMINI,
                            apiKey: "",
                            model: "",
                        },
                        customProviders: [],
                    });
                }
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
            await saveAIProviderConfig(config);
            AIProviderFactory.resetProvider();
            showAlert(t.saved, undefined, language);
        } catch (error) {
            console.error("Failed to save settings", error);
            showAlert(t.saveFailed, undefined, language);
        }
    };

    const updateModelConfig = (
        modelType: ModelType,
        updates: Partial<ProviderModelConfig>
    ) => {
        if (!config) return;
        setConfig({
            ...config,
            [modelType]: {
                ...config[modelType],
                ...updates,
            },
        });
    };

    // Custom Provider Management
    const handleAddCustomProvider = () => {
        const newCustom: CustomProviderConfig = {
            id: Date.now().toString(),
            name: "",
            apiKey: "",
            baseUrl: "",
            temperature: 1.0,
        };
        setEditingCustom(newCustom);
        setShowCustomForm(true);
    };

    const handleEditCustomProvider = (custom: CustomProviderConfig) => {
        setEditingCustom({ ...custom });
        setShowCustomForm(true);
    };

    const handleDeleteCustomProvider = (id: string) => {
        showConfirm(
            t.deleteCustomProvider + "?",
            () => {
                if (config) {
                    const updatedCustoms = config.customProviders?.filter(
                        (cp) => cp.id !== id
                    );
                    const newConfig = {
                        ...config,
                        customProviders: updatedCustoms,
                    };

                    // 如果删除的是正在使用的provider，清除相关引用
                    if (config.text.selectedCustomId === id) {
                        newConfig.text = {
                            ...newConfig.text,
                            selectedCustomId: undefined,
                        };
                    }
                    if (config.tts.selectedCustomId === id) {
                        newConfig.tts = {
                            ...newConfig.tts,
                            selectedCustomId: undefined,
                        };
                    }
                    if (config.live.selectedCustomId === id) {
                        newConfig.live = {
                            ...newConfig.live,
                            selectedCustomId: undefined,
                        };
                    }

                    setConfig(newConfig);
                }
            },
            undefined,
            undefined,
            language
        );
    };

    const handleSaveCustomProvider = () => {
        if (!editingCustom || !config) return;

        if (!editingCustom.name.trim()) {
            showAlert(t.customProviderNamePlaceholder, undefined, language);
            return;
        }

        const existingIndex = config.customProviders?.findIndex(
            (cp) => cp.id === editingCustom.id
        );

        let updatedCustoms: CustomProviderConfig[];
        if (existingIndex !== undefined && existingIndex >= 0) {
            updatedCustoms = [...(config.customProviders || [])];
            updatedCustoms[existingIndex] = editingCustom;
        } else {
            updatedCustoms = [...(config.customProviders || []), editingCustom];
        }

        setConfig({
            ...config,
            customProviders: updatedCustoms,
        });

        setShowCustomForm(false);
        setEditingCustom(null);
    };

    const handleCancelCustomEdit = () => {
        setShowCustomForm(false);
        setEditingCustom(null);
    };

    const updateCustomField = <K extends keyof CustomProviderConfig>(
        key: K,
        value: CustomProviderConfig[K]
    ) => {
        if (editingCustom) {
            setEditingCustom({ ...editingCustom, [key]: value });
        }
    };

    const toggleApiKeyVisibility = (modelType: ModelType) => {
        setShowApiKeys((prev) => ({
            ...prev,
            [modelType]: !prev[modelType],
        }));
    };

    const getCustomProviderOptions = () => {
        if (!config?.customProviders) return [];
        return config.customProviders.map((cp) => ({
            value: cp.id,
            label: cp.name,
        }));
    };

    if (isLoading || !config) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl mb-4">{t.aiSettings}</h3>

                {/* 自定义Provider编辑表单 */}
                {showCustomForm && editingCustom && (
                    <CustomProviderForm
                        editingCustom={editingCustom}
                        onSave={handleSaveCustomProvider}
                        onCancel={handleCancelCustomEdit}
                        onFieldChange={updateCustomField}
                        language={language}
                    />
                )}

                {/* 四个独立的配置区 - 使用Tabs */}
                <div className="mb-6">
                    <PixelTabs
                        tabs={[
                            {
                                id: "custom",
                                label: t.customProviders,
                                content: (
                                    <div className="py-2">
                                        <p className="text-sm text-gray-500 mb-4">
                                            {t.customProvidersDesc}
                                        </p>
                                        <CustomProviderManager
                                            customProviders={
                                                config.customProviders
                                            }
                                            onAdd={handleAddCustomProvider}
                                            onEdit={handleEditCustomProvider}
                                            onDelete={
                                                handleDeleteCustomProvider
                                            }
                                            language={language}
                                        />
                                    </div>
                                ),
                            },
                            {
                                id: "text",
                                label: t.textModel,
                                content: (
                                    <ModelConfigSection
                                        modelType="text"
                                        title={t.textModel}
                                        description={t.textModelDesc}
                                        modelConfig={config.text}
                                        customProviderOptions={getCustomProviderOptions()}
                                        showApiKey={showApiKeys.text}
                                        onProviderChange={(updates) =>
                                            updateModelConfig("text", updates)
                                        }
                                        onToggleApiKey={() =>
                                            toggleApiKeyVisibility("text")
                                        }
                                        language={language}
                                    />
                                ),
                            },
                            {
                                id: "tts",
                                label: t.ttsModel,
                                content: (
                                    <ModelConfigSection
                                        modelType="tts"
                                        title={t.ttsModel}
                                        description={t.ttsModelDesc}
                                        modelConfig={config.tts}
                                        customProviderOptions={getCustomProviderOptions()}
                                        showApiKey={showApiKeys.tts}
                                        onProviderChange={(updates) =>
                                            updateModelConfig("tts", updates)
                                        }
                                        onToggleApiKey={() =>
                                            toggleApiKeyVisibility("tts")
                                        }
                                        language={language}
                                    />
                                ),
                            },
                            {
                                id: "live",
                                label: t.liveModel,
                                content: (
                                    <ModelConfigSection
                                        modelType="live"
                                        title={t.liveModel}
                                        description={t.liveModelDesc}
                                        modelConfig={config.live}
                                        customProviderOptions={getCustomProviderOptions()}
                                        showApiKey={showApiKeys.live}
                                        onProviderChange={(updates) =>
                                            updateModelConfig("live", updates)
                                        }
                                        onToggleApiKey={() =>
                                            toggleApiKeyVisibility("live")
                                        }
                                        language={language}
                                    />
                                ),
                            },
                        ]}
                        defaultTabId="custom"
                    />
                </div>

                {/* 保存按钮 */}
                <div className="flex justify-end mt-6">
                    <PixelButton onClick={handleSave}>{t.save}</PixelButton>
                </div>
            </div>
        </div>
    );
};
