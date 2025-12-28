"use client";

import React, { useState, useEffect } from "react";
import { QuizSession, Language, ContentType } from "@/types";
import { PixelCard, PixelButton } from "@/components/pixel";
import { translations } from "@/i18n";
import { PRACTICE_LANGUAGES } from "@/constants/practiceLanguages";
import { useStatsStore } from "@/stores/useStatsStore";

interface Props {
    data: QuizSession;
    language: Language;
    onRestart: () => void;
}

export const QuizView: React.FC<Props> = ({ data, language, onRestart }) => {
    const t = translations[language];
    const practiceConfig = PRACTICE_LANGUAGES[data.practiceLanguage];
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const addRecord = useStatsStore((state) => state.addRecord);

    useEffect(() => {
        if (showResults) {
            addRecord({
                type: ContentType.QUIZ,
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
        <div className="max-w-2xl mx-auto">
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

            <div className="mb-4 flex justify-between items-end text-xl text-gray-500">
                <span>
                    {t.question} {currentQuestionIndex + 1} /{" "}
                    {data.questions.length}
                </span>
                <span>
                    {t.score}: {score}
                </span>
            </div>

            <div className="w-full bg-gray-200 h-4 border-2 border-black mb-8">
                <div
                    className="bg-theme h-full transition-all duration-300"
                    style={{
                        width: `${
                            ((currentQuestionIndex + (isAnswered ? 1 : 0)) /
                                data.questions.length) *
                            100
                        }%`,
                    }}
                ></div>
            </div>

            <PixelCard title={t.quizBattleTitle}>
                <h3 className="text-2xl mt-4 mb-8 text-center leading-relaxed">
                    {question.question}
                </h3>

                <div className="grid gap-4 mb-6">
                    {question.options.map((option, index) => {
                        let buttonStyle = "bg-white hover:bg-gray-50";
                        if (isAnswered) {
                            if (index === question.correctIndex) {
                                buttonStyle =
                                    "bg-[#86efac] border-[#166534] text-[#14532d]"; // Green
                            } else if (index === selectedOption) {
                                buttonStyle =
                                    "bg-[#fca5a5] border-[#991b1b] text-[#7f1d1d]"; // Red
                            } else {
                                buttonStyle = "opacity-50";
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                disabled={isAnswered}
                                className={`
                  w-full text-left p-4 border-2 border-black text-lg transition-all
                  ${buttonStyle}
                  ${
                      !isAnswered &&
                      "hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none"
                  }
                `}
                            >
                                <span className="mr-3 text-xl font-bold">
                                    {String.fromCharCode(65 + index)}.
                                </span>
                                {option}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className="animate-fade-in bg-[#fff7ed] border-2 border-[#fdba74] p-4 mb-6">
                        <p className="font-bold text-[#ea580c] mb-1">
                            {t.explanation}
                        </p>
                        <p className="text-gray-700">{question.explanation}</p>
                    </div>
                )}

                <div className="flex justify-end">
                    <PixelButton
                        onClick={handleNext}
                        disabled={!isAnswered}
                        className={
                            !isAnswered ? "opacity-50 cursor-not-allowed" : ""
                        }
                    >
                        {currentQuestionIndex === data.questions.length - 1
                            ? t.finish
                            : t.next}
                    </PixelButton>
                </div>
            </PixelCard>
        </div>
    );
};

