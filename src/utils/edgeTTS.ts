/**
 * Edge TTS 工具
 * 封装调用 Microsoft Edge 文本转语音功能
 *
 * 使用方法：
 * 1. 部署 edge-tts API 服务（推荐）: https://github.com/rany2/edge-tts
 * 2. 或使用 Web Speech API 作为后备
 */

export interface EdgeTTSVoice {
    name: string;
    locale: string;
    gender: "Male" | "Female";
    shortName: string;
}

export interface EdgeTTSOptions {
    voice?: string;
    rate?: string; // 语速: -50% 到 +50%, 默认 "+0%"
    pitch?: string; // 音调: -50Hz 到 +50Hz, 默认 "+0Hz"
    volume?: string; // 音量: 0% 到 100%, 默认 "+0%"
    outputFormat?:
        | "audio-24khz-48kbitrate-mono-mp3"
        | "audio-24khz-96kbitrate-mono-mp3"
        | "audio-48khz-96kbitrate-mono-mp3";
    autoDetectLanguage?: boolean; // 是否自动检测语言并选择合适的语音，默认 false
    preferredGender?: "Male" | "Female"; // 自动检测时偏好的性别，默认 Female
}

// 常用的 Edge TTS 语音配置
export const EDGE_VOICES = {
    // 英语
    enUS_Female: "en-US-AvaNeural",
    enUS_Female_Jenny: "en-US-JennyNeural",
    enUS_Male: "en-US-GuyNeural",
    enUS_Male_Andrew: "en-US-AndrewNeural",
    enGB_Female: "en-GB-SoniaNeural",
    enGB_Male: "en-GB-RyanNeural",

    // 日语
    jaJP_Female: "ja-JP-NanamiNeural",
    jaJP_Male: "ja-JP-KeitaNeural",

    // 中文
    zhCN_Female: "zh-CN-XiaoxiaoNeural",
    zhCN_Female_Yunxi: "zh-CN-XiaoyiNeural",
    zhCN_Male: "zh-CN-YunxiNeural",
    zhCN_Male_Yunyang: "zh-CN-YunyangNeural",
    // 韩语
    koKR_Female: "ko-KR-SunHiNeural",
    koKR_Male: "ko-KR-InJoonNeural",

    // 法语
    frFR_Female: "fr-FR-DeniseNeural",
    frFR_Male: "fr-FR-HenriNeural",

    // 德语
    deDE_Female: "de-DE-KatjaNeural",
    deDE_Male: "de-DE-ConradNeural",

    // 西班牙语
    esES_Female: "es-ES-ElviraNeural",
    esES_Male: "es-ES-AlvaroNeural",
} as const;

/**
 * 将文本转换为 SSML 格式
 */
function textToSSML(
    text: string,
    voice: string,
    options: EdgeTTSOptions = {}
): string {
    const rate = options.rate || "+0%";
    const pitch = options.pitch || "+0Hz";
    const volume = options.volume || "+0%";

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
            <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
                ${escapeXML(text)}
            </prosody>
        </voice>
    </speak>`;
}

/**
 * 转义 XML 特殊字符
 */
function escapeXML(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * 生成随机边界字符串
 */
function generateBoundary(): string {
    return "----boundary" + Date.now() + Math.random().toString(36);
}

/**
 * 检测文本的主要语言
 * @param text 要检测的文本
 * @returns 检测到的语言代码
 */
export function detectLanguage(text: string): string {
    // 日语检测（平假名、片假名、日文汉字）
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/;
    if (japanesePattern.test(text)) {
        return "ja-JP";
    }

    // 韩语检测（韩文字符）
    const koreanPattern = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
    if (koreanPattern.test(text)) {
        return "ko-KR";
    }

    // 中文检测（简体/繁体汉字）
    const chinesePattern = /[\u4E00-\u9FFF]/;
    if (chinesePattern.test(text)) {
        // 简单判断繁体还是简体（通过常见字符）
        const traditionalChars =
            /[繁體爲於發開際機經應產業環過無進強當記黨導體]/;
        const simplifiedChars =
            /[简体为于发开际机经应产业环过无进强当记党导体]/;

        if (traditionalChars.test(text) && !simplifiedChars.test(text)) {
            return "zh-TW"; // 繁体中文
        }
        return "zh-CN"; // 简体中文
    }

    // 俄语检测（西里尔字母）
    const russianPattern = /[\u0400-\u04FF]/;
    if (russianPattern.test(text)) {
        return "ru-RU";
    }

    // 阿拉伯语检测
    const arabicPattern = /[\u0600-\u06FF]/;
    if (arabicPattern.test(text)) {
        return "ar-SA";
    }

    // 希腊语检测
    const greekPattern = /[\u0370-\u03FF]/;
    if (greekPattern.test(text)) {
        return "el-GR";
    }

    // 泰语检测
    const thaiPattern = /[\u0E00-\u0E7F]/;
    if (thaiPattern.test(text)) {
        return "th-TH";
    }

    // 德语检测（特殊字符）
    const germanPattern = /[äöüßÄÖÜ]/;
    if (germanPattern.test(text)) {
        return "de-DE";
    }

    // 法语检测（特殊字符）
    const frenchPattern = /[àâçéèêëîïôùûüÿœæÀÂÇÉÈÊËÎÏÔÙÛÜŸŒÆ]/;
    if (frenchPattern.test(text)) {
        return "fr-FR";
    }

    // 西班牙语检测（特殊字符）
    const spanishPattern = /[áéíóúüñÁÉÍÓÚÜÑ¿¡]/;
    if (spanishPattern.test(text)) {
        return "es-ES";
    }

    // 意大利语检测（特殊字符）
    const italianPattern = /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/;
    if (italianPattern.test(text)) {
        return "it-IT";
    }

    // 默认英语
    return "en-US";
}

/**
 * 根据语言代码和性别选择合适的语音
 * @param languageCode 语言代码
 * @param gender 偏好的性别
 * @returns 语音名称
 */
export function selectVoiceByLanguage(
    languageCode: string,
    gender: "Male" | "Female" = "Female"
): string {
    const voiceMap: Record<string, Record<"Male" | "Female", string>> = {
        "en-US": {
            Female: EDGE_VOICES.enUS_Female,
            Male: EDGE_VOICES.enUS_Male,
        },
        "en-GB": {
            Female: EDGE_VOICES.enGB_Female,
            Male: EDGE_VOICES.enGB_Male,
        },
        "ja-JP": {
            Female: EDGE_VOICES.jaJP_Female,
            Male: EDGE_VOICES.jaJP_Male,
        },
        "zh-CN": {
            Female: EDGE_VOICES.zhCN_Female,
            Male: EDGE_VOICES.zhCN_Male,
        },
        "zh-TW": {
            Female: "zh-TW-HsiaoChenNeural",
            Male: "zh-TW-YunJheNeural",
        },
        "ko-KR": {
            Female: EDGE_VOICES.koKR_Female,
            Male: EDGE_VOICES.koKR_Male,
        },
        "fr-FR": {
            Female: EDGE_VOICES.frFR_Female,
            Male: EDGE_VOICES.frFR_Male,
        },
        "de-DE": {
            Female: EDGE_VOICES.deDE_Female,
            Male: EDGE_VOICES.deDE_Male,
        },
        "es-ES": {
            Female: EDGE_VOICES.esES_Female,
            Male: EDGE_VOICES.esES_Male,
        },
        "it-IT": {
            Female: "it-IT-ElsaNeural",
            Male: "it-IT-DiegoNeural",
        },
        "ru-RU": {
            Female: "ru-RU-SvetlanaNeural",
            Male: "ru-RU-DmitryNeural",
        },
        "ar-SA": {
            Female: "ar-SA-ZariyahNeural",
            Male: "ar-SA-HamedNeural",
        },
        "th-TH": {
            Female: "th-TH-PremwadeeNeural",
            Male: "th-TH-NiwatNeural",
        },
    };

    const voices = voiceMap[languageCode];
    if (voices) {
        return voices[gender];
    }

    // 如果没有找到匹配的语言，返回默认英语语音
    return gender === "Female"
        ? EDGE_VOICES.enUS_Female
        : EDGE_VOICES.enUS_Male;
}

/**
 * 使用 Edge TTS 生成语音
 * @param text 要转换的文本
 * @param options TTS 选项
 * @returns 返回音频数据的 base64 字符串
 */
export async function generateEdgeTTS(
    text: string,
    options: EdgeTTSOptions = {}
): Promise<string> {
    if (!text || !text.trim()) {
        throw new Error("Text is empty");
    }

    let voice = options.voice;

    // 如果启用自动语言检测且没有指定语音
    if (!voice && options.autoDetectLanguage !== false) {
        const detectedLanguage = detectLanguage(text.trim());
        const preferredGender = options.preferredGender || "Female";
        voice = selectVoiceByLanguage(detectedLanguage, preferredGender);
        console.log(
            `Auto-detected language: ${detectedLanguage}, selected voice: ${voice}`
        );
    }

    // 如果还是没有语音，使用默认值
    if (!voice) {
        voice = EDGE_VOICES.enUS_Female;
    }

    // 使用公开的 Edge TTS API 服务
    // 这里使用 edge-tts-api 的公开实例或自建服务
    const apiUrl = await getEdgeTTSApiUrl();

    try {
        // 构建请求 URL
        const url = new URL(apiUrl);
        url.searchParams.set("text", text.trim());
        url.searchParams.set("voice", voice);
        if (options.rate) url.searchParams.set("rate", options.rate);
        if (options.pitch) url.searchParams.set("pitch", options.pitch);
        if (options.volume) url.searchParams.set("volume", options.volume);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Edge TTS API error: ${response.statusText}`);
        }

        const audioBlob = await response.blob();
        return await blobToBase64(audioBlob);
    } catch (error) {
        console.error("Edge TTS generation error:", error);
        throw new Error(
            `Failed to generate speech: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

/**
 * 获取 Edge TTS API URL
 * 可以从配置中读取，或使用默认值
 * 支持多个后备 API 服务
 */
async function getEdgeTTSApiUrl(): Promise<string> {
    // 可以从 storage 中读取用户配置的 API URL
    // 这里提供一些公开的 Edge TTS API 服务地址
    // 注意：这些是示例地址，实际使用时需要替换为真实可用的服务

    // 优先级：
    // 1. 用户配置的 URL
    // 2. 本地服务（如果自建）
    // 3. 公开服务

    const defaultUrls = [
        "http://localhost:5000/api/tts", // 本地服务
        "https://tts.example.com/api/tts", // 替换为实际可用的服务
    ];

    return defaultUrls[0];
}

/**
 * 将 Blob 转换为 base64 字符串
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // 去掉 data:audio/mpeg;base64, 前缀
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * 使用浏览器原生 Web Speech API 作为后备方案
 */
export async function generateSpeechWithWebAPI(
    text: string,
    options: {
        lang?: string;
        rate?: number;
        pitch?: number;
        volume?: number;
    } = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!("speechSynthesis" in window)) {
            reject(new Error("Web Speech API is not supported"));
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || "en-US";
        utterance.rate = options.rate ?? 1.0;
        utterance.pitch = options.pitch ?? 1.0;
        utterance.volume = options.volume ?? 1.0;

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event.error);

        window.speechSynthesis.speak(utterance);
    });
}

/**
 * 获取可用的语音列表（使用 Web Speech API）
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                resolve(window.speechSynthesis.getVoices());
            };
        }
    });
}
