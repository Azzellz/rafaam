import React, { useState } from "react";
import { generateSpeech } from "../../services/geminiService";
import { playAudioData } from "../../utils/audio";
import { PracticeLanguage } from "@/types";

interface Props {
    text: string;
    size?: "sm" | "md";
    className?: string;
    label?: string;
    practiceLanguage?: PracticeLanguage;
}

export const TTSButton: React.FC<Props> = ({
    text,
    size = "md",
    className = "",
    label,
    practiceLanguage,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying || isLoading) return;

        setIsLoading(true);
        try {
            const audioData = await generateSpeech(text, practiceLanguage);
            setIsLoading(false);
            setIsPlaying(true);
            await playAudioData(audioData);
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
            {label && (
                <span className="ml-2 font-['VT323'] text-lg">{label}</span>
            )}
        </button>
    );
};
