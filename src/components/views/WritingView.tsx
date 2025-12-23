import React, { useState } from "react";
import { Language, WritingTask, WritingEvaluation } from "@/types";
import { PixelButton, PixelCard } from "../layout/PixelUI";
import { translations } from "../i18n";
import { evaluateWriting } from "@/services/geminiService";
import { LoadingSprite } from "../widgets/LoadingSprite";

type WritingViewProps = {
    data: WritingTask;
    language: Language;
    onExit: () => void;
};

export const WritingView: React.FC<WritingViewProps> = ({
    data,
    language,
    onExit,
}) => {
    const t = translations[language];
    const [text, setText] = useState("");
    const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(
        null
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const result = await evaluateWriting(
                text,
                data.prompt,
                data.level,
                language,
                data.practiceLanguage
            );
            setEvaluation(result);
        } catch (error) {
            console.error(error);
            alert(t.connectionError);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <LoadingSprite language={language} />
                <p className="mt-4 font-['VT323'] text-xl text-gray-600">
                    {t.evaluating}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PixelCard title={t.writingPractice}>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-lg mb-2">
                            {t.questTopic}: {data.topic}
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {data.prompt}
                        </p>
                    </div>

                    {data.hints && data.hints.length > 0 && (
                        <div className="bg-yellow-50 p-3 border-2 border-yellow-200 rounded">
                            <p className="font-bold text-sm text-yellow-800 mb-1">
                                {t.point}:
                            </p>
                            <ul className="list-disc list-inside text-sm text-yellow-900">
                                {data.hints.map((hint, i) => (
                                    <li key={i}>{hint}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!evaluation ? (
                        <div className="space-y-4">
                            <textarea
                                className="w-full h-48 p-4 border-2 border-gray-300 rounded font-['VT323'] text-lg focus:border-blue-500 focus:outline-none resize-none"
                                placeholder="..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <div className="flex justify-end space-x-4">
                                <PixelButton
                                    variant="secondary"
                                    onClick={onExit}
                                >
                                    {t.backToGenerator}
                                </PixelButton>
                                <PixelButton
                                    onClick={handleSubmit}
                                    disabled={!text.trim()}
                                >
                                    {t.submitWriting}
                                </PixelButton>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-xl text-blue-900">
                                        {t.score}: {evaluation.score}
                                    </h3>
                                </div>
                                <p className="text-blue-800 mb-4">
                                    {evaluation.feedback}
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-bold text-blue-900 mb-2">
                                            {t.yourWriting}
                                        </h4>
                                        <p className="whitespace-pre-wrap text-gray-700 bg-white p-3 border border-blue-100 rounded h-full">
                                            {text}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 mb-2">
                                            {t.correctedText}
                                        </h4>
                                        <p className="whitespace-pre-wrap text-gray-700 bg-white p-3 border border-blue-100 rounded h-full">
                                            {evaluation.correctedText}
                                        </p>
                                    </div>
                                </div>

                                {evaluation.improvements.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-bold text-blue-900 mb-2">
                                            {t.improvements}
                                        </h4>
                                        <ul className="list-disc list-inside text-blue-800 space-y-1">
                                            {evaluation.improvements.map(
                                                (imp, i) => (
                                                    <li key={i}>{imp}</li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center space-x-4">
                                <PixelButton
                                    variant="secondary"
                                    onClick={onExit}
                                >
                                    {t.finish}
                                </PixelButton>
                                <PixelButton
                                    onClick={() => {
                                        setEvaluation(null);
                                        // Keep text so they can edit it
                                    }}
                                >
                                    {t.playAgain}
                                </PixelButton>
                            </div>
                        </div>
                    )}
                </div>
            </PixelCard>
        </div>
    );
};
