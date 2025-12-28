/**
 * Sandbox Content Generator
 * 沙盒模板内容生成器
 */

import { Type, Schema } from "@google/genai";
import {
    SandboxTemplate,
    SandboxComponent,
    SandboxComponentType,
    SandboxGeneratedContent,
    TextComponentConfig,
    ChoiceComponentConfig,
    FillBlankComponentConfig,
    MatchingComponentConfig,
    OrderingComponentConfig,
    AudioComponentConfig,
    GroupComponentConfig,
} from "@/types/sandbox";
import { Language, PracticeLanguage } from "@/types";
import { LANGUAGE_CONFIG } from "@/constants/languages";
import {
    PRACTICE_LANGUAGES,
    DEFAULT_PRACTICE_LANGUAGE,
} from "@/constants/practiceLanguages";
import { getProviderForType } from "./providers";

const getLanguageName = (lang: Language): string =>
    LANGUAGE_CONFIG[lang]?.aiName ?? LANGUAGE_CONFIG[Language.EN].aiName;

/**
 * 根据组件结构生成JSON Schema
 */
const buildSchemaFromComponents = (
    components: SandboxComponent[]
): { schema: Schema; componentMap: Map<string, SandboxComponent> } => {
    const componentMap = new Map<string, SandboxComponent>();
    const properties: Record<string, any> = {};

    const processComponent = (comp: SandboxComponent, prefix = "") => {
        const key = prefix ? `${prefix}_${comp.id}` : comp.id;
        componentMap.set(key, comp);

        // 只处理需要AI生成内容的组件（默认为true，与UI一致）
        if (comp.aiGenerated === false) return;

        switch (comp.type) {
            case SandboxComponentType.TEXT:
            case SandboxComponentType.PASSAGE:
            case SandboxComponentType.INSTRUCTION:
                properties[key] = {
                    type: Type.STRING,
                    description:
                        comp.aiPromptHint || `Content for ${comp.type}`,
                };
                break;

            case SandboxComponentType.SINGLE_CHOICE:
            case SandboxComponentType.MULTIPLE_CHOICE:
            case SandboxComponentType.TRUE_FALSE:
                properties[key] = {
                    type: Type.OBJECT,
                    properties: {
                        question: {
                            type: Type.STRING,
                            description: "The question text",
                        },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    text: { type: Type.STRING },
                                    isCorrect: { type: Type.BOOLEAN },
                                },
                                required: ["id", "text", "isCorrect"],
                            },
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "Explanation for the correct answer",
                        },
                    },
                    required: ["question", "options"],
                };
                break;

            case SandboxComponentType.FILL_BLANK:
            case SandboxComponentType.CLOZE:
                const blankCount =
                    (comp as FillBlankComponentConfig).blanks?.length || 5;
                properties[key] = {
                    type: Type.OBJECT,
                    properties: {
                        passage: {
                            type: Type.STRING,
                            description: `Text with [BLANK_0] to [BLANK_${
                                blankCount - 1
                            }] markers`,
                        },
                        blanks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    correctAnswer: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                    },
                                },
                                required: ["id", "correctAnswer"],
                            },
                        },
                    },
                    required: ["passage", "blanks"],
                };
                break;

            case SandboxComponentType.MATCHING:
                const pairCount =
                    (comp as MatchingComponentConfig).pairs?.length || 4;
                properties[key] = {
                    type: Type.OBJECT,
                    properties: {
                        pairs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    left: { type: Type.STRING },
                                    right: { type: Type.STRING },
                                },
                                required: ["id", "left", "right"],
                            },
                            description: `${pairCount} matching pairs`,
                        },
                    },
                    required: ["pairs"],
                };
                break;

            case SandboxComponentType.ORDERING:
                const itemCount =
                    (comp as OrderingComponentConfig).items?.length || 4;
                properties[key] = {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    text: { type: Type.STRING },
                                    order: {
                                        type: Type.NUMBER,
                                        description: "Correct order (1-based)",
                                    },
                                },
                                required: ["id", "text", "order"],
                            },
                            description: `${itemCount} items to order`,
                        },
                    },
                    required: ["items"],
                };
                break;

            case SandboxComponentType.AUDIO:
                properties[key] = {
                    type: Type.OBJECT,
                    properties: {
                        ttsText: {
                            type: Type.STRING,
                            description: "Text to be spoken",
                        },
                        transcript: {
                            type: Type.STRING,
                            description: "Transcript of the audio",
                        },
                    },
                    required: ["ttsText"],
                };
                break;

            case SandboxComponentType.GROUP:
                const groupComp = comp as GroupComponentConfig;
                if (groupComp.children) {
                    groupComp.children.forEach((child) =>
                        processComponent(child, key)
                    );
                }
                break;

            // 这些组件类型不支持AI生成
            case SandboxComponentType.TEXT_INPUT:
            case SandboxComponentType.TEXT_AREA:
            case SandboxComponentType.DIVIDER:
                // 跳过，这些组件不需要AI生成内容
                break;
        }
    };

    components.forEach((comp) => processComponent(comp));

    const schema: Schema = {
        type: Type.OBJECT,
        properties,
        required: Object.keys(properties),
    };

    return { schema, componentMap };
};

/**
 * 将生成的数据填充到组件中
 */
const fillComponentsWithData = (
    components: SandboxComponent[],
    data: Record<string, any>,
    componentMap: Map<string, SandboxComponent>,
    prefix = ""
): SandboxComponent[] => {
    return components.map((comp) => {
        const key = prefix ? `${prefix}_${comp.id}` : comp.id;
        const generatedData = data[key];

        // 深拷贝组件
        const newComp = JSON.parse(JSON.stringify(comp)) as SandboxComponent;

        // aiGenerated 默认为 true（与UI一致）
        if (comp.aiGenerated === false || !generatedData) {
            // 处理GROUP的子组件
            if (comp.type === SandboxComponentType.GROUP) {
                const groupComp = newComp as GroupComponentConfig;
                groupComp.children = fillComponentsWithData(
                    (comp as GroupComponentConfig).children,
                    data,
                    componentMap,
                    key
                );
            }
            return newComp;
        }

        switch (comp.type) {
            case SandboxComponentType.TEXT:
            case SandboxComponentType.PASSAGE:
            case SandboxComponentType.INSTRUCTION:
                (newComp as TextComponentConfig).content =
                    generatedData as string;
                break;

            case SandboxComponentType.SINGLE_CHOICE:
            case SandboxComponentType.MULTIPLE_CHOICE:
            case SandboxComponentType.TRUE_FALSE:
                const choiceComp = newComp as ChoiceComponentConfig;
                choiceComp.question = generatedData.question;
                choiceComp.options = generatedData.options;
                choiceComp.explanation = generatedData.explanation;
                break;

            case SandboxComponentType.FILL_BLANK:
            case SandboxComponentType.CLOZE:
                const fillComp = newComp as FillBlankComponentConfig;
                fillComp.passage = generatedData.passage;
                fillComp.blanks = generatedData.blanks;
                break;

            case SandboxComponentType.MATCHING:
                const matchComp = newComp as MatchingComponentConfig;
                matchComp.pairs = generatedData.pairs;
                break;

            case SandboxComponentType.ORDERING:
                const orderComp = newComp as OrderingComponentConfig;
                orderComp.items = generatedData.items;
                break;

            case SandboxComponentType.AUDIO:
                const audioComp = newComp as AudioComponentConfig;
                audioComp.ttsText = generatedData.ttsText;
                audioComp.transcript = generatedData.transcript;
                break;

            case SandboxComponentType.GROUP:
                const groupComp = newComp as GroupComponentConfig;
                groupComp.children = fillComponentsWithData(
                    (comp as GroupComponentConfig).children,
                    data,
                    componentMap,
                    key
                );
                break;
        }

        return newComp;
    });
};

/**
 * 生成组件内容描述（用于提示词）
 */
const buildComponentDescriptions = (
    components: SandboxComponent[],
    prefix = ""
): string => {
    const descriptions: string[] = [];

    components.forEach((comp) => {
        // aiGenerated 默认为 true（与UI一致）
        if (comp.aiGenerated === false) return;

        const key = prefix ? `${prefix}_${comp.id}` : comp.id;
        let desc = `- ${key}: `;

        switch (comp.type) {
            case SandboxComponentType.TEXT:
                desc += `Generate text content${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.PASSAGE:
                desc += `Generate a reading passage${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.INSTRUCTION:
                desc += `Generate instruction text${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.SINGLE_CHOICE:
                const scOpts =
                    (comp as ChoiceComponentConfig).options?.length || 4;
                desc += `Generate a single-choice question with ${scOpts} options${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.MULTIPLE_CHOICE:
                const mcOpts =
                    (comp as ChoiceComponentConfig).options?.length || 4;
                desc += `Generate a multiple-choice question with ${mcOpts} options${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.TRUE_FALSE:
                desc += `Generate a true/false question${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.FILL_BLANK:
            case SandboxComponentType.CLOZE:
                const blanks =
                    (comp as FillBlankComponentConfig).blanks?.length || 5;
                desc += `Generate a fill-in-the-blank passage with ${blanks} blanks marked as [BLANK_0], [BLANK_1], etc.${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.MATCHING:
                const pairs =
                    (comp as MatchingComponentConfig).pairs?.length || 4;
                desc += `Generate ${pairs} matching pairs${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.ORDERING:
                const items =
                    (comp as OrderingComponentConfig).items?.length || 4;
                desc += `Generate ${items} items to be ordered${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.AUDIO:
                desc += `Generate text for TTS audio${
                    comp.aiPromptHint ? ` (${comp.aiPromptHint})` : ""
                }`;
                break;
            case SandboxComponentType.GROUP:
                const groupComp = comp as GroupComponentConfig;
                if (groupComp.children?.length) {
                    descriptions.push(desc + "Group containing:");
                    descriptions.push(
                        buildComponentDescriptions(groupComp.children, key)
                    );
                }
                return;
        }

        descriptions.push(desc);
    });

    return descriptions.join("\n");
};

/**
 * 根据沙盒模板生成内容
 */
export const generateSandboxContent = async (
    template: SandboxTemplate,
    topic: string,
    level: string,
    practiceLanguage: PracticeLanguage,
    language: Language
): Promise<SandboxGeneratedContent> => {
    const langName = getLanguageName(language);
    const practiceConfig =
        PRACTICE_LANGUAGES[practiceLanguage] ??
        PRACTICE_LANGUAGES[DEFAULT_PRACTICE_LANGUAGE];
    const targetLanguage = practiceConfig.targetLanguageName;
    const levelLabel = practiceConfig.levelSystemLabel;

    // 构建Schema
    const { schema, componentMap } = buildSchemaFromComponents(
        template.components
    );

    // 如果没有需要生成的组件，直接返回
    if (Object.keys(schema.properties || {}).length === 0) {
        return {
            templateId: template.id,
            templateName: template.name,
            components: JSON.parse(JSON.stringify(template.components)),
            metadata: {
                topic,
                level,
                practiceLanguage,
                generatedAt: Date.now(),
            },
        };
    }

    // 构建组件描述
    const componentDescriptions = buildComponentDescriptions(
        template.components
    );

    // 构建提示词
    const generatePrompt = template.aiConfig.generatePrompt
        .replace(/{topic}/g, topic)
        .replace(/{level}/g, level)
        .replace(/{language}/g, targetLanguage);

    const prompt = `
Task: Generate content for a ${targetLanguage} learning exercise.

Template Description: ${template.description || template.name}

Generation Instructions:
${generatePrompt}

Target Language: ${targetLanguage}
Learner Level: ${levelLabel} ${level}
Topic: "${topic}"
User's Native Language: ${langName}

Components to generate:
${componentDescriptions}

IMPORTANT:
- Generate content for the target language (${targetLanguage})
- Write explanations and instructions in the user's language (${langName})
- Follow the exact JSON schema structure
- Ensure all content is appropriate for the specified level
- Make content engaging and educational
`;

    const systemPrompt =
        template.aiConfig.systemPrompt ||
        `You are an expert ${targetLanguage} language teacher creating exercises for ${langName}-speaking learners.`;

    // 调用AI生成
    const provider = await getProviderForType("text");
    const generatedData = await provider.generateStructuredData(
        prompt,
        schema,
        undefined,
        { systemPrompt }
    );

    // 填充组件
    const filledComponents = fillComponentsWithData(
        template.components,
        generatedData,
        componentMap
    );

    return {
        templateId: template.id,
        templateName: template.name,
        components: filledComponents,
        metadata: {
            topic,
            level,
            practiceLanguage,
            generatedAt: Date.now(),
        },
    };
};
