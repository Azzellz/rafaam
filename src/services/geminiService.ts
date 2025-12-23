import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import {
    JLPTLevel,
    ContentType,
    GrammarLesson,
    QuizSession,
    Language,
} from "../types";
import { LANGUAGE_CONFIG } from "@/constants/languages";

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
                                japanese: { type: Type.STRING },
                                romaji: { type: Type.STRING },
                                translation: {
                                    type: Type.STRING,
                                    description:
                                        "Translation in the user's language",
                                },
                            },
                            required: ["japanese", "romaji", "translation"],
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
                        description: "The question text (Japanese)",
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

export const generateLesson = async (
    level: JLPTLevel,
    topic: string,
    contentType: ContentType,
    language: Language
): Promise<GrammarLesson | QuizSession> => {
    const model = "gemini-2.5-flash";
    const langName = getLanguageName(language);

    if (contentType === ContentType.GRAMMAR) {
        const prompt = `Create a Japanese grammar lesson for JLPT Level ${level} focused on the topic: "${topic}".
    Provide 2-3 specific grammar points related to this topic/level.
    
    IMPORTANT: 
    - The 'introduction', 'meaning', and 'explanation' fields must be written in ${langName}.
    - The 'examples' translation must be in ${langName}.
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
        return JSON.parse(text) as GrammarLesson;
    } else {
        const prompt = `Create a Japanese quiz (5 questions) for JLPT Level ${level} focused on the topic: "${topic}".
    The questions should test grammar or vocabulary relevant to the topic.
    
    IMPORTANT:
    - The 'explanation' for the answer must be written in ${langName}.
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
        return JSON.parse(text) as QuizSession;
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    if (!text || !text.trim()) {
        throw new Error("Text is empty");
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text.trim() }] }],
        config: {
            // Cast string to Modality to avoid potential enum resolution issues in some environments
            responseModalities: ["AUDIO" as Modality],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Kore" },
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
