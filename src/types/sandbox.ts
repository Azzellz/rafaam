/**
 * Sandbox Mode Types
 * 沙盒模式 - 可视化题型编排系统
 */

// ==================== 基础组件类型 ====================

export enum SandboxComponentType {
    // 文本类
    TEXT = "text", // 纯文本展示
    PASSAGE = "passage", // 长文本/文章
    INSTRUCTION = "instruction", // 指示说明

    // 输入类
    TEXT_INPUT = "text_input", // 文本输入框
    TEXT_AREA = "text_area", // 多行文本输入

    // 选择类
    SINGLE_CHOICE = "single_choice", // 单选题
    MULTIPLE_CHOICE = "multiple_choice", // 多选题
    TRUE_FALSE = "true_false", // 判断题

    // 填空类
    FILL_BLANK = "fill_blank", // 填空（带选项）
    CLOZE = "cloze", // 完型填空

    // 匹配类
    MATCHING = "matching", // 配对题
    ORDERING = "ordering", // 排序题

    // 多媒体
    AUDIO = "audio", // 音频播放

    // 布局类
    DIVIDER = "divider", // 分隔线
    GROUP = "group", // 组合容器
}

// ==================== 组件配置 ====================

/** 基础组件属性 */
interface BaseComponentConfig {
    id: string;
    type: SandboxComponentType;
    label?: string; // 可选标签
    required?: boolean; // 是否必填
    aiGenerated?: boolean; // 是否由AI生成
    aiPromptHint?: string; // 给AI的生成提示
}

/** 文本组件 */
export interface TextComponentConfig extends BaseComponentConfig {
    type:
        | SandboxComponentType.TEXT
        | SandboxComponentType.PASSAGE
        | SandboxComponentType.INSTRUCTION;
    content?: string; // 静态内容或占位符
    style?: "normal" | "highlight" | "quote";
}

/** 文本输入组件 */
export interface TextInputComponentConfig extends BaseComponentConfig {
    type: SandboxComponentType.TEXT_INPUT | SandboxComponentType.TEXT_AREA;
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
    rows?: number; // 仅 TEXT_AREA
    showCorrectAnswer?: boolean;
    correctAnswer?: string;
}

/** 选项 */
export interface ChoiceOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}

/** 单选/多选组件 */
export interface ChoiceComponentConfig extends BaseComponentConfig {
    type:
        | SandboxComponentType.SINGLE_CHOICE
        | SandboxComponentType.MULTIPLE_CHOICE
        | SandboxComponentType.TRUE_FALSE;
    question?: string;
    options: ChoiceOption[];
    explanation?: string;
    shuffleOptions?: boolean;
}

/** 填空组件 */
export interface FillBlankComponentConfig extends BaseComponentConfig {
    type: SandboxComponentType.FILL_BLANK | SandboxComponentType.CLOZE;
    passage?: string; // 带 [BLANK_0], [BLANK_1] 标记的文本
    blanks: {
        id: string;
        correctAnswer: string;
        options?: string[]; // 可选的干扰项
    }[];
}

/** 匹配项 */
export interface MatchingPair {
    id: string;
    left: string;
    right: string;
}

/** 匹配组件 */
export interface MatchingComponentConfig extends BaseComponentConfig {
    type: SandboxComponentType.MATCHING;
    pairs: MatchingPair[];
    shuffleRight?: boolean;
}

/** 排序组件 */
export interface OrderingComponentConfig extends BaseComponentConfig {
    type: SandboxComponentType.ORDERING;
    items: { id: string; text: string; order: number }[];
}

/** 音频组件 */
export interface AudioComponentConfig extends BaseComponentConfig {
    type: SandboxComponentType.AUDIO;
    ttsText?: string; // TTS 文本
    audioUrl?: string; // 或音频URL
    autoPlay?: boolean;
    showTranscript?: boolean;
    transcript?: string;
}

/** 分隔线组件 */
export interface DividerComponentConfig extends BaseComponentConfig {
    type: SandboxComponentType.DIVIDER;
    style?: "solid" | "dashed" | "dotted";
}

/** 组合容器组件 */
export interface GroupComponentConfig extends BaseComponentConfig {
    type: SandboxComponentType.GROUP;
    title?: string;
    children: SandboxComponent[];
    repeatCount?: number; // 重复生成次数
}

/** 所有组件配置的联合类型 */
export type SandboxComponent =
    | TextComponentConfig
    | TextInputComponentConfig
    | ChoiceComponentConfig
    | FillBlankComponentConfig
    | MatchingComponentConfig
    | OrderingComponentConfig
    | AudioComponentConfig
    | DividerComponentConfig
    | GroupComponentConfig;

// ==================== 模板定义 ====================

/** 沙盒模板 */
export interface SandboxTemplate {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    components: SandboxComponent[];
    // 默认练习配置（可选，不设置则使用全局配置）
    practiceLanguage?: string; // 练习语言
    level?: string; // 难度等级
    // AI 生成配置
    aiConfig: {
        systemPrompt?: string; // 系统提示词
        generatePrompt: string; // 生成提示词模板，支持 {topic}, {level}, {language} 变量
        outputSchema?: Record<string, any>; // JSON Schema
    };
    createdAt: number;
    updatedAt: number;
}

/** 生成的沙盒内容 */
export interface SandboxGeneratedContent {
    templateId: string;
    templateName: string;
    components: SandboxComponent[]; // 填充了内容的组件
    metadata: {
        topic: string;
        level: string;
        practiceLanguage: string;
        generatedAt: number;
    };
}

// ==================== 组件元数据（用于UI） ====================

export interface ComponentMeta {
    type: SandboxComponentType;
    name: string;
    icon: string;
    description: string;
    category:
        | "text"
        | "input"
        | "choice"
        | "fill"
        | "match"
        | "media"
        | "layout";
    defaultConfig: Partial<SandboxComponent>;
}

/** 所有可用组件的元数据 */
export const SANDBOX_COMPONENT_METAS: ComponentMeta[] = [
    // 文本类
    {
        type: SandboxComponentType.TEXT,
        name: "文本",
        icon: "📝",
        description: "显示普通文本",
        category: "text",
        defaultConfig: { content: "" },
    },
    {
        type: SandboxComponentType.PASSAGE,
        name: "文章",
        icon: "📄",
        description: "显示长文本或阅读材料",
        category: "text",
        defaultConfig: { content: "", style: "normal" },
    },
    {
        type: SandboxComponentType.INSTRUCTION,
        name: "指示",
        icon: "💡",
        description: "显示题目说明或指示",
        category: "text",
        defaultConfig: { content: "", style: "highlight" },
    },
    // 输入类
    {
        type: SandboxComponentType.TEXT_INPUT,
        name: "文本输入",
        icon: "✏️",
        description: "单行文本输入框",
        category: "input",
        defaultConfig: { placeholder: "" },
    },
    {
        type: SandboxComponentType.TEXT_AREA,
        name: "文本区域",
        icon: "📝",
        description: "多行文本输入框",
        category: "input",
        defaultConfig: { placeholder: "", rows: 4 },
    },
    // 选择类
    {
        type: SandboxComponentType.SINGLE_CHOICE,
        name: "单选题",
        icon: "🔘",
        description: "单项选择题",
        category: "choice",
        defaultConfig: {
            question: "",
            options: [
                { id: "a", text: "", isCorrect: true },
                { id: "b", text: "" },
                { id: "c", text: "" },
                { id: "d", text: "" },
            ],
        },
    },
    {
        type: SandboxComponentType.MULTIPLE_CHOICE,
        name: "多选题",
        icon: "☑️",
        description: "多项选择题",
        category: "choice",
        defaultConfig: {
            question: "",
            options: [
                { id: "a", text: "" },
                { id: "b", text: "" },
                { id: "c", text: "" },
                { id: "d", text: "" },
            ],
        },
    },
    {
        type: SandboxComponentType.TRUE_FALSE,
        name: "判断题",
        icon: "✓✗",
        description: "是非判断题",
        category: "choice",
        defaultConfig: {
            question: "",
            options: [
                { id: "true", text: "正确", isCorrect: true },
                { id: "false", text: "错误" },
            ],
        },
    },
    // 填空类
    {
        type: SandboxComponentType.FILL_BLANK,
        name: "填空题",
        icon: "___",
        description: "带选项的填空题",
        category: "fill",
        defaultConfig: { passage: "", blanks: [] },
    },
    {
        type: SandboxComponentType.CLOZE,
        name: "完型填空",
        icon: "📋",
        description: "阅读完型填空",
        category: "fill",
        defaultConfig: { passage: "", blanks: [] },
    },
    // 匹配类
    {
        type: SandboxComponentType.MATCHING,
        name: "配对题",
        icon: "🔗",
        description: "左右配对匹配",
        category: "match",
        defaultConfig: { pairs: [] },
    },
    {
        type: SandboxComponentType.ORDERING,
        name: "排序题",
        icon: "🔢",
        description: "拖拽排序",
        category: "match",
        defaultConfig: { items: [] },
    },
    // 多媒体
    {
        type: SandboxComponentType.AUDIO,
        name: "音频",
        icon: "🔊",
        description: "播放音频或TTS",
        category: "media",
        defaultConfig: { ttsText: "", showTranscript: false },
    },
    // 布局
    {
        type: SandboxComponentType.DIVIDER,
        name: "分隔线",
        icon: "➖",
        description: "分隔线",
        category: "layout",
        defaultConfig: { style: "dashed" },
    },
    {
        type: SandboxComponentType.GROUP,
        name: "题组",
        icon: "📦",
        description: "将多个组件组合成一组",
        category: "layout",
        defaultConfig: { title: "", children: [], repeatCount: 1 },
    },
];

// ==================== 工具函数 ====================

/** 生成唯一ID */
export const generateComponentId = (): string =>
    `comp_${Math.random().toString(36).substring(2, 9)}`;

/** 创建新组件 */
export const createComponent = (
    type: SandboxComponentType
): SandboxComponent => {
    const meta = SANDBOX_COMPONENT_METAS.find((m) => m.type === type);
    return {
        id: generateComponentId(),
        type,
        aiGenerated: true,
        ...meta?.defaultConfig,
    } as SandboxComponent;
};

/** 创建空模板 */
export const createEmptyTemplate = (): Omit<SandboxTemplate, "id"> => ({
    name: "",
    description: "",
    components: [],
    practiceLanguage: undefined, // 使用全局配置
    level: undefined, // 使用全局配置
    aiConfig: {
        generatePrompt: "",
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
});
