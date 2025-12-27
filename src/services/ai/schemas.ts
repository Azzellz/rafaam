import { Type, Schema } from "@google/genai";

export const grammarSchema: Schema = {
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

export const quizSchema: Schema = {
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

export const listeningSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        transcript: {
            type: Type.STRING,
            description:
                "The full text of the story or dialogue to be spoken. Should be appropriate for the level.",
        },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description:
                            "Comprehension question about the transcript",
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
                        description: "Explanation of the answer",
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
    required: ["title", "transcript", "questions"],
};

export const writingTaskSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        prompt: {
            type: Type.STRING,
            description: "The writing prompt/instruction",
        },
        hints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Optional hints or vocabulary to use",
        },
    },
    required: ["prompt"],
};

export const readingSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        passage: {
            type: Type.STRING,
            description:
                "The reading passage/article. Should be appropriate for the learner's level.",
        },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "Comprehension question about the passage",
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
                        description: "Explanation of the answer",
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
    required: ["title", "passage", "questions"],
};

export const clozeSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Title of the cloze test" },
        passage: {
            type: Type.STRING,
            description:
                "The passage with blanks marked as [BLANK_0], [BLANK_1], etc.",
        },
        blanks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    correctAnswer: {
                        type: Type.STRING,
                        description: "The correct word/phrase for this blank",
                    },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "4 options including the correct answer",
                    },
                },
                required: ["correctAnswer", "options"],
            },
            description: "Array of blanks in order of appearance",
        },
    },
    required: ["title", "passage", "blanks"],
};

export const writingEvaluationSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        correctedText: {
            type: Type.STRING,
            description: "The corrected version of the user's text",
        },
        feedback: {
            type: Type.STRING,
            description: "General feedback on the writing",
        },
        score: { type: Type.INTEGER, description: "Score from 0 to 100" },
        improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific suggestions for improvement",
        },
    },
    required: ["correctedText", "feedback", "score", "improvements"],
};
