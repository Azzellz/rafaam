import { PracticeLanguage } from "@/types";

export interface PracticeLevelOption {
    id: string;
    label: string;
}

export interface PracticeLanguageConfig {
    id: PracticeLanguage;
    label: string;
    nativeLabel: string;
    targetLanguageName: string;
    levelSystemLabel: string;
    levelOptions: PracticeLevelOption[];
    teacherTitle: string;
    ttsVoice: string;
}

const CEFR_LEVELS: PracticeLevelOption[] = [
    { id: "A1", label: "CEFR A1" },
    { id: "A2", label: "CEFR A2" },
    { id: "B1", label: "CEFR B1" },
    { id: "B2", label: "CEFR B2" },
    { id: "C1", label: "CEFR C1" },
    { id: "C2", label: "CEFR C2" },
];

export const PRACTICE_LANGUAGES: Record<
    PracticeLanguage,
    PracticeLanguageConfig
> = {
    [PracticeLanguage.JAPANESE]: {
        id: PracticeLanguage.JAPANESE,
        label: "Japanese",
        nativeLabel: "日本語",
        targetLanguageName: "Japanese",
        levelSystemLabel: "JLPT",
        levelOptions: [
            { id: "N5", label: "JLPT N5" },
            { id: "N4", label: "JLPT N4" },
            { id: "N3", label: "JLPT N3" },
            { id: "N2", label: "JLPT N2" },
            { id: "N1", label: "JLPT N1" },
        ],
        teacherTitle: "Sensei",
        ttsVoice: "Kore",
    },
    [PracticeLanguage.ENGLISH]: {
        id: PracticeLanguage.ENGLISH,
        label: "English",
        nativeLabel: "English",
        targetLanguageName: "English",
        levelSystemLabel: "CEFR",
        levelOptions: CEFR_LEVELS.map((level) => ({ ...level })),
        teacherTitle: "Coach",
        ttsVoice: "Aoede",
    },
    [PracticeLanguage.FRENCH]: {
        id: PracticeLanguage.FRENCH,
        label: "French",
        nativeLabel: "Français",
        targetLanguageName: "French",
        levelSystemLabel: "CEFR",
        levelOptions: CEFR_LEVELS.map((level) => ({ ...level })),
        teacherTitle: "Professeur",
        ttsVoice: "Charon",
    },
    [PracticeLanguage.GERMAN]: {
        id: PracticeLanguage.GERMAN,
        label: "German",
        nativeLabel: "Deutsch",
        targetLanguageName: "German",
        levelSystemLabel: "CEFR",
        levelOptions: CEFR_LEVELS.map((level) => ({ ...level })),
        teacherTitle: "Lehrer",
        ttsVoice: "Fenrir",
    },
};

const PRACTICE_LANGUAGE_ORDER: PracticeLanguage[] = [
    PracticeLanguage.JAPANESE,
    PracticeLanguage.ENGLISH,
    PracticeLanguage.FRENCH,
    PracticeLanguage.GERMAN,
];

export const PRACTICE_LANGUAGE_OPTIONS = PRACTICE_LANGUAGE_ORDER.map(
    (code) => PRACTICE_LANGUAGES[code]
);

export const DEFAULT_PRACTICE_LANGUAGE = PracticeLanguage.JAPANESE;

export const getDefaultLevel = (practiceLanguage: PracticeLanguage): string => {
    const options = PRACTICE_LANGUAGES[practiceLanguage]?.levelOptions;
    return options && options.length > 0 ? options[0].id : "";
};
