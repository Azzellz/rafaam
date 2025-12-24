import React, { useMemo } from "react";
import { ContentType, PracticeLanguage } from "@/types";
import { TranslationContent } from "@/components/i18n";
import { pixelFormLabel } from "@/styles/classNames";
import {
    PRACTICE_LANGUAGE_OPTIONS,
    PRACTICE_LANGUAGES,
} from "@/constants/practiceLanguages";
import {
    PixelButton,
    PixelCard,
    PixelInput,
    PixelSelect,
} from "../layout/PixelUI";

type GeneratorIntroProps = {
    t: TranslationContent;
    topic: string;
    level: string;
    practiceLanguage: PracticeLanguage;
    contentType: ContentType;
    onTopicChange: (value: string) => void;
    onRandomTopic: () => void;
    randomTopicLoading: boolean;
    onLevelChange: (value: string) => void;
    onPracticeLanguageChange: (value: PracticeLanguage) => void;
    onContentTypeChange: (value: ContentType) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const GeneratorIntro: React.FC<GeneratorIntroProps> = ({
    t,
    topic,
    level,
    practiceLanguage,
    contentType,
    onTopicChange,
    onRandomTopic,
    randomTopicLoading,
    onLevelChange,
    onPracticeLanguageChange,
    onContentTypeChange,
    onSubmit,
}) => {
    const levelOptions = useMemo(
        () => PRACTICE_LANGUAGES[practiceLanguage]?.levelOptions ?? [],
        [practiceLanguage]
    );

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8 md:mb-12">
                <p className="text-xl md:text-2xl font-['DotGothic16'] text-gray-700 mb-2">
                    {t.introTitle.replace(
                        "{lang}",
                        PRACTICE_LANGUAGES[practiceLanguage].nativeLabel
                    )}
                </p>
                <p className="text-gray-500 font-['VT323'] text-lg">
                    {t.introSubtitle}
                </p>
            </div>

            <PixelCard title={t.configureQuest}>
                <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className={`block ${pixelFormLabel} mb-2`}>
                                {t.practiceLanguage}
                            </label>
                            <PixelSelect
                                value={practiceLanguage}
                                onChange={(value) =>
                                    onPracticeLanguageChange(
                                        value as PracticeLanguage
                                    )
                                }
                                options={PRACTICE_LANGUAGE_OPTIONS.map(
                                    (option) => ({
                                        value: option.id,
                                        label: option.nativeLabel,
                                    })
                                )}
                            />
                        </div>
                        <div>
                            <label className={`block ${pixelFormLabel} mb-2`}>
                                {t.proficiencyLevel}
                            </label>
                            <PixelSelect
                                value={level}
                                onChange={(value) => onLevelChange(value)}
                                options={levelOptions.map((option) => ({
                                    value: option.id,
                                    label: option.label,
                                }))}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className={`block ${pixelFormLabel} mb-2`}>
                                {t.questType}
                            </label>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-6">
                                {[
                                    {
                                        label: t.grammarLesson,
                                        value: ContentType.GRAMMAR,
                                    },
                                    {
                                        label: t.quizBattle,
                                        value: ContentType.QUIZ,
                                    },
                                    {
                                        label: t.voicePractice,
                                        value: ContentType.CONVERSATION,
                                    },
                                    {
                                        label: t.chatPractice,
                                        value: ContentType.CHAT,
                                    },
                                    {
                                        label: t.writingPractice,
                                        value: ContentType.WRITING,
                                    },
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center space-x-2 cursor-pointer group"
                                    >
                                        <input
                                            type="radio"
                                            name="contentType"
                                            checked={
                                                contentType === option.value
                                            }
                                            onChange={() =>
                                                onContentTypeChange(
                                                    option.value
                                                )
                                            }
                                            className="hidden"
                                        />
                                        <div
                                            className={`w-5 h-5 md:w-6 md:h-6 border-2 border-black flex items-center justify-center ${
                                                contentType === option.value
                                                    ? "bg-theme"
                                                    : "bg-white"
                                            }`}
                                        >
                                            {contentType === option.value && (
                                                <div className="w-2 h-2 bg-white"></div>
                                            )}
                                        </div>
                                        <span className="font-['VT323'] text-lg md:text-xl group-hover:underline">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={`block ${pixelFormLabel} mb-2`}>
                            {t.questTopic}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <PixelInput
                                className="flex-1"
                                placeholder={t.topicPlaceholder}
                                value={topic}
                                onChange={(event) =>
                                    onTopicChange(event.target.value)
                                }
                                required
                            />
                            <PixelButton
                                type="button"
                                variant="secondary"
                                onClick={onRandomTopic}
                                disabled={randomTopicLoading}
                                className="w-full sm:w-auto whitespace-nowrap"
                            >
                                {randomTopicLoading
                                    ? t.generating
                                    : t.randomTopic}
                            </PixelButton>
                        </div>
                    </div>

                    <div className="pt-2 md:pt-4 text-center">
                        <PixelButton type="submit" className="w-full md:w-1/2">
                            {t.startQuest}
                        </PixelButton>
                    </div>
                </form>
            </PixelCard>

            <div className="mt-8 md:mt-12 grid grid-cols-3 gap-2 md:gap-4 opacity-50 text-center font-['VT323']">
                {[
                    { icon: "⚡", label: t.instantGen },
                    { icon: "✨", label: t.nativeExamples },
                    { icon: "⚔️", label: t.battleQuiz },
                ].map((feature) => (
                    <div
                        key={feature.label}
                        className="flex flex-col items-center"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 border-2 border-black mb-2 flex items-center justify-center text-xl md:text-2xl">
                            {feature.icon}
                        </div>
                        <span className="text-sm md:text-base">
                            {feature.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
