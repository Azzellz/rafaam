import React from "react";
import { ContentType, GeneratedContent, Language } from "../../types";
import { PixelButton } from "../pixel";
import { GrammarView } from "./GrammarView";
import { QuizView } from "./QuizView";
import { ConversationView } from "./ConversationView";
import { WritingView } from "./WritingView";
import { ChatView } from "./ChatView";
import { CustomView } from "./CustomView";
import { ListeningView } from "./ListeningView";
import { ReadingView } from "./ReadingView";

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
        ) : content.type === ContentType.CHAT ? (
            <ChatView
                data={content.data}
                language={language}
                onExit={onClearContent}
            />
        ) : content.type === ContentType.WRITING ? (
            <WritingView
                data={content.data}
                language={language}
                onExit={onClearContent}
            />
        ) : content.type === ContentType.LISTENING ? (
            <ListeningView
                data={content.data}
                language={language}
                onRestart={onClearContent}
            />
        ) : content.type === ContentType.READING ? (
            <ReadingView
                data={content.data}
                language={language}
                onRestart={onClearContent}
            />
        ) : content.type === ContentType.CUSTOM ? (
            <CustomView
                data={content.data}
                onBack={onReset}
                language={language}
            />
        ) : null}
    </div>
);
