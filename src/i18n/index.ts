import { Language } from "@/types";
import { TranslationContent } from "./types";
import { enTranslation } from "./locales/en";
import { zhCNTranslation } from "./locales/zh-cn";
import { zhTWTranslation } from "./locales/zh-tw";
import { jaTranslation } from "./locales/ja";
import { frTranslation } from "./locales/fr";
import { deTranslation } from "./locales/de";

export const translations: Record<Language, TranslationContent> = {
    [Language.EN]: enTranslation,
    [Language.ZH_CN]: zhCNTranslation,
    [Language.ZH_TW]: zhTWTranslation,
    [Language.JA]: jaTranslation,
    [Language.FR]: frTranslation,
    [Language.DE]: deTranslation,
};

export type { TranslationContent } from "./types";
