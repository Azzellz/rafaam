import React, { useEffect, useMemo } from "react";
import { GrammarLesson, Language, GrammarPoint } from "@/types";
import { PixelCard } from "@/components/layout/PixelUI";
import { translations } from "@/components/i18n";
import { TTSButton } from "@/components/widgets/TTSButton";
import {
    pixelAccentLabel,
    pixelInfoPanel,
    pixelMutedParagraph,
} from "@/styles/classNames";
import { PRACTICE_LANGUAGES } from "@/constants/practiceLanguages";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

interface Props {
    data: GrammarLesson;
    language: Language;
}

export const GrammarView: React.FC<Props> = ({ data, language }) => {
    const t = translations[language];
    const practiceConfig = PRACTICE_LANGUAGES[data.practiceLanguage];
    const favorites = useFavoritesStore((state) => state.favorites);
    const initFavoritesStore = useFavoritesStore((state) => state.initStore);
    const addFavoriteToStore = useFavoritesStore((state) => state.addFavorite);
    const removeFavoriteFromStore = useFavoritesStore(
        (state) => state.removeFavorite
    );
    const favoritesInitializing = useFavoritesStore(
        (state) => state.isInitializing
    );
    const favoritesMutating = useFavoritesStore((state) => state.isMutating);
    const storageStrategy = useFavoritesStore((state) => state.storageStrategy);

    useEffect(() => {
        initFavoritesStore();
    }, [initFavoritesStore]);

    const favoritePatterns = useMemo(
        () => new Set(favorites.map((p: GrammarPoint) => p.pattern)),
        [favorites]
    );

    const isLoadingFavs = favoritesInitializing || favoritesMutating;
    const showFallbackWarning = storageStrategy === "localStorage";

    const ensurePointLanguage = (point: GrammarPoint): GrammarPoint => ({
        ...point,
        practiceLanguage: point.practiceLanguage ?? data.practiceLanguage,
    });

    const handleToggleFavorite = async (index: number) => {
        const point = ensurePointLanguage(data.points[index]);
        const isFav = favoritePatterns.has(point.pattern);

        const success = isFav
            ? await removeFavoriteFromStore(point.pattern)
            : await addFavoriteToStore(point);

        if (!success) {
            alert(t.connectionError);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-6 md:mb-8">
                <h2 className="text-3xl md:text-5xl font-['DotGothic16'] mb-2 text-[#4f46e5] drop-shadow-[2px_2px_0_#000]">
                    {data.title}
                </h2>
                <p
                    className={`${pixelMutedParagraph} max-w-2xl mx-auto leading-tight`}
                >
                    {data.introduction}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm md:text-base font-['VT323'] text-gray-700">
                    {practiceConfig && (
                        <span className="px-3 py-1 border-2 border-black bg-white">
                            {practiceConfig.nativeLabel}
                        </span>
                    )}
                    <span className="px-3 py-1 border-2 border-dashed border-black bg-[#fdf2f8]">
                        {practiceConfig?.levelSystemLabel} {data.level}
                    </span>
                    <span className="px-3 py-1 border-2 border-black bg-[#ecfccb]">
                        {t.questTopic}: {data.topic}
                    </span>
                </div>
            </div>

            {showFallbackWarning && (
                <PixelCard className="border-2 border-dashed border-yellow-500 bg-yellow-50 text-gray-800">
                    <p className="font-['VT323'] text-lg text-[#b45309]">
                        {t.storageFallbackWarning}
                    </p>
                </PixelCard>
            )}

            {data.points.map((point, index) => {
                const isFavorite = favoritePatterns.has(point.pattern);

                return (
                    <PixelCard
                        key={index}
                        title={`${t.point} ${index + 1}`}
                        className="mb-8 mt-6"
                    >
                        <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b-2 border-dashed border-gray-300">
                            <div className="flex-1">
                                <h3 className="text-2xl font-['DotGothic16'] text-[#dc2626] mb-1 leading-snug break-words">
                                    {point.pattern}
                                </h3>
                                <p className="text-lg font-bold text-gray-800 font-['VT323'] uppercase tracking-wide">
                                    {point.meaning}
                                </p>
                            </div>

                            <div className="flex gap-2 self-end md:self-start w-full md:w-auto justify-end">
                                <TTSButton
                                    text={point.pattern}
                                    practiceLanguage={
                                        point.practiceLanguage ??
                                        data.practiceLanguage
                                    }
                                />
                                <button
                                    onClick={() => handleToggleFavorite(index)}
                                    disabled={isLoadingFavs}
                                    className={`
                     font-['VT323'] text-lg px-3 py-1 border-2 border-black transition-all h-[44px] whitespace-nowrap
                     ${
                         isFavorite
                             ? "bg-[#facc15] text-black shadow-[2px_2px_0_0_#000]"
                             : "bg-white text-gray-400 hover:bg-gray-100"
                     }
                     ${isLoadingFavs ? "opacity-50 cursor-wait" : ""}
                   `}
                                >
                                    {isFavorite
                                        ? `★ ${t.saved}`
                                        : `☆ ${t.addToFavorites}`}
                                </button>
                            </div>
                        </div>

                        <p className="mb-6 text-gray-700 leading-relaxed font-['DotGothic16'] text-base md:text-lg">
                            {point.explanation}
                        </p>

                        <div className={`${pixelInfoPanel} p-3 md:p-4`}>
                            <h4 className={`${pixelAccentLabel} text-lg mb-3`}>
                                {t.examples}
                            </h4>
                            <ul className="space-y-4">
                                {point.examples.map((ex, i) => (
                                    <li
                                        key={i}
                                        className="flex flex-col gap-1 relative pl-2 border-l-4 border-gray-200 hover:border-[#3b82f6] transition-colors group p-1 md:p-2"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-base md:text-lg font-['DotGothic16'] text-black leading-snug">
                                                {ex.text}
                                            </span>
                                            <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                                                <TTSButton
                                                    text={ex.text}
                                                    size="sm"
                                                    practiceLanguage={
                                                        point.practiceLanguage ??
                                                        data.practiceLanguage
                                                    }
                                                />
                                            </div>
                                        </div>
                                        {ex.phonetic && (
                                            <span className="text-xs md:text-sm font-mono text-gray-500">
                                                {ex.phonetic}
                                            </span>
                                        )}
                                        <span className="text-sm md:text-md font-['VT323'] text-gray-600 italic">
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
    );
};
