import React, { useState, useEffect } from "react";
import { ListeningExercise, Language, ContentType } from "@/types";
import { PixelCard, PixelButton } from "@/components/pixel";
import { translations } from "@/i18n";
import { PRACTICE_LANGUAGES } from "@/constants/practiceLanguages";
import { useStatsStore } from "@/stores/useStatsStore";
import { TTSButton } from "@/components/widgets/TTSButton";

interface Props {
    data: ListeningExercise;
    language: Language;
    onRestart: () => void;
}

export const ListeningView: React.FC<Props> = ({
    data,
    language,
    onRestart,
}) => {
    const t = translations[language];
    const practiceConfig = PRACTICE_LANGUAGES[data.practiceLanguage];
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const addRecord = useStatsStore((state) => state.addRecord);

    useEffect(() => {
        if (showResults) {
            addRecord({
                type: ContentType.LISTENING,
                language: data.practiceLanguage,
                topic: data.topic,
                score: score,
                maxScore: data.questions.length,
            });
        }
    }, [showResults]);

    const question = data.questions[currentQuestionIndex];

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === question.correctIndex) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < data.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    if (showResults) {
        return (
            <PixelCard className="text-center py-12">
                <h2 className="text-4xl mb-6">{t.questComplete}</h2>
                <div className="text-6xl mb-6 text-theme">
                    {score} / {data.questions.length}
                </div>
                <p className="text-xl mb-8 text-gray-600">
                    {score === data.questions.length
                        ? t.perfectScore
                        : t.goodEffort}
                </p>
                <PixelButton onClick={onRestart}>{t.playAgain}</PixelButton>
            </PixelCard>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in pb-24">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl text-theme drop-shadow-[2px_2px_0_#000]">
                    {data.title}
                </h2>
                <div className="mt-3 flex flex-wrap justify-center gap-2 text-base text-gray-700">
                    {practiceConfig && (
                        <span className="px-3 py-1 border-2 border-black bg-white">
                            {practiceConfig.nativeLabel}
                        </span>
                    )}
                    <span className="px-3 py-1 border-2 border-dashed border-black bg-[#fef08a]">
                        {practiceConfig?.levelSystemLabel} {data.level}
                    </span>
                    <span className="px-3 py-1 border-2 border-black bg-[#dbeafe]">
                        {t.questTopic}: {data.topic}
                    </span>
                </div>
            </div>

            <PixelCard className="mb-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full flex justify-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                        <TTSButton
                            text={data.transcript}
                            practiceLanguage={data.practiceLanguage}
                            size="md"
                            className="scale-150"
                        />
                    </div>

                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="text-blue-600 hover:underline font-bold text-sm"
                    >
                        {showTranscript ? t.hideTranscript : t.showTranscript}
                    </button>

                    {showTranscript && (
                        <div className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded text-lg leading-relaxed whitespace-pre-wrap">
                            {data.transcript}
                        </div>
                    )}
                </div>
            </PixelCard>

            <div className="mb-4 flex justify-between items-end text-xl text-gray-500">
                <span>
                    {t.question} {currentQuestionIndex + 1} /{" "}
                    {data.questions.length}
                </span>
            </div>

            <PixelCard className="mb-6">
                <h3 className="text-2xl mb-6 font-bold">{question.question}</h3>

                <div className="space-y-3">
                    {question.options.map((option, index) => {
                        let buttonStyle =
                            "w-full text-left p-4 text-lg border-2 border-gray-200 hover:border-theme hover:bg-gray-50 transition-all";

                        if (isAnswered) {
                            if (index === question.correctIndex) {
                                buttonStyle =
                                    "w-full text-left p-4 text-lg border-2 border-green-500 bg-green-50 text-green-700 font-bold";
                            } else if (index === selectedOption) {
                                buttonStyle =
                                    "w-full text-left p-4 text-lg border-2 border-red-500 bg-red-50 text-red-700";
                            } else {
                                buttonStyle =
                                    "w-full text-left p-4 text-lg border-2 border-gray-200 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                disabled={isAnswered}
                                className={buttonStyle}
                            >
                                <span className="inline-block w-8 font-bold">
                                    {String.fromCharCode(65 + index)}.
                                </span>
                                {option}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-100 animate-fade-in">
                        <div className="bg-blue-50 p-4 border-l-4 border-blue-500 mb-4">
                            <span className="font-bold block mb-1">
                                {t.explanation}
                            </span>
                            <p className="text-gray-700">
                                {question.explanation}
                            </p>
                        </div>
                        <div className="text-right">
                            <PixelButton onClick={handleNext}>
                                {currentQuestionIndex <
                                data.questions.length - 1
                                    ? t.next
                                    : t.finish}
                            </PixelButton>
                        </div>
                    </div>
                )}
            </PixelCard>
        </div>
    );
};
