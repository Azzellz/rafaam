import { Blob } from "@google/genai";

let audioContext: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;

export const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
};

/**
 * 停止当前正在播放的音频
 */
export const stopAudio = () => {
    if (currentAudioSource) {
        try {
            currentAudioSource.stop();
            currentAudioSource.disconnect();
        } catch (error) {
            // 如果音频已经停止，忽略错误
        }
        currentAudioSource = null;
    }
};

/**
 * 播放 MP3 格式的音频数据（用于 Edge TTS）
 * @param base64String base64 编码的 MP3 音频数据
 */
export const playMP3Audio = async (base64String: string): Promise<void> => {
    // 停止之前的音频
    stopAudio();

    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
        await ctx.resume();
    }

    // 将 base64 转换为 ArrayBuffer
    const bytes = decodeBase64(base64String);

    // 使用 decodeAudioData 解码 MP3 格式
    const arrayBuffer = bytes.buffer.slice(0) as ArrayBuffer;
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // 创建音频源并播放
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    currentAudioSource = source;

    return new Promise<void>((resolve, reject) => {
        source.onended = () => {
            if (currentAudioSource === source) {
                currentAudioSource = null;
            }
            resolve();
        };

        try {
            source.start();
        } catch (error) {
            currentAudioSource = null;
            reject(error);
        }
    });
};

export const playAudioData = async (base64String: string): Promise<void> => {
    // 停止之前的音频
    stopAudio();

    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
        await ctx.resume();
    }

    // Decode Base64 to binary
    const bytes = decodeBase64(base64String);

    // Convert raw PCM 16-bit to AudioBuffer
    // Gemini TTS returns raw PCM (no header), 24kHz, Mono
    const dataInt16 = new Int16Array(bytes.buffer);
    const numChannels = 1;
    const sampleRate = 24000;

    const buffer = ctx.createBuffer(numChannels, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Normalize 16-bit integer to float [-1.0, 1.0]
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    currentAudioSource = source;

    return new Promise<void>((resolve, reject) => {
        source.onended = () => {
            if (currentAudioSource === source) {
                currentAudioSource = null;
            }
            resolve();
        };

        try {
            source.start();
        } catch (error) {
            currentAudioSource = null;
            reject(error);
        }
    });
};

// --- Helpers for Live API ---

// Decodes a base64 string to a Uint8Array
export function decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Encodes a Uint8Array to a base64 string
export function encodeBase64(bytes: Uint8Array): string {
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Converts Float32 audio data (from Web Audio API) to a PCM blob (Int16) for Gemini
export function createPcmBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Clamp values to [-1, 1] and scale to 16-bit integer
        const s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return {
        data: encodeBase64(new Uint8Array(int16.buffer)),
        mimeType: "audio/pcm;rate=16000",
    };
}

// Decodes raw PCM 16-bit data (from Gemini) to an AudioBuffer
export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}
