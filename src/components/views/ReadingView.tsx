"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ReadingExercise, Language, ContentType } from "@/types";
import { PixelCard, PixelButton, PixelTooltip } from "@/components/pixel";
import { translations } from "@/i18n";
import { PRACTICE_LANGUAGES } from "@/constants/practiceLanguages";
import { useStatsStore } from "@/stores/useStatsStore";

interface Props {
    data: ReadingExercise;
    language: Language;
    onRestart: () => void;
}

type AnswerState = {
    selectedOption: number | null;
    isCorrect: boolean | null;
};

export const ReadingView: React.FC<Props> = ({ data, language, onRestart }) => {
    const t = translations[language];
    const practiceConfig = PRACTICE_LANGUAGES[data.practiceLanguage];
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerState[]>(
        data.questions.map(() => ({ selectedOption: null, isCorrect: null }))
    );
    const [showResults, setShowResults] = useState(false);
    const [showPassage, setShowPassage] = useState(true);
    const [isFreeMode, setIsFreeMode] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const addRecord = useStatsStore((state) => state.addRecord);

    const score = useMemo(
        () => answers.filter((a) => a.isCorrect === true).length,
        [answers]
    );

    const answeredCount = useMemo(
        () => answers.filter((a) => a.selectedOption !== null).length,
        [answers]
    );

    const allAnswered = answeredCount === data.questions.length;

    useEffect(() => {
        if (showResults) {
            addRecord({
                type: ContentType.READING,
                language: data.practiceLanguage,
                topic: data.topic,
                score: score,
                maxScore: data.questions.length,
            });
        }
    }, [showResults]);

    const question = data.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];

    const handleOptionClick = (index: number) => {
        if (currentAnswer.selectedOption !== null) return;

        const isCorrect = index === question.correctIndex;
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = {
            selectedOption: index,
            isCorrect,
        };
        setAnswers(newAnswers);
        setShowExplanation(true);
    };

    const handleNext = () => {
        setShowExplanation(false);
        if (currentQuestionIndex < data.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (!isFreeMode) {
            setShowResults(true);
        }
    };

    const handleQuestionSelect = (index: number) => {
        setShowExplanation(answers[index].selectedOption !== null);
        setCurrentQuestionIndex(index);
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const toggleMode = () => {
        setIsFreeMode(!isFreeMode);
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
                    <button
                        onClick={() => setShowPassage(!showPassage)}
                        className="text-blue-600 hover:underline font-bold text-sm"
                    >
                        {showPassage ? t.hidePassage : t.showPassage}
                    </button>

                    {showPassage && (
                        <div className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded text-lg leading-relaxed whitespace-pre-wrap">
                            {data.passage}
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
                        const isAnswered =
                            currentAnswer.selectedOption !== null;
                        let buttonStyle =
                            "w-full text-left p-4 text-lg border-2 border-gray-200 hover:border-theme hover:bg-gray-50 transition-all";

                        if (isAnswered) {
                            if (index === question.correctIndex) {
                                buttonStyle =
                                    "w-full text-left p-4 text-lg border-2 border-green-500 bg-green-50 text-green-700 font-bold";
                            } else if (index === currentAnswer.selectedOption) {
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

                {showExplanation && currentAnswer.selectedOption !== null && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-100 animate-fade-in">
                        <div className="bg-blue-50 p-4 border-l-4 border-blue-500 mb-4">
                            <span className="font-bold block mb-1">
                                {t.explanation}
                            </span>
                            <p className="text-gray-700">
                                {question.explanation}
                            </p>
                        </div>
                        {!isFreeMode && (
                            <div className="text-right">
                                <PixelButton onClick={handleNext}>
                                    {currentQuestionIndex <
                                    data.questions.length - 1
                                        ? t.next
                                        : t.finish}
                                </PixelButton>
                            </div>
                        )}
                    </div>
                )}
            </PixelCard>

            {/* Answer Sheet / Mode Toggle - Moved below question card */}
            <PixelCard className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold">{t.answerSheet}</h3>
                    <PixelTooltip
                        content={
                            isFreeMode ? t.sequentialModeDesc : t.freeModeDesc
                        }
                    >
                        <button
                            onClick={toggleMode}
                            className="text-sm px-3 py-1 border-2 border-gray-300 hover:border-theme rounded transition-colors"
                        >
                            {isFreeMode ? t.sequentialMode : t.freeMode}
                        </button>
                    </PixelTooltip>
                </div>

                {/* Question Navigation Grid */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {data.questions.map((_, index) => {
                        const answer = answers[index];
                        const isActive = index === currentQuestionIndex;
                        const isAnswered = answer.selectedOption !== null;

                        let btnClass =
                            "w-10 h-10 border-2 font-bold transition-all ";

                        if (isActive) {
                            btnClass +=
                                "border-theme bg-theme text-white scale-110 ";
                        } else if (isAnswered) {
                            btnClass += answer.isCorrect
                                ? "border-green-500 bg-green-100 text-green-700 "
                                : "border-red-500 bg-red-100 text-red-700 ";
                        } else {
                            btnClass +=
                                "border-gray-300 bg-white hover:border-gray-400 ";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() =>
                                    isFreeMode && handleQuestionSelect(index)
                                }
                                disabled={!isFreeMode}
                                className={btnClass}
                                title={isAnswered ? t.answered : t.unanswered}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Progress Info */}
                <div className="text-sm text-gray-500 flex justify-between items-center">
                    <span>
                        {t.answered}: {answeredCount} / {data.questions.length}
                    </span>
                    {isFreeMode && allAnswered && (
                        <PixelButton
                            onClick={handleSubmit}
                            className="text-sm px-4 py-1"
                        >
                            {t.submitAnswers}
                        </PixelButton>
                    )}
                </div>
            </PixelCard>
        </div>
    );
};

