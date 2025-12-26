import React, { useState, useEffect } from "react";
import { generateEdgeTTS } from "@/utils/edgeTTS";
import { playMP3Audio, playAudioData } from "@/utils/audio";
import { PracticeLanguage } from "@/types";
import { getAIProviderConfig } from "@/services/storage";
import { generateSpeech } from "@/services/ai";

interface Props {
    text: string;
    size?: "sm" | "md";
    className?: string;
    label?: string;
    practiceLanguage?: PracticeLanguage;
    useEdgeTTS?: boolean; // 是否使用 Edge TTS（默认 true）
}

export const TTSButton: React.FC<Props> = ({
    text,
    size = "md",
    className = "",
    label,
    practiceLanguage,
    useEdgeTTS = true,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldUseEdgeTTS, setShouldUseEdgeTTS] = useState(useEdgeTTS);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const config = await getAIProviderConfig();
                if (config?.tts?.useEdgeTTS !== undefined) {
                    setShouldUseEdgeTTS(config.tts.useEdgeTTS);
                }
            } catch (error) {
                console.error("Failed to load TTS config:", error);
            }
        };
        loadConfig();
    }, []);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying || isLoading) return;

        setIsLoading(true);
        try {
            if (shouldUseEdgeTTS) {
                // 使用 Edge TTS 自动语言检测
                const config = await getAIProviderConfig();
                const edgeConfig = config?.tts?.edgeTTSConfig;

                const audioData = await generateEdgeTTS(text, {
                    autoDetectLanguage: !edgeConfig?.voice, // 如果指定了语音就不自动检测
                    preferredGender: edgeConfig?.preferredGender || "Female",
                    voice: edgeConfig?.voice,
                    rate: edgeConfig?.rate,
                    pitch: edgeConfig?.pitch,
                    volume: edgeConfig?.volume,
                });
                setIsLoading(false);
                setIsPlaying(true);
                await playMP3Audio(audioData);
            } else {
                // 使用 AI 模型 TTS
                const audioData = await generateSpeech(text);
                setIsLoading(false);
                setIsPlaying(true);
                await playAudioData(audioData);
            }
        } catch (error) {
            console.error("TTS Error:", error);
        } finally {
            setIsLoading(false);
            setIsPlaying(false);
        }
    };

    const iconSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

    return (
        <button
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss/selection clearing
            onClick={handleClick}
            disabled={isLoading || isPlaying}
            className={`inline-flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 active:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-wait ${
                size === "sm" ? "p-1" : "p-2"
            } ${className}`}
            title="Read aloud"
        >
            {isLoading ? (
                <div
                    className={`${iconSize} animate-spin border-2 border-gray-300 border-t-black rounded-full`}
                ></div>
            ) : isPlaying ? (
                <div
                    className={`${iconSize} flex items-center justify-center space-x-[2px]`}
                >
                    <div className="w-1 h-2 bg-black animate-[bounce_1s_infinite]"></div>
                    <div className="w-1 h-3 bg-black animate-[bounce_1s_infinite_0.2s]"></div>
                    <div className="w-1 h-2 bg-black animate-[bounce_1s_infinite_0.4s]"></div>
                </div>
            ) : (
                <svg className={`${iconSize} fill-current`} viewBox="0 0 24 24">
                    <path
                        d="M11 5L6 9H2V15H6L11 19V5Z"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="square"
                    />
                    <path
                        d="M15.54 8.46C16.4774 9.39764 17.0041 10.6692 17.0041 11.995C17.0041 13.3208 16.4774 14.5924 15.54 15.53"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="square"
                    />
                    <path
                        d="M19.07 4.93C20.9447 6.80527 21.998 9.34835 21.998 12C21.998 14.6516 20.9447 17.1947 19.07 19.07"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="square"
                    />
                </svg>
            )}
            {label && <span className="ml-2 text-lg">{label}</span>}
        </button>
    );
};
