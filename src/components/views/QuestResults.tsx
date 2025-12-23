import React from "react";
import { ContentType, GeneratedContent, Language } from "../../types";
import { PixelButton } from "../layout/PixelUI";
import { GrammarView } from "./GrammarView";
import { QuizView } from "./QuizView";
import { ConversationView } from "./ConversationView";
import { WritingView } from "./WritingView";

type QuestResultsProps = {
    content: GeneratedContent;
    language: Language;
    resetLabel: string;
    onReset: () => void;
    onClearContent: () => void;
};

export const QuestResults: React.FC<QuestResultsProps> = ({
    content,
    language,
    resetLabel,
    onReset,
    onClearContent,
}) => (
    <div className="animate-fade-in-up relative">
        <div className="mb-4 flex justify-end">
            <PixelButton
                variant="secondary"
                onClick={onReset}
                className="text-sm px-4 py-1"
            >
                {resetLabel}
            </PixelButton>
        </div>
        {content.type === ContentType.GRAMMAR ? (
            <GrammarView data={content.data} language={language} />
        ) : content.type === ContentType.QUIZ ? (
            <QuizView
                data={content.data}
                onRestart={onClearContent}
                language={language}
            />
        ) : content.type === ContentType.CONVERSATION ? (
            <ConversationView
                data={content.data}
                language={language}
                onExit={onClearContent}
            />
        ) : (
            <WritingView
                data={content.data}
                language={language}
                onExit={onClearContent}
            />
        )}
    </div>
);
