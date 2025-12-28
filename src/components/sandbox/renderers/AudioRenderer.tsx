/**
 * Audio Renderer
 * 音频组件渲染器
 */

import React, { useState } from "react";
import { AudioComponentConfig } from "@/types/sandbox";
import { Language } from "@/types";
import { translations } from "@/i18n";
import { TTSButton } from "@/components/widgets/TTSButton";

interface AudioRendererProps {
    config: AudioComponentConfig;
    isPreview?: boolean;
    language: Language;
}

export const AudioRenderer: React.FC<AudioRendererProps> = ({
    config,
    isPreview,
    language,
}) => {
    const t = translations[language];
    const [showTranscript, setShowTranscript] = useState(false);

    return (
        <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded">
            <div className="flex items-center gap-4">
                {config.ttsText ? (
                    <TTSButton
                        text={config.ttsText}
                        className="flex-shrink-0"
                    />
                ) : config.audioUrl ? (
                    <audio controls src={config.audioUrl} className="flex-1" />
                ) : isPreview ? (
                    <div className="text-gray-500">🔊 {t.audioArea}</div>
                ) : null}

                {config.transcript && (
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="text-sm text-theme hover:underline"
                    >
                        {showTranscript ? t.hideTranscript : t.showTranscript}
                    </button>
                )}
            </div>

            {showTranscript && config.transcript && (
                <div className="mt-3 p-3 bg-white border border-gray-200 text-sm">
                    {config.transcript}
                </div>
            )}
        </div>
    );
};
