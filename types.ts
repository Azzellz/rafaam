export enum JLPTLevel {
  N5 = "N5",
  N4 = "N4",
  N3 = "N3",
  N2 = "N2",
  N1 = "N1",
}

export enum ContentType {
  GRAMMAR = "GRAMMAR",
  QUIZ = "QUIZ",
  CONVERSATION = "CONVERSATION",
}

export enum Language {
  EN = "en",
  ZH_CN = "zh-CN",
  ZH_TW = "zh-TW",
  JA = "ja"
}

export interface ExampleSentence {
  japanese: string;
  romaji: string;
  translation: string;
}

export interface GrammarPoint {
  pattern: string;
  meaning: string;
  explanation: string;
  examples: ExampleSentence[];
}

export interface GrammarLesson {
  title: string;
  introduction: string;
  points: GrammarPoint[];
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
}

export interface ConversationSession {
  topic: string;
  level: JLPTLevel;
}

// Discriminated union for the result
export type GeneratedContent = 
  | { type: ContentType.GRAMMAR; data: GrammarLesson }
  | { type: ContentType.QUIZ; data: QuizSession }
  | { type: ContentType.CONVERSATION; data: ConversationSession };