export enum ContentType {
    GRAMMAR = "GRAMMAR",
    QUIZ = "QUIZ",
    CONVERSATION = "CONVERSATION",
    WRITING = "WRITING",
    CHAT = "CHAT",
    LISTENING = "LISTENING",
    READING = "READING",
    CLOZE = "CLOZE",
    CUSTOM = "CUSTOM",
}

export interface ListeningQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface ListeningExercise {
    title: string;
    transcript: string;
    questions: ListeningQuestion[];
    practiceLanguage: PracticeLanguage;
    level: string;
    topic: string;
}

export interface ReadingQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface ReadingExercise {
    title: string;
    passage: string;
    questions: ReadingQuestion[];
    practiceLanguage: PracticeLanguage;
    level: string;
    topic: string;
}

export interface ClozeBlank {
    correctAnswer: string;
    options: string[];
}

export interface ClozeExercise {
    title: string;
    passage: string;
    blanks: ClozeBlank[];
    practiceLanguage: PracticeLanguage;
    level: string;
    topic: string;
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
    JA = "ja",
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
    | { type: ContentType.LISTENING; data: ListeningExercise }
    | { type: ContentType.READING; data: ReadingExercise }
    | { type: ContentType.CLOZE; data: ClozeExercise }
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

export type DailyGoalType = "count" | "duration";

export interface StudyPlan {
    enabled: boolean;
    type: DailyGoalType;
    target: number; // count or minutes
}

export interface DailyProgress {
    date: string; // YYYY-MM-DD
    count: number;
    duration: number; // seconds
    isCompleted: boolean;
}

export interface AIConfig {
    defaultModel: string;
    chatModel: string;
    conversationModel: string;
    temperature: number;
}
