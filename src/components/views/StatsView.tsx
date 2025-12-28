"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ContentType, Language } from "@/types";
import {
    PixelModal,
    PixelButton,
    PixelSelect,
    PixelInput,
} from "@/components/pixel";
import { translations } from "@/i18n";
import { useStatsStore } from "@/stores/useStatsStore";
import { showConfirm } from "@/stores/useDialogStore";
import { pixelMutedParagraph } from "@/constants/style";

interface Props {
    language: Language;
    onClose?: () => void;
    embedded?: boolean;
}

const ITEMS_PER_PAGE = 5;

export const StatsView: React.FC<Props> = ({
    language,
    onClose,
    embedded = false,
}) => {
    const t = translations[language];
    const records = useStatsStore((state) => state.records);
    const clearRecords = useStatsStore((state) => state.clearRecords);
    const refreshRecords = useStatsStore((state) => state.refreshRecords);

    useEffect(() => {
        refreshRecords();
    }, [refreshRecords]);

    const [filterType, setFilterType] = useState<string>("all");
    const [filterTopic, setFilterTopic] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);

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
            case ContentType.LISTENING:
                return t.listeningPractice;
            case ContentType.READING:
                return t.readingPractice;
            case ContentType.CLOZE:
                return t.clozePractice;
            default:
                return type;
        }
    };

    const filteredRecords = useMemo(() => {
        return records
            .filter((r) => {
                if (filterType !== "all" && r.type !== filterType) return false;
                if (
                    filterTopic &&
                    !r.topic.toLowerCase().includes(filterTopic.toLowerCase())
                )
                    return false;
                return true;
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [records, filterType, filterTopic]);

    const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const content = (
        <div
            className={`overflow-y-auto flex-1 ${embedded ? "" : "p-4 md:p-6"}`}
        >
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

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <PixelSelect
                            value={filterType}
                            onChange={(val) => {
                                setFilterType(val);
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: "all", label: t.allTypes },
                                {
                                    value: ContentType.GRAMMAR,
                                    label: t.grammarLesson,
                                },
                                {
                                    value: ContentType.QUIZ,
                                    label: t.quizBattle,
                                },
                                {
                                    value: ContentType.CONVERSATION,
                                    label: t.conversation,
                                },
                                {
                                    value: ContentType.CHAT,
                                    label: t.chatPractice,
                                },
                                {
                                    value: ContentType.WRITING,
                                    label: t.writingPractice,
                                },
                            ]}
                        />
                    </div>
                    <div className="flex-1">
                        <PixelInput
                            placeholder={t.filterByTopic}
                            value={filterTopic}
                            onChange={(e) => {
                                setFilterTopic(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {paginatedRecords.length > 0 ? (
                    <div className="space-y-3">
                        {paginatedRecords.map((record) => (
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
                                            {formatDuration(record.duration)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={pixelMutedParagraph}>{t.noRecords}</p>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <PixelButton
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            {t.previousPage}
                        </PixelButton>
                        <span className="font-bold">
                            {t.page} {currentPage} {t.of} {totalPages}
                        </span>
                        <PixelButton
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            {t.nextPage}
                        </PixelButton>
                    </div>
                )}
            </div>

            {records.length > 0 && (
                <div className="flex justify-end mt-4">
                    <PixelButton
                        variant="danger"
                        onClick={async () => {
                            showConfirm(
                                t.confirmClear,
                                async () => {
                                    await clearRecords();
                                },
                                undefined,
                                undefined,
                                language
                            );
                        }}
                    >
                        {t.clearAll}
                    </PixelButton>
                </div>
            )}
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <PixelModal
            title={t.statistics}
            onClose={onClose || (() => {})}
            noPadding
        >
            {content}
        </PixelModal>
    );
};

