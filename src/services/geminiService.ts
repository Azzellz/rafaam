import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import {
    ContentType,
    GrammarLesson,
    GrammarPoint,
    QuizSession,
    Language,
    PracticeLanguage,
} from "../types";
import { LANGUAGE_CONFIG } from "@/constants/languages";
import {
    PRACTICE_LANGUAGES,
    PracticeLanguageConfig,
    DEFAULT_PRACTICE_LANGUAGE,
} from "@/constants/practiceLanguages";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const grammarSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Title of the lesson" },
        introduction: {
            type: Type.STRING,
            description: "Brief intro to the topic",
        },
        points: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    pattern: {
                        type: Type.STRING,
                        description:
                            "The grammar pattern (e.g., ～てはいけません)",
                    },
                    meaning: {
                        type: Type.STRING,
                        description: "Meaning in the user's language",
                    },
                    explanation: {
                        type: Type.STRING,
                        description:
                            "Detailed explanation in the user's language",
                    },
                    examples: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: {
                                    type: Type.STRING,
                                    description:
                                        "Example sentence in the target language",
                                },
                                phonetic: {
                                    type: Type.STRING,
                                    description:
                                        "Optional phonetic transcription for the sentence",
                                },
                                translation: {
                                    type: Type.STRING,
                                    description:
                                        "Translation in the user's language",
                                },
                            },
                            required: ["text", "translation"],
                        },
                    },
                },
                required: ["pattern", "meaning", "explanation", "examples"],
            },
        },
    },
    required: ["title", "introduction", "points"],
};

const quizSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "The question text in the target language",
                    },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "4 multiple choice options",
                    },
                    correctIndex: {
                        type: Type.INTEGER,
                        description: "Index of correct answer (0-3)",
                    },
                    explanation: {
                        type: Type.STRING,
                        description:
                            "Why the answer is correct (in the user's language)",
                    },
                },
                required: [
                    "question",
                    "options",
                    "correctIndex",
                    "explanation",
                ],
            },
        },
    },
    required: ["title", "questions"],
};

const getLanguageName = (lang: Language): string =>
    LANGUAGE_CONFIG[lang]?.aiName ?? LANGUAGE_CONFIG[Language.EN].aiName;

type RawGrammarLesson = Omit<
    GrammarLesson,
    "practiceLanguage" | "level" | "topic" | "points"
> & { points: Omit<GrammarPoint, "practiceLanguage">[] };

type RawQuizSession = Omit<QuizSession, "practiceLanguage" | "level" | "topic">;

export const generateLesson = async (
    level: string,
    topic: string,
    contentType: ContentType,
    language: Language,
    practiceLanguage: PracticeLanguage
): Promise<GrammarLesson | QuizSession> => {
    const model = "gemini-2.5-flash";
    const langName = getLanguageName(language);
    const practiceConfig: PracticeLanguageConfig =
        PRACTICE_LANGUAGES[practiceLanguage] ??
        PRACTICE_LANGUAGES[PracticeLanguage.JAPANESE];
    const targetLanguage = practiceConfig.targetLanguageName;
    const levelLabel = practiceConfig.levelSystemLabel;

    if (contentType === ContentType.GRAMMAR) {
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

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: grammarSchema,
            },
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        const rawLesson = JSON.parse(text) as RawGrammarLesson;
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
    } else {
        const prompt = `Create a ${targetLanguage} quiz (5 questions) for ${levelLabel} level ${level} learners focused on the topic: "${topic}".
    The questions should test grammar or vocabulary relevant to the topic.

    IMPORTANT:
    - Write every question and option in ${targetLanguage}.
    - Write the explanation for each correct answer in ${langName}.
    `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        const rawQuiz = JSON.parse(text) as RawQuizSession;
        return {
            ...rawQuiz,
            practiceLanguage,
            level,
            topic,
        } as QuizSession;
    }
};

export const generateRandomTopic = async (
    practiceLanguage: PracticeLanguage,
    language: Language
): Promise<string> => {
    const model = "gemini-2.5-flash";
    const langName = getLanguageName(language);
    const practiceConfig =
        PRACTICE_LANGUAGES[practiceLanguage] ??
        PRACTICE_LANGUAGES[PracticeLanguage.JAPANESE];
    const targetLanguage = practiceConfig.targetLanguageName;

    const prompt = `Suggest one imaginative ${langName} keyword or short phrase (max 4 words) that would be an engaging topic for practicing ${targetLanguage}. Return only the keyword without numbering, quotes, or extra text.`;

    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
    });

    const suggestion = response.text?.trim();
    if (!suggestion) {
        throw new Error("No topic generated");
    }

    return suggestion.replace(/^['"\s]+|['"\s]+$/g, "");
};

export const generateSpeech = async (
    text: string,
    practiceLanguage: PracticeLanguage = DEFAULT_PRACTICE_LANGUAGE
): Promise<string> => {
    if (!text || !text.trim()) {
        throw new Error("Text is empty");
    }

    const voiceName =
        PRACTICE_LANGUAGES[practiceLanguage]?.ttsVoice ||
        PRACTICE_LANGUAGES[DEFAULT_PRACTICE_LANGUAGE].ttsVoice;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text.trim() }] }],
        config: {
            // Cast string to Modality to avoid potential enum resolution issues in some environments
            responseModalities: ["AUDIO" as Modality],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];

    if (part?.inlineData?.data) {
        return part.inlineData.data;
    }

    if (part?.text) {
        console.warn("TTS returned text instead of audio:", part.text);
        // Sometimes the model returns text if it refuses the prompt or encounters an error
        throw new Error(`TTS generation failed: ${part.text}`);
    }

    throw new Error("No audio data returned");
};
