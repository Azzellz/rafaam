"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ClozeExercise, Language, ContentType } from "@/types";
import { PixelCard, PixelButton } from "@/components/pixel";
import { translations } from "@/i18n";
import { PRACTICE_LANGUAGES } from "@/constants/practiceLanguages";
import { useStatsStore } from "@/stores/useStatsStore";

interface Props {
    data: ClozeExercise;
    language: Language;
    onRestart: () => void;
}

type AnswerState = {
    selectedOption: number | null;
    isCorrect: boolean | null;
};

export const ClozeView: React.FC<Props> = ({ data, language, onRestart }) => {
    const t = translations[language];
    const practiceConfig = PRACTICE_LANGUAGES[data.practiceLanguage];
    const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerState[]>(
        data.blanks.map(() => ({ selectedOption: null, isCorrect: null }))
    );
    const [showResults, setShowResults] = useState(false);
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

    const allAnswered = answeredCount === data.blanks.length;

    useEffect(() => {
        if (showResults) {
            addRecord({
                type: ContentType.CLOZE,
                language: data.practiceLanguage,
                topic: data.topic,
                score: score,
                maxScore: data.blanks.length,
            });
        }
    }, [
        showResults,
        addRecord,
        data.practiceLanguage,
        data.topic,
        data.blanks.length,
        score,
    ]);

    // 渲染带有空白的文本
    const renderPassage = () => {
        const passageText = data.passage;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        data.blanks.forEach((blank, index) => {
            const blankMarker = `[BLANK_${index}]`;
            const markerIndex = passageText.indexOf(blankMarker, lastIndex);

            if (markerIndex !== -1) {
                // 添加空白前的文本
                if (markerIndex > lastIndex) {
                    parts.push(
                        <span key={`text-${index}`}>
                            {passageText.substring(lastIndex, markerIndex)}
                        </span>
                    );
                }

                // 添加空白（显示答案或下划线）
                const answer = answers[index];
                parts.push(
                    <span
                        key={`blank-${index}`}
                        className={`inline-block mx-1 px-2 py-0.5 border-2 border-black cursor-pointer transition-colors ${
                            answer.selectedOption !== null
                                ? answer.isCorrect
                                    ? "bg-green-200"
                                    : "bg-red-200"
                                : currentBlankIndex === index
                                ? "bg-yellow-100"
                                : "bg-gray-100"
                        }`}
                        onClick={() => {
                            if (
                                !showResults &&
                                answer.selectedOption === null
                            ) {
                                setCurrentBlankIndex(index);
                            }
                        }}
                    >
                        {answer.selectedOption !== null
                            ? blank.options[answer.selectedOption]
                            : "_____"}
                    </span>
                );

                lastIndex = markerIndex + blankMarker.length;
            }
        });

        // 添加剩余文本
        if (lastIndex < passageText.length) {
            parts.push(
                <span key="text-end">{passageText.substring(lastIndex)}</span>
            );
        }

        return <div className="text-xl leading-relaxed">{parts}</div>;
    };

    const currentBlank = data.blanks[currentBlankIndex];
    const currentAnswer = answers[currentBlankIndex];

    const handleOptionClick = (index: number) => {
        if (currentAnswer.selectedOption !== null || showResults) return;

        const correctIndex = currentBlank.options.indexOf(
            currentBlank.correctAnswer
        );
        const isCorrect = index === correctIndex;

        const newAnswers = [...answers];
        newAnswers[currentBlankIndex] = {
            selectedOption: index,
            isCorrect,
        };
        setAnswers(newAnswers);
        setShowExplanation(true);

        // 自动移动到下一个空格
        setTimeout(() => {
            setShowExplanation(false);
            const nextUnanswered = newAnswers.findIndex(
                (a, i) => i > currentBlankIndex && a.selectedOption === null
            );
            if (nextUnanswered !== -1) {
                setCurrentBlankIndex(nextUnanswered);
            }
        }, 1500);
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const handleBlankSelect = (index: number) => {
        if (!showResults && answers[index].selectedOption === null) {
            setCurrentBlankIndex(index);
            setShowExplanation(false);
        }
    };

    if (showResults) {
        const percentage = Math.round((score / data.blanks.length) * 100);
        return (
            <PixelCard className="max-w-4xl mx-auto p-8">
                <h2 className="text-3xl md:text-4xl uppercase font-bold mb-6 text-center">
                    {t.questComplete}
                </h2>
                <div className="text-center mb-8">
                    <div className="text-6xl font-bold mb-4">
                        {score} / {data.blanks.length}
                    </div>
                    <div className="text-2xl text-gray-600">
                        {percentage >= 80 ? t.perfectScore : t.goodEffort}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4">{t.passage}</h3>
                    {renderPassage()}
                </div>

                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4">{t.explanation}</h3>
                    {data.blanks.map((blank, index) => {
                        const answer = answers[index];
                        const correctIndex = blank.options.indexOf(
                            blank.correctAnswer
                        );
                        return (
                            <div
                                key={index}
                                className={`mb-4 p-4 border-2 border-black ${
                                    answer.isCorrect
                                        ? "bg-green-50"
                                        : "bg-red-50"
                                }`}
                            >
                                <div className="font-bold mb-2">
                                    {t.blank} {index + 1}
                                </div>
                                <div className="mb-2">
                                    {t.yourAnswer}:{" "}
                                    <span
                                        className={
                                            answer.isCorrect
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }
                                    >
                                        {answer.selectedOption !== null
                                            ? blank.options[
                                                  answer.selectedOption
                                              ]
                                            : t.noAnswer}
                                    </span>
                                </div>
                                {!answer.isCorrect && (
                                    <div className="text-green-600">
                                        {t.correctAnswer}:{" "}
                                        {blank.options[correctIndex]}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <PixelButton onClick={onRestart} className="w-full">
                    {t.playAgain}
                </PixelButton>
            </PixelCard>
        );
    }

    return (
        <PixelCard className="max-w-4xl mx-auto p-8">
            <div className="mb-6">
                <h2 className="text-3xl md:text-4xl uppercase font-bold mb-2">
                    {data.title}
                </h2>
                <div className="text-lg text-gray-600">
                    {practiceConfig.targetLanguageName} •{" "}
                    {practiceConfig.levelSystemLabel} {data.level}
                </div>
                <div className="mt-2 text-lg">
                    {answeredCount} / {data.blanks.length} {t.answered}
                </div>
            </div>

            <div className="mb-8 p-6 bg-white border-2 border-black">
                {renderPassage()}
            </div>

            <div className="mb-8">
                <div className="text-xl font-bold mb-4">
                    {t.blank} {currentBlankIndex + 1} {t.of}{" "}
                    {data.blanks.length}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentBlank.options.map((option, index) => {
                        const isSelected =
                            currentAnswer.selectedOption === index;
                        const isCorrect =
                            currentBlank.options.indexOf(
                                currentBlank.correctAnswer
                            ) === index;
                        const showCorrectness = isSelected && showExplanation;

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                disabled={
                                    currentAnswer.selectedOption !== null ||
                                    showResults
                                }
                                className={`p-4 border-2 border-black text-xl transition-all hover:translate-y-[-2px] disabled:translate-y-0 disabled:opacity-70 ${
                                    showCorrectness
                                        ? isCorrect
                                            ? "bg-green-200"
                                            : "bg-red-200"
                                        : "bg-white hover:bg-gray-100"
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {showExplanation && currentAnswer.selectedOption !== null && (
                    <div
                        className={`mt-4 p-4 border-2 border-black ${
                            currentAnswer.isCorrect
                                ? "bg-green-50"
                                : "bg-red-50"
                        }`}
                    >
                        <div className="text-xl font-bold mb-2">
                            {currentAnswer.isCorrect ? "✅" : "❌"}
                        </div>
                        {!currentAnswer.isCorrect && (
                            <div className="text-lg">
                                {t.correctAnswer}:{" "}
                                <span className="font-bold">
                                    {currentBlank.correctAnswer}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {data.blanks.map((_, index) => {
                    const answer = answers[index];
                    return (
                        <button
                            key={index}
                            onClick={() => handleBlankSelect(index)}
                            className={`w-10 h-10 border-2 border-black text-lg font-bold transition-colors ${
                                answer.selectedOption !== null
                                    ? answer.isCorrect
                                        ? "bg-green-200"
                                        : "bg-red-200"
                                    : currentBlankIndex === index
                                    ? "bg-yellow-200"
                                    : "bg-white hover:bg-gray-100"
                            }`}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            <PixelButton
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="w-full"
            >
                {t.submitAnswers}
            </PixelButton>
        </PixelCard>
    );
};
