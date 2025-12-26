/**
 * Edge TTS 自动语言识别使用示例
 */

import {
    generateEdgeTTS,
    detectLanguage,
    selectVoiceByLanguage,
    EDGE_VOICES,
} from "./edgeTTS";
import { playAudioData } from "./audio";

// ============= 示例 1: 自动语言检测（默认启用）=============
export async function example1_AutoDetect() {
    // 日语文本 - 自动检测并使用日语语音
    const audioJa = await generateEdgeTTS("こんにちは、世界！");
    await playAudioData(audioJa);

    // 中文文本 - 自动检测并使用中文语音
    const audioZh = await generateEdgeTTS("你好，世界！");
    await playAudioData(audioZh);

    // 英文文本 - 自动检测并使用英语语音
    const audioEn = await generateEdgeTTS("Hello, world!");
    await playAudioData(audioEn);

    // 韩语文本 - 自动检测并使用韩语语音
    const audioKo = await generateEdgeTTS("안녕하세요!");
    await playAudioData(audioKo);
}

// ============= 示例 2: 指定男声/女声 =============
export async function example2_GenderPreference() {
    // 使用男声
    const audioMale = await generateEdgeTTS("こんにちは", {
        preferredGender: "Male",
    });
    await playAudioData(audioMale);

    // 使用女声（默认）
    const audioFemale = await generateEdgeTTS("こんにちは", {
        preferredGender: "Female",
    });
    await playAudioData(audioFemale);
}

// ============= 示例 3: 手动指定语音（覆盖自动检测）=============
export async function example3_ManualVoice() {
    // 即使是日语文本，也使用英语语音
    const audio = await generateEdgeTTS("こんにちは", {
        voice: EDGE_VOICES.enUS_Female, // 手动指定会覆盖自动检测
    });
    await playAudioData(audio);
}

// ============= 示例 4: 禁用自动检测 =============
export async function example4_DisableAutoDetect() {
    // 禁用自动检测，必须手动指定语音
    const audio = await generateEdgeTTS("こんにちは", {
        autoDetectLanguage: false,
        voice: EDGE_VOICES.jaJP_Female,
    });
    await playAudioData(audio);
}

// ============= 示例 5: 调整语音参数 + 自动检测 =============
export async function example5_WithParameters() {
    const audio = await generateEdgeTTS("你好，世界！这是一段测试文本。", {
        // 自动检测语言（中文）
        rate: "+20%", // 加快 20%
        pitch: "+5Hz", // 提高音调
        volume: "+10%", // 增大音量
        preferredGender: "Male", // 使用男声
    });
    await playAudioData(audio);
}

// ============= 示例 6: 单独使用语言检测功能 =============
export async function example6_DetectOnly() {
    const texts = [
        "Hello, world!",
        "こんにちは",
        "你好",
        "안녕하세요",
        "Bonjour",
        "Hallo",
        "¡Hola!",
        "Привет",
        "مرحبا",
        "สวัสดี",
    ];

    for (const text of texts) {
        const language = detectLanguage(text);
        const voice = selectVoiceByLanguage(language, "Female");
        console.log(
            `Text: "${text}" -> Language: ${language}, Voice: ${voice}`
        );
    }
}

// ============= 示例 7: 多语言混合文本 =============
export async function example7_MixedLanguages() {
    // 混合语言文本会根据主要语言（出现最多的字符）来选择
    const texts = [
        "Hello 世界", // 主要是英文
        "こんにちは world", // 主要是日文
        "你好 hello みなさん", // 主要是中文
    ];

    for (const text of texts) {
        const language = detectLanguage(text);
        console.log(`"${text}" detected as: ${language}`);

        const audio = await generateEdgeTTS(text, {
            autoDetectLanguage: true,
        });
        await playAudioData(audio);
    }
}

// ============= 示例 8: 繁体中文 vs 简体中文 =============
export async function example8_ChineseVariants() {
    // 简体中文
    const audioSimplified = await generateEdgeTTS(
        "我们在学习中文。这是简体字。"
    );
    console.log("Playing simplified Chinese");
    await playAudioData(audioSimplified);

    // 繁体中文
    const audioTraditional = await generateEdgeTTS(
        "我們在學習中文。這是繁體字。"
    );
    console.log("Playing traditional Chinese");
    await playAudioData(audioTraditional);
}

// ============= 示例 9: 批量处理 =============
export async function example9_BatchProcessing() {
    const phrases = [
        { text: "Good morning", lang: "English" },
        { text: "おはようございます", lang: "Japanese" },
        { text: "早上好", lang: "Chinese" },
        { text: "좋은 아침", lang: "Korean" },
        { text: "Bonjour", lang: "French" },
    ];

    for (const phrase of phrases) {
        console.log(`Processing ${phrase.lang}: ${phrase.text}`);
        const detectedLang = detectLanguage(phrase.text);
        const audio = await generateEdgeTTS(phrase.text);
        console.log(`  Detected: ${detectedLang}`);
        // 可以缓存或保存音频数据
    }
}

// ============= 示例 10: 错误处理 =============
export async function example10_ErrorHandling() {
    try {
        // 空文本会抛出错误
        await generateEdgeTTS("");
    } catch (error) {
        console.error("Expected error for empty text:", error);
    }

    try {
        // API 错误处理
        const audio = await generateEdgeTTS("Hello");
        await playAudioData(audio);
    } catch (error) {
        console.error("TTS generation failed:", error);
        // 可以降级到 Web Speech API
        // await generateSpeechWithWebAPI("Hello", { lang: "en-US" });
    }
}
