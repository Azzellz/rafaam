import React from "react";
import { Language } from "@/types";
import { TranslationContent } from "@/components/i18n";
import { PixelSelect } from "./PixelUI";

type AppHeaderProps = {
    language: Language;
    isFavoritesActive: boolean;
    onLogoClick: () => void;
    onToggleFavorites: () => void;
    onOpenSettings: () => void;
    onLanguageChange: (language: Language) => void;
    t: TranslationContent;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
    language,
    isFavoritesActive,
    onLogoClick,
    onToggleFavorites,
    onOpenSettings,
    onLanguageChange,
    t,
}) => {
    const handleLanguageChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        onLanguageChange(event.target.value as Language);
    };

    return (
        <header className="bg-[#4f46e5] border-b-4 border-black p-3 md:p-4 mb-6 md:mb-10 sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,0.2)]">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="cursor-pointer" onClick={onLogoClick}>
                    <h1 className="text-2xl md:text-4xl text-white font-['VT323'] tracking-widest drop-shadow-[2px_2px_0_#000]">
                        {t.title}{" "}
                        <span className="text-[#facc15]">{t.subtitle}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <a
                        href="https://github.com/Azzellz/rafaam"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 md:h-12 md:w-12 bg-white border-2 border-black hover:bg-gray-100 shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center justify-center text-black flex-shrink-0 p-0"
                        title="GitHub"
                    >
                        <svg
                            height="20"
                            width="20"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="w-5 h-5 md:w-6 md:h-6"
                        >
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                    </a>

                    <button
                        onClick={onOpenSettings}
                        className="h-10 w-10 md:h-12 md:w-12 bg-gray-200 border-2 border-black hover:bg-gray-300 shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center justify-center flex-shrink-0 p-0"
                        title={t.bgSettings}
                    >
                        <span className="text-xl md:text-2xl leading-none">
                            ⚙️
                        </span>
                    </button>

                    <button
                        onClick={onToggleFavorites}
                        className="h-10 w-10 md:h-12 md:w-12 bg-[#facc15] border-2 border-black hover:bg-[#eab308] shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center justify-center flex-shrink-0 p-0"
                        title={t.myFavorites}
                        aria-pressed={isFavoritesActive}
                    >
                        <span className="text-xl md:text-2xl leading-none pt-1">
                            ★
                        </span>
                    </button>

                    <div className="w-40 md:w-48">
                        <PixelSelect
                            value={language}
                            onChange={handleLanguageChange}
                            className="h-10 md:h-12 py-0 pl-3 text-base md:text-lg"
                        >
                            <option value={Language.EN}>English</option>
                            <option value={Language.ZH_CN}>简体中文</option>
                            <option value={Language.ZH_TW}>繁體中文</option>
                            <option value={Language.JA}>日本語</option>
                        </PixelSelect>
                    </div>
                </div>
            </div>
        </header>
    );
};
