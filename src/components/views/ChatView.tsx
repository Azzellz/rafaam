import React, { useState, useEffect, useRef } from "react";
import { ChatSession, Language, ContentType } from "@/types";
import { PixelCard, PixelButton } from "@/components/pixel";
import { translations } from "@/i18n";
import { TTSButton } from "@/components/widgets/TTSButton";
import { GoogleGenAI } from "@google/genai";
import {
    PRACTICE_LANGUAGES,
    DEFAULT_PRACTICE_LANGUAGE,
} from "@/constants/practiceLanguages";
import { LANGUAGE_CONFIG } from "@/constants/languages";
import { useStatsStore } from "@/stores/useStatsStore";

interface Props {
    data: ChatSession;
    language: Language;
    onExit: () => void;
}

interface Message {
    role: "user" | "model";
    text: string;
}

export const ChatView: React.FC<Props> = ({ data, language, onExit }) => {
    const t = translations[language];
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const systemInstructionRef = useRef<string>("");
    const startTimeRef = useRef<number>(Date.now());
    const addRecord = useStatsStore((state) => state.addRecord);

    const practiceLanguageConfig =
        PRACTICE_LANGUAGES[data.practiceLanguage] ??
        PRACTICE_LANGUAGES[DEFAULT_PRACTICE_LANGUAGE];

    useEffect(() => {
        startTimeRef.current = Date.now();
        return () => {
            const duration = Math.round(
                (Date.now() - startTimeRef.current) / 1000
            );
            if (duration > 5) {
                addRecord({
                    type: ContentType.CHAT,
                    language: data.practiceLanguage,
                    topic: data.topic,
                    duration: duration,
                });
            }
        };
    }, []);

    useEffect(() => {
        const initChat = async () => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const langName = LANGUAGE_CONFIG[language]?.aiName ?? "English";
            const targetLanguage = practiceLanguageConfig.targetLanguageName;
            const teacherTitle = practiceLanguageConfig.teacherTitle;
            const levelLabel = practiceLanguageConfig.levelSystemLabel;

            const systemInstruction = `You are a helpful ${targetLanguage} language teacher called '${teacherTitle}'.
            Your student's ${levelLabel} level is ${data.level}.
            The conversation topic is: "${data.topic}".
            
            Instructions:
            1. Conduct a roleplay conversation about the topic via text chat.
            2. Speak naturally in ${targetLanguage}.
            3. If the user makes a mistake, briefly correct them in ${langName}, then continue the conversation.
            4. Keep your responses concise.
            5. Start by greeting the user and asking a question about the topic.
            `;

            systemInstructionRef.current = systemInstruction;

            try {
                setIsLoading(true);
                // Initial greeting
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    config: {
                        systemInstruction: {
                            parts: [{ text: systemInstruction }],
                        },
                    },
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: "Start the conversation." }],
                        },
                    ],
                });

                const text = response.text;
                if (text) {
                    setMessages([{ role: "model", text }]);
                }
            } catch (error: any) {
                console.error("Chat initialization error:", error);
                let errorMessage =
                    "Error connecting to Sensei. Please try again.";
                if (error.message?.includes("429") || error.status === 429) {
                    errorMessage =
                        "Sensei is busy (Too Many Requests). Please wait a moment.";
                }
                setMessages([
                    {
                        role: "model",
                        text: errorMessage,
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        initChat();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const newMessages = [
            ...messages,
            { role: "user", text: userMessage } as Message,
        ];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // Construct history for the API
            // Map local messages to API format
            const contents = newMessages.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }));

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: {
                        parts: [{ text: systemInstructionRef.current }],
                    },
                },
                contents: contents,
            });

            const text = response.text;
            if (text) {
                setMessages((prev) => [...prev, { role: "model", text }]);
            }
        } catch (error: any) {
            console.error("Chat error:", error);
            let errorMessage = "(Connection Error)";
            if (error.message?.includes("429") || error.status === 429) {
                errorMessage = "(Busy - Please wait)";
            }
            setMessages((prev) => [
                ...prev,
                { role: "model", text: errorMessage },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in w-full max-w-2xl mx-auto">
            <div className="mb-4 text-center">
                <h2 className="text-2xl md:text-3xl text-theme mb-2">
                    {t.chatPractice}
                </h2>
                <p className="text-gray-500">
                    {t.questTopic}: {data.topic}
                </p>
            </div>

            <PixelCard className="h-[600px] flex flex-col p-0 overflow-hidden relative">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${
                                msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[80%] p-3 border-2 ${
                                    msg.role === "user"
                                        ? "rounded-l-lg rounded-tr-lg"
                                        : "bg-white border-black rounded-r-lg rounded-tl-lg"
                                }`}
                                style={
                                    msg.role === "user"
                                        ? {
                                              backgroundColor:
                                                  "color-mix(in srgb, var(--theme-color), white 90%)",
                                              borderColor:
                                                  "var(--theme-shadow)",
                                              color: "var(--theme-shadow)",
                                          }
                                        : {}
                                }
                            >
                                <p className="text-lg whitespace-pre-wrap">
                                    {msg.text}
                                </p>
                                {msg.role === "model" && (
                                    <div className="mt-2 flex justify-end">
                                        <TTSButton
                                            text={msg.text}
                                            size="sm"
                                            practiceLanguage={
                                                data.practiceLanguage
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 border-2 border-gray-300 p-3 rounded-r-lg rounded-tl-lg">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t-2 border-black">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={t.typeMessage}
                            className="flex-1 text-xl border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme"
                            disabled={isLoading}
                        />
                        <PixelButton
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            {t.send}
                        </PixelButton>
                    </div>
                </div>
            </PixelCard>

            <div className="mt-4 flex justify-center">
                <PixelButton variant="secondary" onClick={onExit}>
                    {t.endConversation}
                </PixelButton>
            </div>
        </div>
    );
};
