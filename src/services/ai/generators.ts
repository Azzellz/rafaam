import { Type, Schema } from "@google/genai";
import {
    ContentType,
    GrammarLesson,
    GrammarPoint,
    QuizSession,
    ListeningExercise,
    WritingTask,
    Language,
    PracticeLanguage,
    CustomTypeDefinition,
    CustomContentData,
} from "../../types";
import { LANGUAGE_CONFIG } from "@/constants/languages";
import {
    PRACTICE_LANGUAGES,
    PracticeLanguageConfig,
    DEFAULT_PRACTICE_LANGUAGE,
} from "@/constants/practiceLanguages";
import { getAIConfig } from "../storage";
import { getProviderForType } from "./providers";
import {
    grammarSchema,
    quizSchema,
    listeningSchema,
    writingTaskSchema,
} from "./schemas";

const getLanguageName = (lang: Language): string =>
    LANGUAGE_CONFIG[lang]?.aiName ?? LANGUAGE_CONFIG[Language.EN].aiName;

type RawGrammarLesson = Omit<
    GrammarLesson,
    "practiceLanguage" | "level" | "topic" | "points"
> & { points: Omit<GrammarPoint, "practiceLanguage">[] };

type RawQuizSession = Omit<QuizSession, "practiceLanguage" | "level" | "topic">;

type RawWritingTask = Omit<WritingTask, "practiceLanguage" | "level" | "topic">;

export const generateLesson = async (
    level: string,
    topic: string,
    contentType: ContentType,
    language: Language,
    practiceLanguage: PracticeLanguage,
    customTypeDefinition?: CustomTypeDefinition
): Promise<
    | GrammarLesson
    | QuizSession
    | WritingTask
    | CustomContentData
    | ListeningExercise
> => {
    const aiConfig = await getAIConfig();
    const model = aiConfig.defaultModel;
    const langName = getLanguageName(language);
    const practiceConfig: PracticeLanguageConfig =
        PRACTICE_LANGUAGES[practiceLanguage] ??
        PRACTICE_LANGUAGES[DEFAULT_PRACTICE_LANGUAGE];
    const targetLanguage = practiceConfig.targetLanguageName;
    const levelLabel = practiceConfig.levelSystemLabel;

    if (contentType === ContentType.CUSTOM && customTypeDefinition) {
        const fieldProperties: Record<string, any> = {};
        const requiredFields: string[] = [];

        customTypeDefinition.fields.forEach((field) => {
            fieldProperties[field.key] = {
                type: Type.STRING,
                description: field.description || field.label,
            };
            requiredFields.push(field.key);
        });

        const customSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                title: {
                    type: Type.STRING,
                    description: "Title of the content",
                },
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: fieldProperties,
                        required: requiredFields,
                    },
                },
            },
            required: ["title", "items"],
        };

        const prompt = `
        Task: ${customTypeDefinition.prompt}
        Target Language: ${targetLanguage}
        Learner Level: ${levelLabel} ${level}
        Topic: "${topic}"
        User Language: ${langName}

        Generate content based on the task description.
        Ensure the output matches the JSON schema structure.
        `;

        const provider = await getProviderForType("text");
        const rawData = await provider.generateStructuredData(
            prompt,
            customSchema,
            { model }
        );

        return {
            title: rawData.title,
            items: rawData.items,
            definition: customTypeDefinition,
        } as CustomContentData;
    } else if (contentType === ContentType.GRAMMAR) {
        const prompt = `Create a ${targetLanguage} grammar lesson for ${levelLabel} level ${level} learners focused on the topic: "${topic}".
Provide 2-3 grammar points relevant to this topic and level.

IMPORTANT:
- Write the 'introduction', 'meaning', and 'explanation' fields in ${langName}.
- Each example must include:
  * 'text' in ${targetLanguage}.
  * 'phonetic' (use an empty string if not applicable).
  * 'translation' in ${langName}.
- Keep the JSON structure exactly as specified by the schema.
`;

        const provider = await getProviderForType("text");
        const rawLesson =
            await provider.generateStructuredData<RawGrammarLesson>(
                prompt,
                grammarSchema,
                { model }
            );
        return {
            ...rawLesson,
            practiceLanguage,
            level,
            topic,
            points: rawLesson.points.map((point) => ({
                ...point,
                practiceLanguage,
            })),
        } as GrammarLesson;
    } else if (contentType === ContentType.QUIZ) {
        const prompt = `Create a ${targetLanguage} quiz (5 questions) for ${levelLabel} level ${level} learners focused on the topic: "${topic}".
    The questions should test grammar or vocabulary relevant to the topic.

    IMPORTANT:
    - Write every question and option in ${targetLanguage}.
    - Write the explanation for each correct answer in ${langName}.
    `;

        const provider = await getProviderForType("text");
        const rawQuiz = await provider.generateStructuredData<RawQuizSession>(
            prompt,
            quizSchema,
            { model }
        );
        return {
            ...rawQuiz,
            practiceLanguage,
            level,
            topic,
        } as QuizSession;
    } else if (contentType === ContentType.LISTENING) {
        const prompt = `Create a ${targetLanguage} listening exercise for ${levelLabel} level ${level} learners focused on the topic: "${topic}".
        1. Generate a short story or dialogue (approx. 100-150 words) suitable for this level.
        2. Create 3 comprehension questions based on the text.

        IMPORTANT:
        - The 'transcript' must be in ${targetLanguage}.
        - The 'questions' and 'options' must be in ${targetLanguage}.
        - The 'explanation' for the correct answer must be in ${langName}.
        `;

        const provider = await getProviderForType("text");
        const rawData = await provider.generateStructuredData(
            prompt,
            listeningSchema,
            { model }
        );
        return {
            ...rawData,
            practiceLanguage,
            level,
            topic,
        };
    } else if (contentType === ContentType.WRITING) {
        const prompt = `Create a ${targetLanguage} writing task for ${levelLabel} level ${level} learners focused on the topic: "${topic}".
        Provide a writing prompt and some optional hints or vocabulary.

        IMPORTANT:
        - Write the 'prompt' in ${langName}.
        - Write 'hints' in ${targetLanguage} with ${langName} translations if necessary.
        `;

        const provider = await getProviderForType("text");
        const rawTask = await provider.generateStructuredData<RawWritingTask>(
            prompt,
            writingTaskSchema,
            { model }
        );
        return {
            ...rawTask,
            practiceLanguage,
            level,
            topic,
        } as WritingTask;
    } else {
        throw new Error(`Unsupported content type: ${contentType}`);
    }
};

export const generateRandomTopic = async (
    practiceLanguage: PracticeLanguage,
    language: Language
): Promise<string> => {
    const aiConfig = await getAIConfig();
    const model = aiConfig.defaultModel;
    const langName = getLanguageName(language);
    const practiceConfig =
        PRACTICE_LANGUAGES[practiceLanguage] ??
        PRACTICE_LANGUAGES[DEFAULT_PRACTICE_LANGUAGE];
    const targetLanguage = practiceConfig.targetLanguageName;

    const prompt = `Suggest one imaginative ${langName} keyword or short phrase (max 4 words) that would be an engaging topic for practicing ${targetLanguage}. Return only the keyword without numbering, quotes, or extra text.`;

    const provider = await getProviderForType("text");
    const suggestion = await provider.generateText(prompt, { model });

    return suggestion.replace(/^['"\s]+|['"\s]+$/g, "");
};
