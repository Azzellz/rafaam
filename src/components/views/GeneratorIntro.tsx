import React, { useMemo } from "react";
import { ContentType, PracticeLanguage, Language } from "@/types";
import { TranslationContent } from "@/i18n";
import { pixelFormLabel } from "@/constants/style";
import { useCustomTypesStore } from "@/stores/useCustomTypesStore";
import { useAppStore } from "@/stores/useAppStore";
import {
    PRACTICE_LANGUAGE_OPTIONS,
    PRACTICE_LANGUAGES,
} from "@/constants/practiceLanguages";
import {
    PixelButton,
    PixelCard,
    PixelInput,
    PixelSelect,
    PixelTooltip,
    PixelTabs,
} from "../pixel";
import { StudyPlan } from "@/components/widgets/StudyPlan";
import { FavoritesView } from "./FavoritesView";
import { StatsView } from "./StatsView";
import { SandboxView } from "./SandboxView";

type GeneratorIntroProps = {
    language: Language;
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
    language,
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
    const { customTypes } = useCustomTypesStore();
    const { customTypeId, setCustomTypeId } = useAppStore();

    const levelOptions = useMemo(
        () => PRACTICE_LANGUAGES[practiceLanguage]?.levelOptions ?? [],
        [practiceLanguage]
    );

    const handleCustomTypeSelect = (id: string) => {
        onContentTypeChange(ContentType.CUSTOM);
        setCustomTypeId(id);
    };

    const generatorForm = (
        <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className={`block ${pixelFormLabel} mb-2`}>
                        {t.practiceLanguage}
                    </label>
                    <PixelSelect
                        value={practiceLanguage}
                        onChange={(value) =>
                            onPracticeLanguageChange(value as PracticeLanguage)
                        }
                        options={PRACTICE_LANGUAGE_OPTIONS.map((option) => ({
                            value: option.id,
                            label: option.nativeLabel,
                        }))}
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
                                desc: t.grammarLessonDesc,
                            },
                            {
                                label: t.quizBattle,
                                value: ContentType.QUIZ,
                                desc: t.quizBattleDesc,
                            },
                            {
                                label: t.voicePractice,
                                value: ContentType.CONVERSATION,
                                desc: t.voicePracticeDesc,
                            },
                            {
                                label: t.listeningPractice,
                                value: ContentType.LISTENING,
                                desc: t.listeningPracticeDesc,
                            },
                            {
                                label: t.readingPractice,
                                value: ContentType.READING,
                                desc: t.readingPracticeDesc,
                            },
                            {
                                label: t.clozePractice,
                                value: ContentType.CLOZE,
                                desc: t.clozePracticeDesc,
                            },
                            {
                                label: t.chatPractice,
                                value: ContentType.CHAT,
                                desc: t.chatPracticeDesc,
                            },
                            {
                                label: t.writingPractice,
                                value: ContentType.WRITING,
                                desc: t.writingPracticeDesc,
                            },
                        ].map((option) => (
                            <PixelTooltip
                                key={option.value}
                                content={option.desc}
                            >
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="contentType"
                                        checked={contentType === option.value}
                                        onChange={() => {
                                            onContentTypeChange(option.value);
                                            setCustomTypeId(null);
                                        }}
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
                                    <span className="text-lg md:text-xl group-hover:underline">
                                        {option.label}
                                    </span>
                                </label>
                            </PixelTooltip>
                        ))}

                        {customTypes.map((type) => (
                            <PixelTooltip
                                key={type.id}
                                content={type.description || t.customTypes}
                            >
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="contentType"
                                        checked={
                                            contentType ===
                                                ContentType.CUSTOM &&
                                            customTypeId === type.id
                                        }
                                        onChange={() =>
                                            handleCustomTypeSelect(type.id)
                                        }
                                        className="hidden"
                                    />
                                    <div
                                        className={`w-5 h-5 md:w-6 md:h-6 border-2 border-black flex items-center justify-center ${
                                            contentType ===
                                                ContentType.CUSTOM &&
                                            customTypeId === type.id
                                                ? "bg-theme"
                                                : "bg-white"
                                        }`}
                                    >
                                        {contentType === ContentType.CUSTOM &&
                                            customTypeId === type.id && (
                                                <div className="w-2 h-2 bg-white"></div>
                                            )}
                                    </div>
                                    <span className="text-lg md:text-xl group-hover:underline">
                                        {type.name}
                                    </span>
                                </label>
                            </PixelTooltip>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <label className={`block ${pixelFormLabel} mb-2`}>
                    {t.questTopic}
                </label>
                <PixelInput
                    className="w-full"
                    placeholder={t.topicPlaceholder}
                    value={topic}
                    onChange={(event) => onTopicChange(event.target.value)}
                    required
                />
            </div>

            <div className="pt-2 md:pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <PixelButton
                    type="button"
                    variant="secondary"
                    onClick={onRandomTopic}
                    disabled={randomTopicLoading}
                    className="w-full sm:w-auto whitespace-nowrap"
                >
                    {randomTopicLoading ? t.generating : t.randomTopic}
                </PixelButton>
                <PixelButton type="submit" className="w-full sm:w-1/2">
                    {t.startQuest}
                </PixelButton>
            </div>
        </form>
    );

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8 md:mb-12">
                <p className="text-xl md:text-2xl text-gray-700 mb-2">
                    {t.introTitle.replace(
                        "{lang}",
                        PRACTICE_LANGUAGES[practiceLanguage].nativeLabel
                    )}
                </p>
                <p className="text-gray-500 text-lg">{t.introSubtitle}</p>
            </div>

            <PixelCard>
                <PixelTabs
                    tabs={[
                        {
                            id: "generator",
                            label: t.configureQuest,
                            content: generatorForm,
                        },
                        {
                            id: "sandbox",
                            label: t.sandboxMode,
                            content: <SandboxView language={language} />,
                        },
                        {
                            id: "studyPlan",
                            label: t.studyPlan,
                            content: <StudyPlan language={language} />,
                        },
                        {
                            id: "favorites",
                            label: t.myFavorites,
                            content: (
                                <FavoritesView
                                    language={language}
                                    practiceLanguage={practiceLanguage}
                                    embedded
                                />
                            ),
                        },
                        {
                            id: "stats",
                            label: t.statistics,
                            content: <StatsView language={language} embedded />,
                        },
                    ]}
                />
            </PixelCard>
        </div>
    );
};
