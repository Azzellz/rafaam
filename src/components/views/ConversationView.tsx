import React, { useEffect, useRef, useState } from "react";
import { ConversationSession, Language, PracticeLanguage } from "@/types";
import { PixelCard, PixelButton } from "@/components/layout/PixelUI";
import { translations } from "@/components/i18n";
import { LANGUAGE_CONFIG } from "@/constants/languages";
import {
    PRACTICE_LANGUAGES,
    DEFAULT_PRACTICE_LANGUAGE,
} from "@/constants/practiceLanguages";
import { pixelMutedParagraph } from "@/styles/classNames";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createPcmBlob, decodeBase64, decodeAudioData } from "@/utils/audio";

interface Props {
    data: ConversationSession;
    language: Language;
    onExit: () => void;
}

interface TranscriptItem {
    role: "user" | "model";
    text: string;
}

export const ConversationView: React.FC<Props> = ({
    data,
    language,
    onExit,
}) => {
    const t = translations[language];
    const practiceLanguageConfig =
        PRACTICE_LANGUAGES[data.practiceLanguage] ??
        PRACTICE_LANGUAGES[DEFAULT_PRACTICE_LANGUAGE];
    const [status, setStatus] = useState<
        "idle" | "connecting" | "connected" | "disconnected" | "error"
    >("idle");
    const [isTalking, setIsTalking] = useState(false); // Model is talking

    // Transcription State
    const [history, setHistory] = useState<TranscriptItem[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [currentOutput, setCurrentOutput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Refs for managing audio and session state
    const sessionRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mountedRef = useRef(true);

    // Accumulation refs for transcription to avoid closure staleness
    const inputBufferRef = useRef("");
    const outputBufferRef = useRef("");

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            disconnect();
        };
    }, []);

    // Auto-scroll to bottom of transcript
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [history, currentInput, currentOutput]);

    const connect = async () => {
        if (status === "connected" || status === "connecting") return;
        setStatus("connecting");

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // Initialize Audio Contexts
            inputAudioContextRef.current = new (window.AudioContext ||
                (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext ||
                (window as any).webkitAudioContext)({ sampleRate: 24000 });

            // Get Microphone Stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                },
            });
            streamRef.current = stream;

            const langName = LANGUAGE_CONFIG[language]?.aiName ?? "English";
            const targetLanguage = practiceLanguageConfig.targetLanguageName;
            const teacherTitle = practiceLanguageConfig.teacherTitle;
            const levelLabel = practiceLanguageConfig.levelSystemLabel;

            const systemInstructionText = `You are a helpful ${targetLanguage} language teacher called '${teacherTitle}'. 
        Your student's ${levelLabel} level is ${data.level}. 
      The conversation topic is: "${data.topic}".
      
      Instructions:
        1. Conduct a roleplay conversation about the topic.
        2. Speak naturally in ${targetLanguage}.
        3. If the user makes a mistake, briefly correct them in ${langName}, then continue the conversation.
      4. Keep your responses concise (under 20 seconds).
      5. Start by greeting the user and asking a question about the topic.
      `;

            // Establish Live Connection
            const sessionPromise = ai.live.connect({
                model: "gemini-2.5-flash-native-audio-preview-09-2025",
                callbacks: {
                    onopen: () => {
                        if (!mountedRef.current) return;
                        setStatus("connected");
                        startAudioInput(stream, sessionPromise);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (!mountedRef.current) return;
                        handleServerMessage(message);
                    },
                    onclose: () => {
                        if (mountedRef.current) setStatus("disconnected");
                    },
                    onerror: (err) => {
                        console.error("Live API Error:", err);
                        if (mountedRef.current) setStatus("error");
                    },
                },
                config: {
                    responseModalities: ["AUDIO" as Modality],
                    systemInstruction: {
                        parts: [{ text: systemInstructionText }],
                    },
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: "Kore" },
                        },
                    },
                    // Do not pass the model name inside transcription config
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });

            sessionRef.current = sessionPromise;
        } catch (err) {
            console.error("Connection failed", err);
            setStatus("error");
        }
    };

    const startAudioInput = (
        stream: MediaStream,
        sessionPromise: Promise<any>
    ) => {
        if (!inputAudioContextRef.current) return;

        const ctx = inputAudioContextRef.current;
        if (ctx.state === "suspended") {
            ctx.resume().catch(console.error);
        }

        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);

            if (inputData.length > 0) {
                const pcmBlob = createPcmBlob(inputData);
                sessionPromise
                    .then((session) => {
                        try {
                            session.sendRealtimeInput({ media: pcmBlob });
                        } catch (e) {
                            console.error("Error sending input", e);
                        }
                    })
                    .catch((err) => {
                        // Ignore session errors here as they are handled in callbacks/connect
                    });
            }
        };

        source.connect(processor);
        processor.connect(ctx.destination);

        sourceNodeRef.current = source;
        processorRef.current = processor;
    };

    const handleServerMessage = async (message: LiveServerMessage) => {
        const { serverContent } = message;

        // Helper: Flush user input to history with merging logic
        const flushUserInput = () => {
            const text = inputBufferRef.current.trim();
            if (!text || text.length === 0) return;

            setHistory((prev) => {
                const last = prev[prev.length - 1];
                // Merge with previous user message if it exists (handles fragmentation)
                if (last?.role === "user") {
                    const needsSpace =
                        !/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]/.test(
                            last.text.slice(-1)
                        );
                    return [
                        ...prev.slice(0, -1),
                        {
                            ...last,
                            text: last.text + (needsSpace ? " " : "") + text,
                        },
                    ];
                }
                return [...prev, { role: "user", text }];
            });
            inputBufferRef.current = "";
            setCurrentInput("");
        };

        // Helper: Flush model output to history with merging logic
        const flushModelOutput = () => {
            const text = outputBufferRef.current.trim();
            if (!text || text.length === 0) return;

            setHistory((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "model") {
                    const needsSpace =
                        !/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]/.test(
                            last.text.slice(-1)
                        );
                    return [
                        ...prev.slice(0, -1),
                        {
                            ...last,
                            text: last.text + (needsSpace ? " " : "") + text,
                        },
                    ];
                }
                return [...prev, { role: "model", text }];
            });
            outputBufferRef.current = "";
            setCurrentOutput("");
        };

        // Handle Text Transcription (Model)
        if (serverContent?.outputTranscription) {
            flushUserInput(); // Model is responding, so user is done

            const text = serverContent.outputTranscription.text;
            if (text) {
                outputBufferRef.current += text;
                setCurrentOutput(outputBufferRef.current);
            }
        }

        // Handle User Transcription
        if (serverContent?.inputTranscription) {
            const text = serverContent.inputTranscription.text;
            if (text) {
                inputBufferRef.current += text;
                setCurrentInput(inputBufferRef.current);
            }
        }

        // Handle Turn Complete
        if (serverContent?.turnComplete) {
            flushUserInput(); // Ensure user input is flushed
            flushModelOutput(); // Flush any pending model text
        }

        // Handle Interruption
        if (serverContent?.interrupted) {
            flushModelOutput(); // Save whatever the model said so far

            // Stop audio
            sourcesRef.current.forEach((s) => {
                try {
                    s.stop();
                } catch (e) {}
            });
            sourcesRef.current.clear();
            setIsTalking(false);
            nextStartTimeRef.current = 0;
        }

        // Handle Audio
        const base64Audio =
            serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (base64Audio && outputAudioContextRef.current) {
            flushUserInput(); // Model is speaking, so user is done.

            const ctx = outputAudioContextRef.current;
            if (ctx.state === "suspended") await ctx.resume();

            try {
                const audioBuffer = await decodeAudioData(
                    decodeBase64(base64Audio),
                    ctx
                );

                setIsTalking(true);

                nextStartTimeRef.current = Math.max(
                    nextStartTimeRef.current,
                    ctx.currentTime
                );

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);

                source.onended = () => {
                    if (sourcesRef.current.has(source)) {
                        sourcesRef.current.delete(source);
                    }
                    if (sourcesRef.current.size === 0) {
                        setIsTalking(false);
                    }
                };

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
            } catch (e) {
                console.error("Audio decode/play error", e);
            }
        }
    };

    const disconnect = () => {
        sessionRef.current?.then((session) => session.close()).catch(() => {});

        streamRef.current?.getTracks().forEach((track) => track.stop());

        sourceNodeRef.current?.disconnect();
        processorRef.current?.disconnect();

        if (
            inputAudioContextRef.current &&
            inputAudioContextRef.current.state !== "closed"
        ) {
            inputAudioContextRef.current.close().catch(() => {});
        }
        if (
            outputAudioContextRef.current &&
            outputAudioContextRef.current.state !== "closed"
        ) {
            outputAudioContextRef.current.close().catch(() => {});
        }

        sourcesRef.current.forEach((s) => {
            try {
                s.stop();
            } catch (e) {}
        });
        sourcesRef.current.clear();

        setStatus("idle");
        setIsTalking(false);
        setHistory([]);
        setCurrentInput("");
        setCurrentOutput("");
        inputBufferRef.current = "";
        outputBufferRef.current = "";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] animate-fade-in w-full">
            <div className="mb-4 text-center">
                <h2 className="text-2xl md:text-3xl text-theme mb-2">
                    {t.conversation}
                </h2>
                <p className={pixelMutedParagraph}>
                    {t.questTopic}: {data.topic}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
                    <span className="px-3 py-1 border-2 border-black bg-white">
                        {practiceLanguageConfig.nativeLabel}
                    </span>
                    <span className="px-3 py-1 border-2 border-dashed border-black bg-[#fefce8]">
                        {practiceLanguageConfig.levelSystemLabel} {data.level}
                    </span>
                </div>
            </div>

            <PixelCard className="w-full max-w-lg flex flex-col items-center relative h-[60vh] md:h-[600px] overflow-hidden">
                {/* Status Header */}
                <div className="w-full flex justify-between items-center text-base md:text-lg mb-4 border-b-2 border-gray-200 pb-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${
                                status === "connected"
                                    ? "bg-green-500 animate-pulse"
                                    : status === "error"
                                    ? "bg-red-500"
                                    : "bg-gray-400"
                            }`}
                        ></div>
                        <span className="uppercase">
                            {status === "connecting" && t.statusConnecting}
                            {status === "connected" && t.statusConnected}
                            {status === "idle" && t.statusDisconnected}
                            {status === "disconnected" && t.statusDisconnected}
                            {status === "error" && "ERROR"}
                        </span>
                    </div>
                    {status === "connected" && (
                        <div className="uppercase font-bold text-theme">
                            {isTalking ? t.speaking : t.listening}
                        </div>
                    )}
                </div>

                {/* Visualizer & Avatar */}
                <div className="mb-4 flex-shrink-0 flex items-center justify-center">
                    {status === "connected" ? (
                        <div className="relative">
                            {/* Sensei Avatar / Icon */}
                            <div
                                className={`w-20 h-20 md:w-24 md:h-24 border-4 border-black transition-all duration-200 ${
                                    isTalking
                                        ? "bg-[#facc15] translate-y-[-4px] shadow-[4px_4px_0_0_#000]"
                                        : "bg-gray-200 shadow-none"
                                }`}
                            >
                                <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl">
                                    {isTalking ? "🗣️" : "👂"}
                                </div>
                            </div>
                            {/* Speaking Waves */}
                            {isTalking && (
                                <div className="absolute -right-6 top-0 bottom-0 flex flex-col justify-center gap-1">
                                    <div className="w-1 h-1 bg-black animate-[ping_1s_infinite]"></div>
                                    <div className="w-1 h-3 bg-black animate-[ping_1s_infinite_0.2s]"></div>
                                    <div className="w-1 h-1 bg-black animate-[ping_1s_infinite_0.4s]"></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-gray-300 bg-gray-100 flex items-center justify-center text-4xl md:text-5xl grayscale opacity-50">
                            🤖
                        </div>
                    )}
                </div>

                {/* Transcript Area (Subtitles) - Flexible Height */}
                <div className="w-full flex-grow bg-[#f8fafc] border-2 border-black p-2 md:p-3 mb-4 overflow-y-auto shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] min-h-0">
                    {history.length === 0 &&
                        !currentInput &&
                        !currentOutput &&
                        status === "connected" && (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                {t.listening}
                            </div>
                        )}

                    <div className="space-y-3">
                        {history.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex flex-col ${
                                    msg.role === "user"
                                        ? "items-end"
                                        : "items-start"
                                }`}
                            >
                                <span className="text-xs text-gray-500 mb-1 tracking-wider">
                                    {msg.role === "user"
                                        ? t.transcriptUser
                                        : t.transcriptModel}
                                </span>
                                <div
                                    className={`px-3 py-2 text-sm md:text-base border-2 ${
                                        msg.role === "user"
                                            ? "bg-[#dbeafe] border-[#1e40af] text-[#1e3a8a] rounded-tr-none"
                                            : "bg-white border-black rounded-tl-none"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Real-time Streaming */}
                        {currentInput && (
                            <div className="flex flex-col items-end opacity-80">
                                <span className="text-xs text-gray-500 mb-1">
                                    {t.transcriptUser}
                                </span>
                                <div className="px-3 py-2 text-sm bg-[#dbeafe] border-2 border-[#1e40af] border-dashed text-[#1e3a8a] rounded-tr-none">
                                    {currentInput}
                                </div>
                            </div>
                        )}
                        {currentOutput && (
                            <div className="flex flex-col items-start opacity-80">
                                <span className="text-xs text-gray-500 mb-1">
                                    {t.transcriptModel}
                                </span>
                                <div className="px-3 py-2 text-sm bg-white border-2 border-black border-dashed rounded-tl-none">
                                    {currentOutput}
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                {/* Instructions (Only when idle) - Absolutely positioned or conditional overlay might be better on small screens, but flow is okay */}
                {status === "idle" && (
                    <p className="text-center text-gray-500 mb-4 px-2 text-sm md:text-base">
                        {t.conversationIntro} <br />
                        <span className="text-xs">{t.micPermission}</span>
                    </p>
                )}

                {/* Controls */}
                <div className="w-full flex flex-col gap-3 mt-auto flex-shrink-0">
                    {status === "idle" ||
                    status === "error" ||
                    status === "disconnected" ? (
                        <PixelButton
                            onClick={connect}
                            className="w-full py-2 md:py-3 text-lg md:text-xl"
                        >
                            {t.startConversation}
                        </PixelButton>
                    ) : (
                        <PixelButton
                            variant="danger"
                            onClick={() => {
                                disconnect();
                                onExit();
                            }}
                            className="w-full py-2 md:py-3"
                        >
                            {t.endConversation}
                        </PixelButton>
                    )}

                    {status === "error" && (
                        <p className="text-red-500 text-center text-sm">
                            {t.connectionError}
                        </p>
                    )}
                </div>
            </PixelCard>
        </div>
    );
};
