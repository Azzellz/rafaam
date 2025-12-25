import React, { useEffect, useState, useRef } from "react";
import { TTSButton } from "./TTSButton";
import { createPortal } from "react-dom";
import { translateText } from "@/services/geminiService";

export const SelectionTool: React.FC = () => {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(
        null
    );
    const [selectedText, setSelectedText] = useState("");
    const [showTranslate, setShowTranslate] = useState(false);
    const [translation, setTranslation] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [targetLang, setTargetLang] = useState<
        "English" | "Chinese" | "Japanese"
    >("Chinese");

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showTranslate && selectedText) {
            setIsTranslating(true);
            translateText(selectedText, targetLang)
                .then(setTranslation)
                .catch(() => setTranslation("Translation failed"))
                .finally(() => setIsTranslating(false));
        }
    }, [showTranslate, targetLang, selectedText]);

    useEffect(() => {
        const handleSelection = (e: Event) => {
            // If clicking/interacting inside the popup, do not recalculate/clear selection
            if (
                popupRef.current &&
                e.target instanceof Node &&
                popupRef.current.contains(e.target)
            ) {
                return;
            }

            // Small delay to allow selection to settle
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                const selection = window.getSelection();
                if (!selection || selection.isCollapsed) {
                    setPosition(null);
                    setSelectedText("");
                    return;
                }

                const text = selection.toString().trim();
                if (text.length === 0) {
                    setPosition(null);
                    setShowTranslate(false);
                    setTranslation("");
                    return;
                }

                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Calculate position (centered above selection)
                setPosition({
                    x: rect.left + rect.width / 2 + window.scrollX,
                    y: rect.top + window.scrollY - 50, // 50px above
                });
                setSelectedText(text);
                setShowTranslate(false);
                setTranslation("");
            }, 200);
        };

        const handleMouseDown = (e: MouseEvent) => {
            // If clicking inside the popup, do not close it
            if (
                popupRef.current &&
                e.target instanceof Node &&
                popupRef.current.contains(e.target)
            ) {
                return;
            }
            // Hide popup immediately on click outside
            setPosition(null);
            setShowTranslate(false);
            setTranslation("");
        };

        document.addEventListener("mouseup", handleSelection);
        document.addEventListener("keyup", handleSelection); // For keyboard selection
        document.addEventListener("mousedown", handleMouseDown);

        return () => {
            document.removeEventListener("mouseup", handleSelection);
            document.removeEventListener("keyup", handleSelection);
            document.removeEventListener("mousedown", handleMouseDown);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (!position || !selectedText) return null;

    return createPortal(
        <div
            ref={popupRef}
            className="absolute z-50 transform -translate-x-1/2 animate-bounce-in"
            style={{ left: position.x, top: position.y }}
        >
            <div className="bg-[#facc15] border-2 border-black p-1 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                    <TTSButton text={selectedText} size="sm" label="READ" />
                    <button
                        onClick={() => setShowTranslate(!showTranslate)}
                        className="inline-flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 active:translate-y-[2px] transition-all p-1"
                    >
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="square"
                            strokeLinejoin="round"
                        >
                            <path d="M5 8l6 6" />
                            <path d="M4 14l6-6 2-3" />
                            <path d="M2 5h12" />
                            <path d="M7 2v3" />
                            <path d="M22 22l-5-10-5 10" />
                            <path d="M14 18h6" />
                        </svg>
                        <span className="ml-2 text-lg">TRANSLATE</span>
                    </button>
                </div>

                {showTranslate && (
                    <div className="bg-white border-2 border-black p-2 w-64">
                        <div className="flex gap-1 mb-2 justify-center">
                            {(["English", "Chinese", "Japanese"] as const).map(
                                (lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setTargetLang(lang)}
                                        className={`px-2 py-1 text-[10px] border-2 border-black transition-colors ${
                                            targetLang === lang
                                                ? "bg-theme text-white"
                                                : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                    >
                                        {lang === "Chinese"
                                            ? "中文"
                                            : lang === "Japanese"
                                            ? "日本語"
                                            : "EN"}
                                    </button>
                                )
                            )}
                        </div>
                        <div className="text-sm min-h-[20px] max-h-[200px] overflow-y-auto">
                            {isTranslating ? (
                                <span className="animate-pulse text-gray-500">
                                    Translating...
                                </span>
                            ) : (
                                translation
                            )}
                        </div>
                    </div>
                )}

                {/* Little triangle arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black mt-[-2px]"></div>
            </div>
        </div>,
        document.body
    );
};
