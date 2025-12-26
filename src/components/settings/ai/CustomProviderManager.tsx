import React from "react";
import { PixelButton } from "@/components/pixel";
import { CustomProviderConfig } from "@/services/ai/providers";
import { Language } from "@/types";
import { translations } from "@/i18n";

interface Props {
    customProviders?: CustomProviderConfig[];
    onAdd: () => void;
    onEdit: (custom: CustomProviderConfig) => void;
    onDelete: (id: string) => void;
    language: Language;
}

export const CustomProviderManager: React.FC<Props> = ({
    customProviders,
    onAdd,
    onEdit,
    onDelete,
    language,
}) => {
    const t = translations[language];

    return (
        <div className="border-2 border-dashed border-gray-300 p-4 rounded space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <label className="text-lg font-bold">
                        {t.customProviders}
                    </label>
                    <p className="text-sm text-gray-500">
                        {t.customProvidersDesc}
                    </p>
                </div>
                <PixelButton onClick={onAdd}>{t.addCustomProvider}</PixelButton>
            </div>

            {customProviders && customProviders.length > 0 && (
                <div className="space-y-2">
                    {customProviders.map((custom) => (
                        <div
                            key={custom.id}
                            className="p-3 border-2 border-gray-300 rounded flex items-center justify-between"
                        >
                            <div className="flex-1">
                                <div className="font-bold">{custom.name}</div>
                                <div className="text-sm text-gray-600">
                                    {custom.baseUrl}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <PixelButton onClick={() => onEdit(custom)}>
                                    {t.edit}
                                </PixelButton>
                                <PixelButton
                                    onClick={() => onDelete(custom.id)}
                                >
                                    {t.delete}
                                </PixelButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
