import { Language } from "@/types";
import { TranslationContent } from "./types";
import { enTranslation } from "./locales/en";
import { zhCNTranslation } from "./locales/zh-cn";
import { jaTranslation } from "./locales/ja";

export const translations: Record<Language, TranslationContent> = {
    [Language.EN]: enTranslation,
    [Language.ZH_CN]: zhCNTranslation,
    [Language.JA]: jaTranslation,
};

export type { TranslationContent } from "./types";
