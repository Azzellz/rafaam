/**
 * AI 服务统一导出
 */

// ===== Provider 架构 =====
export * from "./providers";

// ===== 核心功能 =====
// 内容生成
export { generateLesson, generateRandomTopic } from "./generators";

// 内容评估
export { evaluateWriting } from "./evaluation";

// 翻译服务
export { translateText } from "./translation";

// 语音服务
export { generateSpeech } from "./speech";

// ===== Schema 定义 =====
export {
    grammarSchema,
    quizSchema,
    listeningSchema,
    readingSchema,
    writingTaskSchema,
    writingEvaluationSchema,
} from "./schemas";

// ===== 工具函数 =====
export * from "./validation";
export * from "./configErrorHandler";
