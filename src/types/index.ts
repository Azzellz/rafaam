export enum ContentType {
    GRAMMAR = "GRAMMAR",
    QUIZ = "QUIZ",
    CONVERSATION = "CONVERSATION",
    WRITING = "WRITING",
    CHAT = "CHAT",
    CUSTOM = "CUSTOM",
}

export interface CustomField {
    key: string;
    label: string;
    description?: string;
}

export interface CustomTypeDefinition {
    id: string;
    name: string;
    description: string;
    prompt: string;
    fields: CustomField[];
}

export interface CustomContentData {
    title: string;
    items: Record<string, string>[];
    definition: CustomTypeDefinition;
}

export enum Language {
    EN = "en",
    ZH_CN = "zh-CN",
    ZH_TW = "zh-TW",
    JA = "ja",
    FR = "fr",
    DE = "de",
}

export enum PracticeLanguage {
    JAPANESE = "japanese",
    ENGLISH = "english",
    FRENCH = "french",
    GERMAN = "german",
}

export interface ExampleSentence {
    text: string;
    phonetic?: string;
    translation: string;
}

export interface GrammarPoint {
    pattern: string;
    meaning: string;
    explanation: string;
    examples: ExampleSentence[];
    practiceLanguage?: PracticeLanguage;
}

export interface GrammarLesson {
    title: string;
    introduction: string;
    points: GrammarPoint[];
    practiceLanguage: PracticeLanguage;
    level: string;
    topic: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface QuizSession {
    title: string;
    questions: QuizQuestion[];
    practiceLanguage: PracticeLanguage;
    level: string;
    topic: string;
}

export interface ConversationSession {
    topic: string;
    level: string;
    practiceLanguage: PracticeLanguage;
}

export interface ChatSession {
    topic: string;
    level: string;
    practiceLanguage: PracticeLanguage;
}

export interface WritingTask {
    topic: string;
    level: string;
    practiceLanguage: PracticeLanguage;
    prompt: string;
    hints?: string[];
}

export interface WritingEvaluation {
    correctedText: string;
    feedback: string;
    score: number;
    improvements: string[];
}

export interface BackgroundConfig {
    imageData: string | null; // Base64 string
    blur: number; // 0-20px
    overlayOpacity: number; // 0.0-1.0
    themeColor?: string; // Hex color
}

// Discriminated union for the result
export type GeneratedContent =
    | { type: ContentType.GRAMMAR; data: GrammarLesson }
    | { type: ContentType.QUIZ; data: QuizSession }
    | { type: ContentType.CONVERSATION; data: ConversationSession }
    | { type: ContentType.WRITING; data: WritingTask }
    | { type: ContentType.CHAT; data: ChatSession }
    | { type: ContentType.CUSTOM; data: CustomContentData };

export interface PracticeRecord {
    id: string;
    timestamp: number;
    type: ContentType;
    language: PracticeLanguage;
    topic: string;
    score?: number; // For quiz and writing
    maxScore?: number; // For quiz
    duration?: number; // In seconds
}
