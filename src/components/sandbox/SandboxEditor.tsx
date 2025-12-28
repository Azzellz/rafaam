"use client";

/**
 * Sandbox Template Editor
 * 沙盒模板可视化编辑器
 */

import React, { useState } from "react";
import {
    SandboxTemplate,
    SandboxComponent,
    SandboxComponentType,
    SANDBOX_COMPONENT_METAS,
    createComponent,
    createEmptyTemplate,
    ComponentMeta,
} from "@/types/sandbox";
import { SandboxComponentRenderer } from "./renderers";
import {
    PixelButton,
    PixelCard,
    PixelInput,
    PixelSelect,
} from "@/components/pixel";
import { Language, PracticeLanguage } from "@/types";
import { translations } from "@/i18n";
import { PRACTICE_LANGUAGES } from "@/constants/practiceLanguages";
import { useToastStore } from "@/stores/useToastStore";

// ==================== 组件面板 ====================

interface ComponentPaletteProps {
    onAdd: (type: SandboxComponentType) => void;
    language: Language;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({
    onAdd,
    language,
}) => {
    const t = translations[language];
    const categories = {
        text: { label: t.catText, icon: "📝" },
        input: { label: t.catInput, icon: "✏️" },
        choice: { label: t.catChoice, icon: "🔘" },
        fill: { label: t.catFill, icon: "___" },
        match: { label: t.catMatch, icon: "🔗" },
        media: { label: t.catMedia, icon: "🔊" },
        layout: { label: t.catLayout, icon: "📦" },
    };

    const groupedMetas = SANDBOX_COMPONENT_METAS.reduce((acc, meta) => {
        if (!acc[meta.category]) acc[meta.category] = [];
        acc[meta.category].push(meta);
        return acc;
    }, {} as Record<string, ComponentMeta[]>);

    // 获取组件的国际化名称
    const getComponentName = (type: SandboxComponentType): string => {
        const nameMap: Record<SandboxComponentType, string> = {
            [SandboxComponentType.TEXT]: t.componentText,
            [SandboxComponentType.PASSAGE]: t.componentPassage,
            [SandboxComponentType.INSTRUCTION]: t.componentInstruction,
            [SandboxComponentType.TEXT_INPUT]: t.componentTextInput,
            [SandboxComponentType.TEXT_AREA]: t.componentTextArea,
            [SandboxComponentType.SINGLE_CHOICE]: t.componentSingleChoice,
            [SandboxComponentType.MULTIPLE_CHOICE]: t.componentMultipleChoice,
            [SandboxComponentType.TRUE_FALSE]: t.componentTrueFalse,
            [SandboxComponentType.FILL_BLANK]: t.componentFillBlank,
            [SandboxComponentType.CLOZE]: t.componentCloze,
            [SandboxComponentType.MATCHING]: t.componentMatching,
            [SandboxComponentType.ORDERING]: t.componentOrdering,
            [SandboxComponentType.AUDIO]: t.componentAudio,
            [SandboxComponentType.DIVIDER]: t.componentDivider,
            [SandboxComponentType.GROUP]: t.componentGroup,
        };
        return nameMap[type] || type;
    };

    // 获取组件的国际化描述
    const getComponentDesc = (type: SandboxComponentType): string => {
        const descMap: Record<SandboxComponentType, string> = {
            [SandboxComponentType.TEXT]: t.componentTextDesc,
            [SandboxComponentType.PASSAGE]: t.componentPassageDesc,
            [SandboxComponentType.INSTRUCTION]: t.componentInstructionDesc,
            [SandboxComponentType.TEXT_INPUT]: t.componentTextInputDesc,
            [SandboxComponentType.TEXT_AREA]: t.componentTextAreaDesc,
            [SandboxComponentType.SINGLE_CHOICE]: t.componentSingleChoiceDesc,
            [SandboxComponentType.MULTIPLE_CHOICE]:
                t.componentMultipleChoiceDesc,
            [SandboxComponentType.TRUE_FALSE]: t.componentTrueFalseDesc,
            [SandboxComponentType.FILL_BLANK]: t.componentFillBlankDesc,
            [SandboxComponentType.CLOZE]: t.componentClozeDesc,
            [SandboxComponentType.MATCHING]: t.componentMatchingDesc,
            [SandboxComponentType.ORDERING]: t.componentOrderingDesc,
            [SandboxComponentType.AUDIO]: t.componentAudioDesc,
            [SandboxComponentType.DIVIDER]: t.componentDividerDesc,
            [SandboxComponentType.GROUP]: t.componentGroupDesc,
        };
        return descMap[type] || "";
    };

    return (
        <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded">
            <h3 className="font-bold mb-3 text-lg">{t.componentLibrary}</h3>
            <div className="space-y-4">
                {Object.entries(categories).map(([key, { label, icon }]) => (
                    <div key={key}>
                        <div className="text-sm font-bold text-gray-500 mb-2">
                            {icon} {label}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {groupedMetas[key]?.map((meta) => (
                                <button
                                    key={meta.type}
                                    onClick={() => onAdd(meta.type)}
                                    className="px-3 py-2 bg-white border-2 border-gray-300 hover:border-theme hover:bg-theme/5 transition-all text-sm flex items-center gap-2"
                                    title={getComponentDesc(meta.type)}
                                >
                                    <span>{meta.icon}</span>
                                    <span>{getComponentName(meta.type)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==================== 组件编辑====================

interface ComponentEditorProps {
    component: SandboxComponent;
    onChange: (updated: SandboxComponent) => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    language: Language;
}

const ComponentEditor: React.FC<ComponentEditorProps> = ({
    component,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    language,
}) => {
    const t = translations[language];
    const meta = SANDBOX_COMPONENT_METAS.find((m) => m.type === component.type);

    const updateField = (field: string, value: any) => {
        onChange({ ...component, [field]: value } as SandboxComponent);
    };

    // 获取组件的国际化名称
    const getComponentName = (type: SandboxComponentType): string => {
        const nameMap: Record<SandboxComponentType, string> = {
            [SandboxComponentType.TEXT]: t.componentText,
            [SandboxComponentType.PASSAGE]: t.componentPassage,
            [SandboxComponentType.INSTRUCTION]: t.componentInstruction,
            [SandboxComponentType.TEXT_INPUT]: t.componentTextInput,
            [SandboxComponentType.TEXT_AREA]: t.componentTextArea,
            [SandboxComponentType.SINGLE_CHOICE]: t.componentSingleChoice,
            [SandboxComponentType.MULTIPLE_CHOICE]: t.componentMultipleChoice,
            [SandboxComponentType.TRUE_FALSE]: t.componentTrueFalse,
            [SandboxComponentType.FILL_BLANK]: t.componentFillBlank,
            [SandboxComponentType.CLOZE]: t.componentCloze,
            [SandboxComponentType.MATCHING]: t.componentMatching,
            [SandboxComponentType.ORDERING]: t.componentOrdering,
            [SandboxComponentType.AUDIO]: t.componentAudio,
            [SandboxComponentType.DIVIDER]: t.componentDivider,
            [SandboxComponentType.GROUP]: t.componentGroup,
        };
        return nameMap[type] || type;
    };

    return (
        <div className="border-2 border-gray-300 bg-white p-4 rounded relative group">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{meta?.icon}</span>
                    <span className="font-bold">
                        {getComponentName(component.type)}
                    </span>
                </div>
                <div className="flex gap-1">
                    {onMoveUp && (
                        <button
                            onClick={onMoveUp}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title={t.moveUp}
                        >
                            ↑
                        </button>
                    )}
                    {onMoveDown && (
                        <button
                            onClick={onMoveDown}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title={t.moveDown}
                        >
                            ↓
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="p-1 text-red-400 hover:text-red-600"
                        title={t.delete}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* 通用字段 */}
            <div className="space-y-3">
                <div>
                    <label className="text-xs font-bold text-gray-500">
                        {t.labelField}
                    </label>
                    <input
                        type="text"
                        value={component.label || ""}
                        onChange={(e) => updateField("label", e.target.value)}
                        placeholder={t.optionalLabel}
                        className="w-full p-2 border border-gray-300 text-sm"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={component.aiGenerated !== false}
                            onChange={(e) =>
                                updateField("aiGenerated", e.target.checked)
                            }
                        />
                        {t.aiGeneratedContent}
                    </label>
                </div>

                {component.aiGenerated !== false && (
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            {t.aiPromptHint}
                        </label>
                        <input
                            type="text"
                            value={component.aiPromptHint || ""}
                            onChange={(e) =>
                                updateField("aiPromptHint", e.target.value)
                            }
                            placeholder={t.aiPromptHintPlaceholder}
                            className="w-full p-2 border border-gray-300 text-sm"
                        />
                    </div>
                )}

                {/* 特定组件字段 */}
                {renderSpecificFields(component, onChange, language)}
            </div>
        </div>
    );
};

// 渲染特定组件的字段
const renderSpecificFields = (
    component: SandboxComponent,
    onChange: (c: SandboxComponent) => void,
    language: Language
) => {
    const t = translations[language];
    switch (component.type) {
        case SandboxComponentType.TEXT:
        case SandboxComponentType.PASSAGE:
        case SandboxComponentType.INSTRUCTION:
            return (
                <div>
                    <label className="text-xs font-bold text-gray-500">
                        {t.contentStaticOrAI}
                    </label>
                    <textarea
                        value={(component as any).content || ""}
                        onChange={(e) =>
                            onChange({
                                ...component,
                                content: e.target.value,
                            } as any)
                        }
                        placeholder={t.leaveEmptyForAI}
                        className="w-full p-2 border border-gray-300 text-sm min-h-[80px]"
                    />
                </div>
            );

        case SandboxComponentType.SINGLE_CHOICE:
        case SandboxComponentType.MULTIPLE_CHOICE:
            const choiceComp = component as any;
            return (
                <div className="space-y-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            {t.questionField}
                        </label>
                        <input
                            type="text"
                            value={choiceComp.question || ""}
                            onChange={(e) =>
                                onChange({
                                    ...component,
                                    question: e.target.value,
                                } as any)
                            }
                            placeholder={t.leaveEmptyForAI}
                            className="w-full p-2 border border-gray-300 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            {t.optionCount}
                        </label>
                        <select
                            value={choiceComp.options?.length || 4}
                            onChange={(e) => {
                                const count = parseInt(e.target.value);
                                const options = Array.from(
                                    { length: count },
                                    (_, i) => ({
                                        id: String.fromCharCode(97 + i),
                                        text:
                                            choiceComp.options?.[i]?.text || "",
                                        isCorrect: i === 0,
                                    })
                                );
                                onChange({ ...component, options } as any);
                            }}
                            className="w-full p-2 border border-gray-300 text-sm"
                        >
                            <option value={2}>
                                {t.optionCountN.replace("{n}", "2")}
                            </option>
                            <option value={3}>
                                {t.optionCountN.replace("{n}", "3")}
                            </option>
                            <option value={4}>
                                {t.optionCountN.replace("{n}", "4")}
                            </option>
                            <option value={5}>
                                {t.optionCountN.replace("{n}", "5")}
                            </option>
                        </select>
                    </div>
                </div>
            );

        case SandboxComponentType.FILL_BLANK:
        case SandboxComponentType.CLOZE:
            const fillComp = component as any;
            return (
                <div className="space-y-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            {t.blankCount}
                        </label>
                        <select
                            value={fillComp.blanks?.length || 5}
                            onChange={(e) => {
                                const count = parseInt(e.target.value);
                                const blanks = Array.from(
                                    { length: count },
                                    (_, i) => ({
                                        id: `blank_${i}`,
                                        correctAnswer: "",
                                        options: [],
                                    })
                                );
                                onChange({ ...component, blanks } as any);
                            }}
                            className="w-full p-2 border border-gray-300 text-sm"
                        >
                            {[3, 5, 8, 10, 12, 15].map((n) => (
                                <option key={n} value={n}>
                                    {t.blankCountN.replace("{n}", String(n))}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs text-gray-500">{t.blankHint}</div>
                </div>
            );

        case SandboxComponentType.MATCHING:
            const matchComp = component as any;
            return (
                <div className="space-y-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            {t.pairCount}
                        </label>
                        <select
                            value={matchComp.pairs?.length || 4}
                            onChange={(e) => {
                                const count = parseInt(e.target.value);
                                const pairs = Array.from(
                                    { length: count },
                                    (_, i) => ({
                                        id: `pair_${i}`,
                                        left: "",
                                        right: "",
                                    })
                                );
                                onChange({ ...component, pairs } as any);
                            }}
                            className="w-full p-2 border border-gray-300 text-sm"
                        >
                            {[3, 4, 5, 6, 8].map((n) => (
                                <option key={n} value={n}>
                                    {t.pairCountN.replace("{n}", String(n))}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            );

        case SandboxComponentType.ORDERING:
            const orderComp = component as any;
            return (
                <div className="space-y-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            {t.itemCount}
                        </label>
                        <select
                            value={orderComp.items?.length || 4}
                            onChange={(e) => {
                                const count = parseInt(e.target.value);
                                const items = Array.from(
                                    { length: count },
                                    (_, i) => ({
                                        id: `item_${i}`,
                                        text: "",
                                        order: i + 1,
                                    })
                                );
                                onChange({ ...component, items } as any);
                            }}
                            className="w-full p-2 border border-gray-300 text-sm"
                        >
                            {[3, 4, 5, 6, 8].map((n) => (
                                <option key={n} value={n}>
                                    {t.itemCountN.replace("{n}", String(n))}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            );

        case SandboxComponentType.GROUP:
            const groupComp = component as any;
            return (
                <div className="space-y-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            {t.groupTitle}
                        </label>
                        <input
                            type="text"
                            value={groupComp.title || ""}
                            onChange={(e) =>
                                onChange({
                                    ...component,
                                    title: e.target.value,
                                } as any)
                            }
                            placeholder={t.groupTitle}
                            className="w-full p-2 border border-gray-300 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">
                            {t.repeatCount}
                        </label>
                        <select
                            value={groupComp.repeatCount || 1}
                            onChange={(e) =>
                                onChange({
                                    ...component,
                                    repeatCount: parseInt(e.target.value),
                                } as any)
                            }
                            className="w-full p-2 border border-gray-300 text-sm"
                        >
                            {[1, 2, 3, 5, 10].map((n) => (
                                <option key={n} value={n}>
                                    {t.repeatCountN.replace("{n}", String(n))}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            );

        default:
            return null;
    }
};

// ==================== 主编辑器 ====================

interface SandboxEditorProps {
    template?: SandboxTemplate;
    onSave: (template: Omit<SandboxTemplate, "id"> | SandboxTemplate) => void;
    onCancel: () => void;
    language: Language;
}

export const SandboxEditor: React.FC<SandboxEditorProps> = ({
    template,
    onSave,
    onCancel,
    language,
}) => {
    const t = translations[language];
    const { addToast } = useToastStore();
    const [editingTemplate, setEditingTemplate] = useState<
        Omit<SandboxTemplate, "id"> & { id?: string }
    >(template || createEmptyTemplate());
    const [showPreview, setShowPreview] = useState(false);

    const handleAddComponent = (type: SandboxComponentType) => {
        const newComponent = createComponent(type);
        setEditingTemplate({
            ...editingTemplate,
            components: [...editingTemplate.components, newComponent],
            updatedAt: Date.now(),
        });
        // 显示成功提示
        addToast(t.componentAddedSuccess, "info");
    };

    const handleUpdateComponent = (
        index: number,
        updated: SandboxComponent
    ) => {
        const newComponents = [...editingTemplate.components];
        newComponents[index] = updated;
        setEditingTemplate({
            ...editingTemplate,
            components: newComponents,
            updatedAt: Date.now(),
        });
    };

    const handleDeleteComponent = (index: number) => {
        const newComponents = [...editingTemplate.components];
        newComponents.splice(index, 1);
        setEditingTemplate({
            ...editingTemplate,
            components: newComponents,
            updatedAt: Date.now(),
        });
    };

    const handleMoveComponent = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= editingTemplate.components.length)
            return;

        const newComponents = [...editingTemplate.components];
        [newComponents[index], newComponents[newIndex]] = [
            newComponents[newIndex],
            newComponents[index],
        ];
        setEditingTemplate({
            ...editingTemplate,
            components: newComponents,
            updatedAt: Date.now(),
        });
    };

    const handleSave = () => {
        if (!editingTemplate.name) {
            alert(t.enterTemplateName);
            return;
        }
        if (editingTemplate.components.length === 0) {
            alert(t.addAtLeastOneComponent);
            return;
        }
        onSave(editingTemplate as any);
    };

    return (
        <div className="animate-fade-in">
            {/* 顶部工具栏 */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6 pb-4 border-b-2 border-dashed">
                <div className="flex items-center gap-4">
                    <PixelButton onClick={onCancel} variant="secondary">
                        ← {t.back}
                    </PixelButton>
                    <h2 className="text-2xl font-bold">
                        {template ? t.editTemplate : t.createTemplate}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <PixelButton
                        variant="secondary"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? t.editMode : t.previewMode}
                    </PixelButton>
                    <PixelButton onClick={handleSave}>
                        {t.saveTemplate}
                    </PixelButton>
                </div>
            </div>

            {showPreview ? (
                /* 预览模式 */
                <PixelCard>
                    <h3 className="text-xl font-bold mb-4">
                        {editingTemplate.name || `[${t.templateName}]`}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {editingTemplate.description || `[${t.description}]`}
                    </p>
                    <div className="space-y-4 opacity-50">
                        {editingTemplate.components.map((comp) => {
                            const getComponentTypeName = (
                                type: SandboxComponentType
                            ): string => {
                                const typeNameMap: Record<
                                    SandboxComponentType,
                                    string
                                > = {
                                    [SandboxComponentType.TEXT]:
                                        t.componentText,
                                    [SandboxComponentType.PASSAGE]:
                                        t.componentPassage,
                                    [SandboxComponentType.INSTRUCTION]:
                                        t.componentInstruction,
                                    [SandboxComponentType.TEXT_INPUT]:
                                        t.componentTextInput,
                                    [SandboxComponentType.TEXT_AREA]:
                                        t.componentTextArea,
                                    [SandboxComponentType.SINGLE_CHOICE]:
                                        t.componentSingleChoice,
                                    [SandboxComponentType.MULTIPLE_CHOICE]:
                                        t.componentMultipleChoice,
                                    [SandboxComponentType.TRUE_FALSE]:
                                        t.componentTrueFalse,
                                    [SandboxComponentType.FILL_BLANK]:
                                        t.componentFillBlank,
                                    [SandboxComponentType.CLOZE]:
                                        t.componentCloze,
                                    [SandboxComponentType.MATCHING]:
                                        t.componentMatching,
                                    [SandboxComponentType.ORDERING]:
                                        t.componentOrdering,
                                    [SandboxComponentType.AUDIO]:
                                        t.componentAudio,
                                    [SandboxComponentType.DIVIDER]:
                                        t.componentDivider,
                                    [SandboxComponentType.GROUP]:
                                        t.componentGroup,
                                };
                                return typeNameMap[type] || type;
                            };

                            const showComponentType =
                                comp.type !== SandboxComponentType.DIVIDER;

                            return (
                                <div key={comp.id}>
                                    {showComponentType && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="inline-flex items-center px-2 py-1 bg-gray-200 border border-gray-400 text-gray-700 text-xs font-bold rounded">
                                                {getComponentTypeName(
                                                    comp.type
                                                )}
                                            </div>
                                            {comp.label && (
                                                <span className="text-sm text-gray-500">
                                                    {comp.label}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <SandboxComponentRenderer
                                        component={comp}
                                        isPreview={true}
                                        language={language}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </PixelCard>
            ) : (
                /* 编辑模式 */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左侧：组件面板 */}
                    <div className="lg:col-span-1">
                        <ComponentPalette
                            onAdd={handleAddComponent}
                            language={language}
                        />
                    </div>

                    {/* 右侧：编辑区域 */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* 基本信息 */}
                        <PixelCard>
                            <h3 className="font-bold mb-3">{t.basicInfo}</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-bold">
                                        {t.templateNameRequired}
                                    </label>
                                    <PixelInput
                                        value={editingTemplate.name}
                                        onChange={(e) =>
                                            setEditingTemplate({
                                                ...editingTemplate,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder={t.templateNamePlaceholder}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">
                                        {t.description}
                                    </label>
                                    <PixelInput
                                        value={
                                            editingTemplate.description || ""
                                        }
                                        onChange={(e) =>
                                            setEditingTemplate({
                                                ...editingTemplate,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder={t.templateDescPlaceholder}
                                    />
                                </div>
                            </div>
                        </PixelCard>

                        {/* 练习配置 */}
                        <PixelCard>
                            <h3 className="font-bold mb-3">
                                {t.practiceConfig}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3">
                                {t.practiceConfigHint}
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-bold">
                                        {t.practiceLanguage}
                                    </label>
                                    <PixelSelect
                                        value={
                                            editingTemplate.practiceLanguage ||
                                            ""
                                        }
                                        onChange={(value) =>
                                            setEditingTemplate({
                                                ...editingTemplate,
                                                practiceLanguage:
                                                    value || undefined,
                                                // 切换语言时重置等级
                                                level: undefined,
                                            })
                                        }
                                        options={[
                                            {
                                                value: "",
                                                label: t.useGlobalSetting,
                                            },
                                            ...Object.entries(
                                                PRACTICE_LANGUAGES
                                            ).map(([key, config]) => ({
                                                value: key,
                                                label: config.label,
                                            })),
                                        ]}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold">
                                        {t.difficultyLevel}
                                    </label>
                                    <PixelSelect
                                        value={editingTemplate.level || ""}
                                        onChange={(value) =>
                                            setEditingTemplate({
                                                ...editingTemplate,
                                                level: value || undefined,
                                            })
                                        }
                                        options={[
                                            {
                                                value: "",
                                                label: t.useGlobalSetting,
                                            },
                                            ...(editingTemplate.practiceLanguage
                                                ? PRACTICE_LANGUAGES[
                                                      editingTemplate.practiceLanguage as PracticeLanguage
                                                  ]?.levelOptions.map(
                                                      (opt) => ({
                                                          value: opt.id,
                                                          label: opt.label,
                                                      })
                                                  ) || []
                                                : []),
                                        ]}
                                        disabled={
                                            !editingTemplate.practiceLanguage
                                        }
                                    />
                                </div>
                            </div>
                        </PixelCard>

                        {/* AI 配置 */}
                        <PixelCard>
                            <h3 className="font-bold mb-3">
                                {t.aiGenerateConfig}
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-bold">
                                        {t.generatePromptRequired}
                                    </label>
                                    <textarea
                                        value={
                                            editingTemplate.aiConfig
                                                .generatePrompt
                                        }
                                        onChange={(e) =>
                                            setEditingTemplate({
                                                ...editingTemplate,
                                                aiConfig: {
                                                    ...editingTemplate.aiConfig,
                                                    generatePrompt:
                                                        e.target.value,
                                                },
                                            })
                                        }
                                        placeholder={
                                            t.generatePromptPlaceholder
                                        }
                                        className="w-full p-3 border-2 border-black font-mono text-sm min-h-[120px]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t.generatePromptHint}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-bold">
                                        {t.systemPromptOptional}
                                    </label>
                                    <textarea
                                        value={
                                            editingTemplate.aiConfig
                                                .systemPrompt || ""
                                        }
                                        onChange={(e) =>
                                            setEditingTemplate({
                                                ...editingTemplate,
                                                aiConfig: {
                                                    ...editingTemplate.aiConfig,
                                                    systemPrompt:
                                                        e.target.value,
                                                },
                                            })
                                        }
                                        placeholder={t.systemPromptPlaceholder}
                                        className="w-full p-3 border-2 border-gray-300 font-mono text-sm min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </PixelCard>

                        {/* 组件列表 */}
                        <div>
                            <h3 className="font-bold mb-3">
                                {t.componentStructure} (
                                {editingTemplate.components.length})
                            </h3>
                            {editingTemplate.components.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
                                    {t.addComponentHint}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {editingTemplate.components.map(
                                        (comp, index) => (
                                            <ComponentEditor
                                                key={comp.id}
                                                component={comp}
                                                onChange={(updated) =>
                                                    handleUpdateComponent(
                                                        index,
                                                        updated
                                                    )
                                                }
                                                onDelete={() =>
                                                    handleDeleteComponent(index)
                                                }
                                                onMoveUp={
                                                    index > 0
                                                        ? () =>
                                                              handleMoveComponent(
                                                                  index,
                                                                  "up"
                                                              )
                                                        : undefined
                                                }
                                                onMoveDown={
                                                    index <
                                                    editingTemplate.components
                                                        .length -
                                                        1
                                                        ? () =>
                                                              handleMoveComponent(
                                                                  index,
                                                                  "down"
                                                              )
                                                        : undefined
                                                }
                                                language={language}
                                            />
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
