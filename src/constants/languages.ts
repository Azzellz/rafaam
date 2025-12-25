import { Language } from "@/types";

export type LanguageConfig = {
    code: Language;
    label: string; // English descriptor for UI lists
    nativeLabel: string; // Native name shown to the user
    aiName: string; // Friendly name passed to the model for explanations
};

export const LANGUAGE_CONFIG: Record<Language, LanguageConfig> = {
    [Language.EN]: {
        code: Language.EN,
        label: "English",
        nativeLabel: "English",
        aiName: "English",
    },
    [Language.ZH_CN]: {
        code: Language.ZH_CN,
        label: "Simplified Chinese",
        nativeLabel: "简体中文",
        aiName: "Simplified Chinese",
    },
    [Language.JA]: {
        code: Language.JA,
        label: "Japanese",
        nativeLabel: "日本語",
        aiName: "Japanese",
    },
};

const LANGUAGE_ORDER: Language[] = [Language.EN, Language.ZH_CN, Language.JA];

export const LANGUAGE_OPTIONS = LANGUAGE_ORDER.map(
    (code) => LANGUAGE_CONFIG[code]
);
