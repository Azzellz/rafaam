/**
 * 语音生成服务
 * 封装 TTS 功能，提供便捷的语音生成接口
 */

import { PracticeLanguage } from "../../types";
import {
    PRACTICE_LANGUAGES,
    DEFAULT_PRACTICE_LANGUAGE,
} from "@/constants/practiceLanguages";
import { getProviderForType } from "./providers";
import { GeminiProvider } from "./providers/gemini";

/**
 * 生成语音
 * @param text 要转换的文本
 * @param practiceLanguage 练习语言（用于选择对应的语音）
 * @returns Base64 编码的音频数据
 */
export const generateSpeech = async (
    text: string,
    practiceLanguage: PracticeLanguage = DEFAULT_PRACTICE_LANGUAGE
): Promise<string> => {
    const voiceName =
        PRACTICE_LANGUAGES[practiceLanguage]?.ttsVoice ||
        PRACTICE_LANGUAGES[DEFAULT_PRACTICE_LANGUAGE].ttsVoice;

    const provider = await getProviderForType("tts");
    if (!(provider instanceof GeminiProvider)) {
        throw new Error("TTS requires Gemini provider");
    }

    return await provider.generateSpeech(text, voiceName);
};
