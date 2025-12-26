import React from "react";
import { PixelButton, PixelInput } from "@/components/pixel";
import { CustomProviderConfig } from "@/services/ai/providers";
import { Language } from "@/types";
import { translations } from "@/i18n";

interface Props {
    editingCustom: CustomProviderConfig;
    onSave: () => void;
    onCancel: () => void;
    onFieldChange: <K extends keyof CustomProviderConfig>(
        key: K,
        value: CustomProviderConfig[K]
    ) => void;
    onModelChange: (key: "text" | "tts" | "live", value: string) => void;
    language: Language;
}

export const CustomProviderForm: React.FC<Props> = ({
    editingCustom,
    onSave,
    onCancel,
    onFieldChange,
    onModelChange,
    language,
}) => {
    const t = translations[language];

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h4 className="text-xl font-bold mb-4">
                    {editingCustom.name
                        ? t.editCustomProvider
                        : t.addCustomProvider}
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-lg mb-2">
                            {t.customProviderName}
                        </label>
                        <PixelInput
                            value={editingCustom.name}
                            onChange={(e) =>
                                onFieldChange("name", e.target.value)
                            }
                            placeholder={t.customProviderNamePlaceholder}
                        />
                    </div>

                    <div>
                        <label className="block text-lg mb-2">{t.apiKey}</label>
                        <PixelInput
                            value={editingCustom.apiKey}
                            onChange={(e) =>
                                onFieldChange("apiKey", e.target.value)
                            }
                            placeholder="sk-..."
                        />
                    </div>

                    <div>
                        <label className="block text-lg mb-2">
                            {t.apiBaseUrl}
                        </label>
                        <PixelInput
                            value={editingCustom.baseUrl}
                            onChange={(e) =>
                                onFieldChange("baseUrl", e.target.value)
                            }
                            placeholder="https://api.example.com/v1"
                        />
                    </div>

                    <div>
                        <label className="block text-lg mb-2">
                            {t.textModel}
                        </label>
                        <PixelInput
                            value={editingCustom.models.text}
                            onChange={(e) =>
                                onModelChange("text", e.target.value)
                            }
                            placeholder="gpt-4o"
                        />
                    </div>

                    <div>
                        <label className="block text-lg mb-2">
                            {t.ttsModel}
                        </label>
                        <PixelInput
                            value={editingCustom.models.tts}
                            onChange={(e) =>
                                onModelChange("tts", e.target.value)
                            }
                            placeholder="gpt-4o"
                        />
                    </div>

                    <div>
                        <label className="block text-lg mb-2">
                            {t.liveModel}
                        </label>
                        <PixelInput
                            value={editingCustom.models.live}
                            onChange={(e) =>
                                onModelChange("live", e.target.value)
                            }
                            placeholder="gpt-4o"
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <PixelButton onClick={onCancel}>{t.cancel}</PixelButton>
                        <PixelButton onClick={onSave}>{t.save}</PixelButton>
                    </div>
                </div>
            </div>
        </div>
    );
};
