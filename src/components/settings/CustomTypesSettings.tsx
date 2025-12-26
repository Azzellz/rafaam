import React, { useState } from "react";
import { PixelButton, PixelInput, PixelModal } from "@/components/pixel";
import { useCustomTypesStore } from "@/stores/useCustomTypesStore";
import { CustomTypeDefinition, CustomField, Language } from "@/types";
import { useToastStore } from "@/stores/useToastStore";
import { translations } from "@/i18n";
import { showConfirm } from "@/stores/useDialogStore";

interface CustomTypesSettingsProps {
    onBack: () => void;
    language: Language;
}

export const CustomTypesSettings: React.FC<CustomTypesSettingsProps> = ({
    onBack,
    language,
}) => {
    const t = translations[language];
    const { customTypes, addCustomType, updateCustomType, deleteCustomType } =
        useCustomTypesStore();
    const { addToast } = useToastStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<
        Partial<CustomTypeDefinition>
    >({});
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSave = () => {
        if (
            !editingType.name ||
            !editingType.prompt ||
            !editingType.fields?.length
        ) {
            addToast(t.fillAllFields, "warning");
            return;
        }

        if (editingId) {
            updateCustomType(editingId, editingType);
            addToast(t.updateSuccess, "success");
        } else {
            addCustomType(editingType as Omit<CustomTypeDefinition, "id">);
            addToast(t.createSuccess, "success");
        }
        setIsModalOpen(false);
        setEditingType({});
        setEditingId(null);
    };

    const handleEdit = (type: CustomTypeDefinition) => {
        setEditingType(type);
        setEditingId(type.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        showConfirm(
            t.deleteConfirm,
            () => {
                deleteCustomType(id);
                addToast(t.deleteSuccess, "success");
            },
            undefined,
            undefined,
            language
        );
    };

    const handleAddField = () => {
        const newField: CustomField = { key: "", label: "" };
        setEditingType({
            ...editingType,
            fields: [...(editingType.fields || []), newField],
        });
    };

    const handleUpdateField = (index: number, field: Partial<CustomField>) => {
        const newFields = [...(editingType.fields || [])];
        newFields[index] = { ...newFields[index], ...field };
        setEditingType({ ...editingType, fields: newFields });
    };

    const handleRemoveField = (index: number) => {
        const newFields = [...(editingType.fields || [])];
        newFields.splice(index, 1);
        setEditingType({ ...editingType, fields: newFields });
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl">{t.savedCustomTypes}</h2>
                <PixelButton
                    onClick={() => {
                        setEditingType({ fields: [] });
                        setEditingId(null);
                        setIsModalOpen(true);
                    }}
                >
                    + {t.createCustomType}
                </PixelButton>
            </div>

            {customTypes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {t.noCustomTypes}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {customTypes.map((type) => (
                        <div
                            key={type.id}
                            className="border-2 border-gray-200 p-4 rounded hover:border-theme transition-colors bg-gray-50"
                        >
                            <h3 className="font-bold text-lg mb-2">
                                {type.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {type.description || t.noDescription}
                            </p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => handleEdit(type)}
                                    className="text-blue-600 hover:underline text-sm font-bold"
                                >
                                    {t.edit}
                                </button>
                                <button
                                    onClick={() => handleDelete(type.id)}
                                    className="text-red-600 hover:underline text-sm font-bold"
                                >
                                    {t.delete}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PixelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? t.editCustomType : t.newCustomType}
                className="max-w-3xl"
            >
                <div className="flex flex-col gap-4 p-2 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            {t.name}
                        </label>
                        <PixelInput
                            value={editingType.name || ""}
                            onChange={(e) =>
                                setEditingType({
                                    ...editingType,
                                    name: e.target.value,
                                })
                            }
                            placeholder={t.namePlaceholder}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">
                            {t.description}
                        </label>
                        <PixelInput
                            value={editingType.description || ""}
                            onChange={(e) =>
                                setEditingType({
                                    ...editingType,
                                    description: e.target.value,
                                })
                            }
                            placeholder={t.descriptionPlaceholder}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">
                            {t.prompt}
                        </label>
                        <textarea
                            className="w-full p-3 border-2 border-black font-mono text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-theme"
                            value={editingType.prompt || ""}
                            onChange={(e) =>
                                setEditingType({
                                    ...editingType,
                                    prompt: e.target.value,
                                })
                            }
                            placeholder={t.promptPlaceholder}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t.promptHint}
                        </p>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold">
                                {t.outputStructure}
                            </label>
                            <button
                                onClick={handleAddField}
                                className="text-theme font-bold text-sm hover:underline"
                            >
                                + {t.addField}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {editingType.fields?.map((field, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 items-start bg-gray-100 p-2 rounded"
                                >
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                            className="border border-gray-300 p-1 text-sm rounded"
                                            placeholder={t.fieldKey}
                                            value={field.key}
                                            onChange={(e) =>
                                                handleUpdateField(index, {
                                                    key: e.target.value,
                                                })
                                            }
                                        />
                                        <input
                                            className="border border-gray-300 p-1 text-sm rounded"
                                            placeholder={t.fieldLabel}
                                            value={field.label}
                                            onChange={(e) =>
                                                handleUpdateField(index, {
                                                    label: e.target.value,
                                                })
                                            }
                                        />
                                        <input
                                            className="border border-gray-300 p-1 text-sm rounded col-span-2"
                                            placeholder={t.fieldDesc}
                                            value={field.description || ""}
                                            onChange={(e) =>
                                                handleUpdateField(index, {
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveField(index)}
                                        className="text-red-500 font-bold px-2"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {(!editingType.fields ||
                                editingType.fields.length === 0) && (
                                <div className="text-center text-gray-400 text-sm py-2 border-2 border-dashed border-gray-300">
                                    {t.noFields}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-4 pt-4 border-t-2 border-gray-200">
                        <PixelButton
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            {t.cancel}
                        </PixelButton>
                        <PixelButton onClick={handleSave}>{t.save}</PixelButton>
                    </div>
                </div>
            </PixelModal>
        </div>
    );
};
