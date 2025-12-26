// 向后兼容导出
export { getAIClient } from "./adapter";

// 新架构导出
export * from "./providers";

// 其他导出
export {
    grammarSchema,
    quizSchema,
    listeningSchema,
    writingTaskSchema,
    writingEvaluationSchema,
} from "./schemas";
export { generateLesson, generateRandomTopic } from "./generators";
export { generateSpeech } from "./speech";
export { translateText } from "./translation";
export { evaluateWriting } from "./evaluation";
