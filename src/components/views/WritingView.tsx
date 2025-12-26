import React, { useState } from "react";
import { Language, WritingTask, WritingEvaluation, ContentType } from "@/types";
import { PixelButton, PixelCard } from "../pixel";
import { translations } from "@/i18n";
import { evaluateWriting } from "@/services/ai";
import { handleAIConfigError } from "@/services/ai/configErrorHandler";
import { LoadingSprite } from "../widgets/LoadingSprite";
import { useStatsStore } from "@/stores/useStatsStore";
import { showAlert } from "@/stores/useDialogStore";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();
    const [text, setText] = useState("");
    const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const addRecord = useStatsStore((state) => state.addRecord);

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
            await addRecord({
                type: ContentType.WRITING,
                language: data.practiceLanguage,
                topic: data.topic,
                score: result.score,
                maxScore: 100,
            });
        } catch (error: any) {
            console.error(error);

            // 检查是否是配置错误
            const isConfigError = handleAIConfigError({
                error,
                language,
                onNavigateToSettings: () => {
                    navigate("/settings");
                },
            });

            if (!isConfigError) {
                showAlert(t.connectionError, undefined, language);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSprite language={language} text={t.evaluating} />;
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
                        <div className="bg-yellow-50 p-4 border-2 border-black">
                            <p className="font-bold text-sm text-black mb-2 uppercase">
                                {t.point}:
                            </p>
                            <ul className="list-disc list-inside text-lg text-gray-800">
                                {data.hints.map((hint, i) => (
                                    <li key={i}>{hint}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!evaluation ? (
                        <div className="space-y-4">
                            <textarea
                                className="w-full h-48 p-4 border-2 border-black text-xl focus:bg-blue-50 focus:outline-none resize-none"
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
                            <div className="bg-blue-50 p-4 border-2 border-black">
                                <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                                    <h3 className="font-bold text-2xl">
                                        {t.score}: {evaluation.score}
                                    </h3>
                                </div>
                                <p className="text-lg mb-6">
                                    {evaluation.feedback}
                                </p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-xl mb-2">
                                            {t.yourWriting}
                                        </h4>
                                        <div className="bg-white p-4 border-2 border-black h-full text-lg whitespace-pre-wrap">
                                            {text}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-2">
                                            {t.correctedText}
                                        </h4>
                                        <div className="bg-white p-4 border-2 border-black h-full text-lg whitespace-pre-wrap">
                                            {evaluation.correctedText}
                                        </div>
                                    </div>
                                </div>

                                {evaluation.improvements.length > 0 && (
                                    <div className="mt-12">
                                        <h4 className="font-bold text-xl mb-2">
                                            {t.improvements}
                                        </h4>
                                        <ul className="list-disc list-inside text-lg space-y-1">
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
