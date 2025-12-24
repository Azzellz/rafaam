import React, { useEffect, useState } from "react";
import { GrammarPoint, Language, PracticeLanguage } from "@/types";
import {
    PixelCard,
    PixelButton,
    PixelSelect,
} from "@/components/layout/PixelUI";
import { translations } from "@/components/i18n";
import { TTSButton } from "../widgets/TTSButton";
import { pixelAccentLabel, pixelInfoPanel } from "@/styles/classNames";
import {
    DEFAULT_PRACTICE_LANGUAGE,
    PRACTICE_LANGUAGES,
    PRACTICE_LANGUAGE_OPTIONS,
} from "@/constants/practiceLanguages";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

interface Props {
    language: Language;
    practiceLanguage: PracticeLanguage;
    onBack: () => void;
}

export const FavoritesView: React.FC<Props> = ({
    language,
    practiceLanguage,
    onBack,
}) => {
    const t = translations[language];
    const [selectedLanguage, setSelectedLanguage] =
        useState<PracticeLanguage>(practiceLanguage);
    const favorites = useFavoritesStore((state) => state.favorites);
    const initStore = useFavoritesStore((state) => state.initStore);
    const removeFavoriteFromStore = useFavoritesStore(
        (state) => state.removeFavorite
    );
    const initialized = useFavoritesStore((state) => state.initialized);
    const isInitializing = useFavoritesStore((state) => state.isInitializing);
    const storageStrategy = useFavoritesStore((state) => state.storageStrategy);

    const resolvePracticeLanguage = (point: GrammarPoint): PracticeLanguage =>
        point.practiceLanguage ?? DEFAULT_PRACTICE_LANGUAGE;

    useEffect(() => {
        initStore(selectedLanguage);
    }, [initStore, selectedLanguage]);

    const loading = !initialized || isInitializing;

    const handleRemove = async (pattern: string, lang: PracticeLanguage) => {
        const success = await removeFavoriteFromStore(pattern, lang);
        if (!success) {
            alert(t.connectionError);
        }
    };

    const showFallbackWarning = storageStrategy === "localStorage";

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-4xl text-[#facc15] drop-shadow-[2px_2px_0_#000] text-stroke-black">
                    {t.myFavorites}
                </h2>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-48">
                        <PixelSelect
                            value={selectedLanguage}
                            onChange={(val) =>
                                setSelectedLanguage(val as PracticeLanguage)
                            }
                            options={PRACTICE_LANGUAGE_OPTIONS.map((opt) => ({
                                value: opt.id,
                                label: opt.nativeLabel,
                            }))}
                        />
                    </div>
                    <PixelButton
                        onClick={onBack}
                        variant="secondary"
                        className="text-sm whitespace-nowrap"
                    >
                        {t.backToGenerator}
                    </PixelButton>
                </div>
            </div>

            {showFallbackWarning && (
                <PixelCard className="border-2 border-dashed border-yellow-500 bg-yellow-50 text-gray-800">
                    <p className="text-lg text-[#b45309]">
                        {t.storageFallbackWarning}
                    </p>
                </PixelCard>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-[#3b82f6] rounded-full animate-spin"></div>
                </div>
            ) : favorites.length === 0 ? (
                <PixelCard className="text-center py-12">
                    <div className="text-6xl mb-4">📜</div>
                    <p className="text-2xl text-gray-500">{t.noFavorites}</p>
                </PixelCard>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {favorites.map((point, index) => {
                        const pointLanguage = resolvePracticeLanguage(point);
                        const practiceConfig =
                            PRACTICE_LANGUAGES[pointLanguage];
                        return (
                            <PixelCard key={index} className="relative">
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <TTSButton
                                        text={point.pattern}
                                        size="sm"
                                        practiceLanguage={pointLanguage}
                                    />
                                    <button
                                        onClick={() =>
                                            handleRemove(
                                                point.pattern,
                                                pointLanguage
                                            )
                                        }
                                        className="text-red-500 hover:text-red-700 bg-white border-2 border-red-500 px-2 py-0 hover:bg-red-50 h-[32px]"
                                    >
                                        X {t.removeFromFavorites}
                                    </button>
                                </div>

                                <div className="mb-2 border-b-2 border-dashed border-gray-300 pb-2 pr-32">
                                    <h3 className="text-xl text-[#dc2626] inline-block mr-4">
                                        {point.pattern}
                                    </h3>
                                    <span className="text-md font-bold text-gray-800 uppercase">
                                        {point.meaning}
                                    </span>
                                    {practiceConfig && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs border-2 border-black bg-[#ecfccb]">
                                            {practiceConfig.nativeLabel}
                                        </span>
                                    )}
                                </div>

                                <p className="mb-4 text-sm text-gray-700">
                                    {point.explanation}
                                </p>

                                <div className={`${pixelInfoPanel} p-3`}>
                                    <h4
                                        className={`${pixelAccentLabel} text-sm mb-2`}
                                    >
                                        {t.examples}
                                    </h4>
                                    <ul className="space-y-3">
                                        {point.examples.map((ex, i) => (
                                            <li
                                                key={i}
                                                className="flex flex-col group relative"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-md text-black">
                                                        {ex.text}
                                                    </span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TTSButton
                                                            text={ex.text}
                                                            size="sm"
                                                            className="scale-75 origin-left"
                                                            practiceLanguage={
                                                                pointLanguage
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                {ex.phonetic && (
                                                    <span className="text-[11px] font-mono text-gray-500">
                                                        {ex.phonetic}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500 italic">
                                                    "{ex.translation}"
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </PixelCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
