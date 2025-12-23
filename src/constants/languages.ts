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
    [Language.ZH_TW]: {
        code: Language.ZH_TW,
        label: "Traditional Chinese",
        nativeLabel: "繁體中文",
        aiName: "Traditional Chinese",
    },
    [Language.JA]: {
        code: Language.JA,
        label: "Japanese",
        nativeLabel: "日本語",
        aiName: "Japanese",
    },
    [Language.FR]: {
        code: Language.FR,
        label: "French",
        nativeLabel: "Français",
        aiName: "French",
    },
    [Language.DE]: {
        code: Language.DE,
        label: "German",
        nativeLabel: "Deutsch",
        aiName: "German",
    },
};

const LANGUAGE_ORDER: Language[] = [
    Language.EN,
    Language.ZH_CN,
    Language.ZH_TW,
    Language.JA,
    Language.FR,
    Language.DE,
];

export const LANGUAGE_OPTIONS = LANGUAGE_ORDER.map(
    (code) => LANGUAGE_CONFIG[code]
);
