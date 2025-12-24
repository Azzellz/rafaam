import React from "react";
import { ContentType, Language } from "@/types";
import { PixelModal, PixelButton } from "@/components/pixel";
import { translations } from "@/i18n";
import { useStatsStore } from "@/stores/useStatsStore";
import { pixelMutedParagraph } from "@/constants/style";

interface Props {
    language: Language;
    onClose: () => void;
}

export const StatsView: React.FC<Props> = ({ language, onClose }) => {
    const t = translations[language];
    const records = useStatsStore((state) => state.records);
    const clearRecords = useStatsStore((state) => state.clearRecords);

    const totalSessions = records.length;
    const totalDuration = records.reduce(
        (acc, curr) => acc + (curr.duration || 0),
        0
    );

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins} ${t.minutes} ${secs} ${t.seconds}`;
        }
        return `${secs} ${t.seconds}`;
    };

    const getTypeLabel = (type: ContentType) => {
        switch (type) {
            case ContentType.GRAMMAR:
                return t.grammarLesson;
            case ContentType.QUIZ:
                return t.quizBattle;
            case ContentType.CONVERSATION:
                return t.conversation;
            case ContentType.CHAT:
                return t.chatPractice;
            case ContentType.WRITING:
                return t.writingPractice;
            default:
                return type;
        }
    };

    const sortedRecords = [...records].sort(
        (a, b) => b.timestamp - a.timestamp
    );

    return (
        <PixelModal title={t.statistics} onClose={onClose}>
            <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4 mb-8 mt-4">
                    <div className="bg-blue-50 p-4 border-2 border-black text-center">
                        <div className="text-3xl font-bold text-theme mb-1">
                            {totalSessions}
                        </div>
                        <div className="text-sm text-gray-600 uppercase">
                            {t.totalSessions}
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 border-2 border-black text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                            {formatDuration(totalDuration)}
                        </div>
                        <div className="text-sm text-gray-600 uppercase">
                            {t.totalDuration}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4">{t.lastSession}</h3>
                    {sortedRecords.length > 0 ? (
                        <div className="space-y-3">
                            {sortedRecords.map((record) => (
                                <div
                                    key={record.id}
                                    className="border-2 border-gray-200 p-3 hover:border-theme transition-colors bg-white"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-lg">
                                            {getTypeLabel(record.type)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(
                                                record.timestamp
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mb-2">
                                        {record.topic}
                                    </p>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        {record.score !== undefined && (
                                            <span>
                                                {t.score}: {record.score}
                                                {record.maxScore
                                                    ? ` / ${record.maxScore}`
                                                    : ""}
                                            </span>
                                        )}
                                        {record.duration !== undefined && (
                                            <span>
                                                {formatDuration(
                                                    record.duration
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={pixelMutedParagraph}>{t.noRecords}</p>
                    )}
                </div>

                {records.length > 0 && (
                    <div className="flex justify-end mt-4">
                        <PixelButton
                            variant="danger"
                            onClick={() => {
                                if (confirm(t.confirmClear)) {
                                    clearRecords();
                                }
                            }}
                        >
                            {t.clearAll}
                        </PixelButton>
                    </div>
                )}
            </div>
        </PixelModal>
    );
};
