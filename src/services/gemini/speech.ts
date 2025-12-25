import { Modality } from "@google/genai";
import { PracticeLanguage } from "../../types";
import {
    PRACTICE_LANGUAGES,
    DEFAULT_PRACTICE_LANGUAGE,
} from "@/constants/practiceLanguages";
import { getAIClient } from "./client";

export const generateSpeech = async (
    text: string,
    practiceLanguage: PracticeLanguage = DEFAULT_PRACTICE_LANGUAGE
): Promise<string> => {
    if (!text || !text.trim()) {
        throw new Error("Text is empty");
    }

    const voiceName =
        PRACTICE_LANGUAGES[practiceLanguage]?.ttsVoice ||
        PRACTICE_LANGUAGES[DEFAULT_PRACTICE_LANGUAGE].ttsVoice;

    const response = await getAIClient().models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text.trim() }] }],
        config: {
            // Cast string to Modality to avoid potential enum resolution issues in some environments
            responseModalities: ["AUDIO" as Modality],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];

    if (part?.inlineData?.data) {
        return part.inlineData.data;
    }

    if (part?.text) {
        console.warn("TTS returned text instead of audio:", part.text);
        // Sometimes the model returns text if it refuses the prompt or encounters an error
        throw new Error(`TTS generation failed: ${part.text}`);
    }

    throw new Error("No audio data returned");
};
