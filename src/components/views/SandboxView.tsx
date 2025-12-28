/**
 * Sandbox View
 * 沙盒模式主视图 - 模板管理、编辑和内容生成
 */

import React, { useState, useCallback } from "react";
import { Language, PracticeLanguage } from "@/types";
import {
    SandboxTemplate,
    SandboxGeneratedContent,
    SandboxComponentType,
} from "@/types/sandbox";
import { useSandboxTemplateStore } from "@/stores/useSandboxTemplateStore";
import { SandboxEditor } from "@/components/sandbox/SandboxEditor";
import { SandboxComponentRenderer } from "@/components/sandbox/renderers";
import {
    PixelButton,
    PixelCard,
    PixelInput,
    PixelSelect,
} from "@/components/pixel";
import { translations } from "@/i18n";
import { showConfirm, showAlert } from "@/stores/useDialogStore";
import { useToastStore } from "@/stores/useToastStore";
import { generateSandboxContent } from "@/services/ai";
import { useAppStore } from "@/stores/useAppStore";
import {
    PRACTICE_LANGUAGES,
    getDefaultLevel,
} from "@/constants/practiceLanguages";

interface SandboxViewProps {
    language: Language;
    onSelectTemplate?: (template: SandboxTemplate) => void;
    onBack?: () => void;
    onStartPractice?: (content: SandboxGeneratedContent) => void;
}

type ViewMode = "list" | "edit" | "generate" | "preview";

export const SandboxView: React.FC<SandboxViewProps> = ({
    language,
    onSelectTemplate,
    onBack,
    onStartPractice,
}) => {
    const t = translations[language];
    const { addToast } = useToastStore();
    const { practiceLanguage, level } = useAppStore();
    const {
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        importTemplate,
        exportTemplate,
    } = useSandboxTemplateStore();

    // View state
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [editingTemplate, setEditingTemplate] =
        useState<SandboxTemplate | null>(null);

    // Generation state
    const [selectedTemplate, setSelectedTemplate] =
        useState<SandboxTemplate | null>(null);
    const [topic, setTopic] = useState("");
    const [selectedLevel, setSelectedLevel] = useState<string>(level);
    const [selectedPracticeLanguage, setSelectedPracticeLanguage] =
        useState<PracticeLanguage>(practiceLanguage);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] =
        useState<SandboxGeneratedContent | null>(null);

    // Preview state
    const [showAnswers, setShowAnswers] = useState(false);
    const [answerState, setAnswerState] = useState<Record<string, any>>({});

    // 处理答案变化
    const handleAnswerChange = useCallback(
        (componentId: string, value: any) => {
            setAnswerState((prev) => ({
                ...prev,
                [componentId]: value,
            }));
        },
        []
    );

    // 保存模板
    const handleSave = (
        template: Omit<SandboxTemplate, "id"> | SandboxTemplate
    ) => {
        if ("id" in template && template.id) {
            updateTemplate(template.id, template);
            addToast(t.templateUpdated, "success");
        } else {
            addTemplate(template as Omit<SandboxTemplate, "id">);
            addToast(t.templateCreated, "success");
        }
        setEditingTemplate(null);
        setViewMode("list");
    };

    // 删除模板
    const handleDelete = (id: string) => {
        showConfirm(
            t.deleteTemplateConfirm,
            () => {
                deleteTemplate(id);
                addToast(t.templateDeleted, "success");
            },
            undefined,
            undefined,
            language
        );
    };

    // 复制模板
    const handleDuplicate = (id: string) => {
        const newId = duplicateTemplate(id);
        if (newId) {
            addToast(t.templateDuplicated, "success");
        }
    };

    // 导出模板
    const handleExport = (id: string) => {
        const json = exportTemplate(id);
        if (json) {
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sandbox-template-${id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            addToast(t.templateExported, "success");
        }
    };

    // 导入模板
    const handleImport = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const template = JSON.parse(text) as SandboxTemplate;

                if (!template.name || !template.components) {
                    throw new Error("Invalid template format");
                }

                importTemplate(template);
                addToast(t.templateImported, "success");
            } catch (error) {
                showAlert(t.importFailed, undefined, language);
            }
        };
        input.click();
    };

    // 选择模板进入生成模式
    const handleSelectForGeneration = (template: SandboxTemplate) => {
        setSelectedTemplate(template);
        setGeneratedContent(null);
        setViewMode("generate");
        // 使用模板的默认配置（如果有的话）
        if (template.practiceLanguage) {
            setSelectedPracticeLanguage(
                template.practiceLanguage as PracticeLanguage
            );
        }
        if (template.level) {
            setSelectedLevel(template.level);
        }
        // 如果有外部回调也调用
        if (onSelectTemplate) {
            onSelectTemplate(template);
        }
    };

    // 生成内容
    const handleGenerate = useCallback(
        async (topicOverride?: string) => {
            if (!selectedTemplate) {
                addToast(t.selectTemplateFirst, "warning");
                return;
            }

            const finalTopic = topicOverride ?? topic.trim();
            if (!finalTopic) {
                addToast(t.topicRequired, "warning");
                return;
            }

            setIsGenerating(true);
            try {
                const content = await generateSandboxContent(
                    selectedTemplate,
                    finalTopic,
                    selectedLevel,
                    selectedPracticeLanguage,
                    language
                );
                setGeneratedContent(content);
                setViewMode("preview");
                addToast(t.generateSuccess, "success");
            } catch (error) {
                console.error("Generation failed:", error);
                addToast(t.generateFailed, "error");
            } finally {
                setIsGenerating(false);
            }
        },
        [
            selectedTemplate,
            topic,
            selectedLevel,
            selectedPracticeLanguage,
            language,
            addToast,
            t,
        ]
    );

    // 随机生成
    const handleRandomGenerate = useCallback(() => {
        handleGenerate("random");
    }, [handleGenerate]);

    // 开始练习
    const handleStartPractice = () => {
        if (generatedContent && onStartPractice) {
            onStartPractice(generatedContent);
        }
    };

    // 如果正在编辑
    if (viewMode === "edit" || editingTemplate) {
        return (
            <SandboxEditor
                template={editingTemplate || undefined}
                onSave={handleSave}
                onCancel={() => {
                    setEditingTemplate(null);
                    setViewMode("list");
                }}
                language={language}
            />
        );
    }

    // 生成配置视图
    if (viewMode === "generate" && selectedTemplate) {
        return (
            <div className="animate-fade-in">
                {/* 顶部 */}
                <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <PixelButton
                            onClick={() => {
                                setViewMode("list");
                                setSelectedTemplate(null);
                            }}
                            variant="secondary"
                        >
                            ← {t.backToTemplates}
                        </PixelButton>
                        <div>
                            <h2 className="text-3xl font-bold">
                                {t.generateContent}
                            </h2>
                            <p className="text-gray-600">
                                {t.templateSelected}: {selectedTemplate.icon}{" "}
                                {selectedTemplate.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 生成配置 */}
                <PixelCard className="mb-6">
                    <h3 className="text-xl font-bold mb-4">
                        {t.generationConfig}
                    </h3>
                    <div>
                        {/* 主题 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t.contentTopic} *
                            </label>
                            <PixelInput
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={t.topicPlaceholder}
                                disabled={isGenerating}
                            />
                        </div>
                    </div>

                    {/* 生成按钮 */}
                    <div className="mt-6 flex gap-3">
                        <PixelButton
                            onClick={() => handleGenerate()}
                            disabled={isGenerating || !topic.trim()}
                        >
                            {isGenerating ? (
                                <>⏳ {t.generatingContent}</>
                            ) : (
                                <>✨ {t.generateContent}</>
                            )}
                        </PixelButton>
                        <PixelButton
                            onClick={handleRandomGenerate}
                            disabled={isGenerating}
                            variant="secondary"
                            title={t.randomTopic}
                        >
                            🎲 {t.randomTopic}
                        </PixelButton>
                    </div>
                </PixelCard>

                {/* 模板结构预览 */}
                <PixelCard>
                    <h3 className="text-xl font-bold mb-4">{t.previewMode}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {selectedTemplate.description}
                    </p>
                    <div className="space-y-4 opacity-50">
                        {selectedTemplate.components.map((component, index) => {
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
                                component.type !== SandboxComponentType.DIVIDER;

                            return (
                                <div key={`preview-${index}`}>
                                    {showComponentType && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="inline-flex items-center px-2 py-1 bg-gray-200 border border-gray-400 text-gray-700 text-xs font-bold rounded">
                                                {getComponentTypeName(
                                                    component.type
                                                )}
                                            </div>
                                            {component.label && (
                                                <span className="text-sm text-gray-500">
                                                    {component.label}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <SandboxComponentRenderer
                                        component={component}
                                        isPreview
                                        language={language}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </PixelCard>
            </div>
        );
    }

    // 预览生成内容视图
    if (viewMode === "preview" && generatedContent) {
        // 检查是否有需要显示答案的组件
        const hasAnswerableComponents = generatedContent.components.some(
            (c) =>
                c.type === SandboxComponentType.SINGLE_CHOICE ||
                c.type === SandboxComponentType.MULTIPLE_CHOICE ||
                c.type === SandboxComponentType.TRUE_FALSE ||
                c.type === SandboxComponentType.FILL_BLANK ||
                c.type === SandboxComponentType.CLOZE ||
                c.type === SandboxComponentType.MATCHING ||
                c.type === SandboxComponentType.ORDERING
        );

        return (
            <div className="animate-fade-in">
                {/* 顶部 */}
                <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <PixelButton
                            onClick={() => {
                                setViewMode("generate");
                                setShowAnswers(false);
                            }}
                            variant="secondary"
                        >
                            ← {t.back}
                        </PixelButton>
                        <div>
                            <h2 className="text-3xl font-bold">
                                {t.generatedPreview}
                            </h2>
                            <p className="text-gray-600">
                                {generatedContent.metadata.topic}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {hasAnswerableComponents && (
                            <PixelButton
                                variant={showAnswers ? "primary" : "secondary"}
                                onClick={() => setShowAnswers(!showAnswers)}
                            >
                                {showAnswers ? "👁️ " : "👁️‍🗨️ "}
                                {t.showAnswer}
                            </PixelButton>
                        )}
                        <PixelButton
                            variant="secondary"
                            onClick={() => handleGenerate()}
                            disabled={isGenerating}
                        >
                            🔄 {t.regenerate}
                        </PixelButton>
                        {onStartPractice && (
                            <PixelButton onClick={handleStartPractice}>
                                ▶ {t.startPractice}
                            </PixelButton>
                        )}
                    </div>
                </div>

                {/* 生成内容预览 */}
                <PixelCard>
                    <div className="space-y-6">
                        {generatedContent.components.map((component, index) => (
                            <div
                                key={`generated-${index}`}
                                className={
                                    index > 0 &&
                                    component.type !==
                                        SandboxComponentType.DIVIDER
                                        ? "pt-4 border-t border-gray-200"
                                        : ""
                                }
                            >
                                {component.label && (
                                    <div className="text-sm font-bold text-gray-500 mb-2">
                                        {component.label}
                                    </div>
                                )}
                                <SandboxComponentRenderer
                                    component={component}
                                    isPreview={false}
                                    showAnswer={showAnswers}
                                    state={answerState[component.id]}
                                    onStateChange={handleAnswerChange}
                                    language={language}
                                />
                            </div>
                        ))}
                    </div>
                </PixelCard>
            </div>
        );
    }

    // 模板列表视图
    return (
        <div className="animate-fade-in">
            {/* 顶部 */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <PixelButton onClick={onBack} variant="secondary">
                            ← {t.back}
                        </PixelButton>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold">{t.sandboxMode}</h2>
                        <p className="text-gray-600">{t.sandboxModeDesc}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PixelButton variant="secondary" onClick={handleImport}>
                        📥 {t.importTemplate}
                    </PixelButton>
                    <PixelButton
                        onClick={() => {
                            setEditingTemplate(null);
                            setViewMode("edit");
                        }}
                    >
                        + {t.createTemplate}
                    </PixelButton>
                </div>
            </div>

            {/* 模板列表 */}
            {templates.length === 0 ? (
                <PixelCard className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-2xl font-bold mb-2">{t.noTemplates}</h3>
                    <p className="text-gray-600 mb-6">{t.noTemplatesDesc}</p>
                    <PixelButton
                        onClick={() => {
                            setEditingTemplate(null);
                            setViewMode("edit");
                        }}
                    >
                        {t.createFirstTemplate}
                    </PixelButton>
                </PixelCard>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {templates.map((template) => (
                        <PixelCard
                            key={template.id}
                            className="group hover:border-theme hover:shadow-lg transition-all flex flex-col h-full"
                        >
                            {/* 顶部信息 */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-2xl flex-shrink-0">
                                            {template.icon || "📝"}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-bold truncate">
                                                {template.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>
                                                    {template.components.length}{" "}
                                                    {t.components}
                                                </span>
                                                {template.practiceLanguage && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            {
                                                                PRACTICE_LANGUAGES[
                                                                    template.practiceLanguage as PracticeLanguage
                                                                ]?.label
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                                {template.level && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            {template.level}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {template.category && (
                                        <span className="px-2 py-1 bg-gray-100 text-xs rounded font-bold whitespace-nowrap ml-2">
                                            {template.category}
                                        </span>
                                    )}
                                </div>

                                {template.description && (
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {template.description}
                                    </p>
                                )}

                                <div className="text-xs text-gray-400">
                                    {t.updatedAt}{" "}
                                    {new Date(
                                        template.updatedAt
                                    ).toLocaleDateString()}
                                </div>
                            </div>

                            {/* 底部操作按钮 */}
                            <div className="mt-4 pt-3 border-t border-dashed">
                                <div className="flex flex-wrap gap-2">
                                    <PixelButton
                                        size="sm"
                                        onClick={() =>
                                            handleSelectForGeneration(template)
                                        }
                                    >
                                        ✨ {t.generateContent}
                                    </PixelButton>
                                    <PixelButton
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            setEditingTemplate(template);
                                            setViewMode("edit");
                                        }}
                                    >
                                        {t.edit}
                                    </PixelButton>
                                    <button
                                        onClick={() =>
                                            handleDuplicate(template.id)
                                        }
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {t.duplicateTemplate}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleExport(template.id)
                                        }
                                        className="text-sm text-green-600 hover:underline"
                                    >
                                        {t.exportTemplate}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(template.id)
                                        }
                                        className="text-sm text-red-600 hover:underline"
                                    >
                                        {t.delete}
                                    </button>
                                </div>
                            </div>
                        </PixelCard>
                    ))}
                </div>
            )}

            {/* 预设模板提示 */}
            <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded">
                <h4 className="font-bold mb-2">💡 {t.sandboxTip}</h4>
                <p className="text-sm text-gray-700">{t.sandboxModeDesc}</p>
                <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
                    {t.sandboxTipContent.map((tip, index) => (
                        <li key={index}>{tip}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
