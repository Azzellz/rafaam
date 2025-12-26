# Edge TTS 工具使用说明

## 概述

Edge TTS 工具封装了 Microsoft Edge 的文本转语音功能，提供了简单易用的 API 来生成语音音频。

## 功能特点

-   支持多种语言和语音
-   可调节语速、音调、音量
-   提供 Web Speech API 作为后备方案
-   TypeScript 类型支持

## 安装依赖

Edge TTS 需要一个后端服务来处理请求。你可以：

1. 使用公开的 Edge TTS API 服务
2. 自己部署 Edge TTS 服务（推荐使用 [edge-tts-api](https://github.com/travisvn/edge-tts-api)）

### 自建服务（推荐）

```bash
# 使用 Docker 部署
docker run -d -p 5000:5000 travisvn/edge-tts-api

# 或者使用 npm
npm install -g edge-tts-api
edge-tts-api
```

## 使用方法

### 基础用法

```typescript
import { generateEdgeTTS, EDGE_VOICES } from "@/utils/edgeTTS";
import { playAudioData } from "@/utils/audio";

// 生成英语女声
const audioData = await generateEdgeTTS("Hello, world!", {
    voice: EDGE_VOICES.enUS_Female,
});

// 播放音频
await playAudioData(audioData);
```

### 调整语音参数

```typescript
// 快速、高音调、大音量
const audioData = await generateEdgeTTS("こんにちは", {
    voice: EDGE_VOICES.jaJP_Female,
    rate: "+50%", // 加快 50%
    pitch: "+10Hz", // 提高 10Hz
    volume: "+20%", // 增大 20%
});
```

### 支持的语音

```typescript
// 英语
EDGE_VOICES.enUS_Female; // 美式英语女声
EDGE_VOICES.enUS_Male; // 美式英语男声
EDGE_VOICES.enGB_Female; // 英式英语女声
EDGE_VOICES.enGB_Male; // 英式英语男声

// 日语
EDGE_VOICES.jaJP_Female; // 日语女声
EDGE_VOICES.jaJP_Male; // 日语男声

// 中文
EDGE_VOICES.zhCN_Female; // 简体中文女声
EDGE_VOICES.zhCN_Male; // 简体中文男声
EDGE_VOICES.zhTW_Female; // 繁体中文女声
EDGE_VOICES.zhTW_Male; // 繁体中文男声

// 韩语、法语、德语、西班牙语等
```

### 使用 Web Speech API（后备方案）

```typescript
import { generateSpeechWithWebAPI } from "@/utils/edgeTTS";

// 使用浏览器内置的 TTS
await generateSpeechWithWebAPI("Hello!", {
    lang: "en-US",
    rate: 1.2, // 1.0 为正常速度
    pitch: 1.0, // 1.0 为正常音调
    volume: 1.0, // 1.0 为最大音量
});
```

### 获取可用语音列表

```typescript
import { getAvailableVoices } from "@/utils/edgeTTS";

const voices = await getAvailableVoices();
console.log(
    voices.map((v) => ({
        name: v.name,
        lang: v.lang,
    }))
);
```

## 配置 API URL

在 `src/utils/edgeTTS.ts` 中修改 `getEdgeTTSApiUrl` 函数：

```typescript
async function getEdgeTTSApiUrl(): Promise<string> {
    // 从配置中读取或使用默认值
    return "http://localhost:5000/api/tts";
}
```

或者集成到项目的配置系统中：

```typescript
import { storageManager } from "@/services/storage";

async function getEdgeTTSApiUrl(): Promise<string> {
    const url = await storageManager.get<string>("edge_tts_api_url");
    return url || "http://localhost:5000/api/tts";
}
```

## 在组件中使用

```typescript
import React, { useState } from "react";
import { generateEdgeTTS, EDGE_VOICES } from "@/utils/edgeTTS";
import { playAudioData } from "@/utils/audio";

export const TTSExample: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleSpeak = async () => {
        setIsPlaying(true);
        try {
            const audioData = await generateEdgeTTS("Hello, world!", {
                voice: EDGE_VOICES.enUS_Female,
            });
            await playAudioData(audioData);
        } catch (error) {
            console.error("TTS Error:", error);
        } finally {
            setIsPlaying(false);
        }
    };

    return (
        <button onClick={handleSpeak} disabled={isPlaying}>
            {isPlaying ? "Playing..." : "Speak"}
        </button>
    );
};
```

## 性能优化建议

1. **缓存音频数据**：相同文本的音频可以缓存避免重复生成
2. **预加载**：提前生成常用文本的音频
3. **错误处理**：提供 Web Speech API 作为降级方案

```typescript
async function generateSpeechWithFallback(
    text: string,
    options: EdgeTTSOptions = {}
) {
    try {
        // 尝试使用 Edge TTS
        return await generateEdgeTTS(text, options);
    } catch (error) {
        console.warn("Edge TTS failed, falling back to Web Speech API", error);
        // 降级到浏览器内置 TTS
        await generateSpeechWithWebAPI(text, {
            lang: getLanguageFromVoice(options.voice),
        });
        return null;
    }
}
```

## API 参考

### `generateEdgeTTS(text, options)`

生成语音音频。

**参数：**

-   `text: string` - 要转换的文本
-   `options: EdgeTTSOptions` - 可选配置
    -   `voice?: string` - 语音名称（默认：en-US-JennyNeural）
    -   `rate?: string` - 语速（-50% 到 +50%）
    -   `pitch?: string` - 音调（-50Hz 到 +50Hz）
    -   `volume?: string` - 音量（0% 到 100%）

**返回：** `Promise<string>` - base64 编码的音频数据

### `generateSpeechWithWebAPI(text, options)`

使用浏览器内置 TTS。

**参数：**

-   `text: string` - 要转换的文本
-   `options: object` - 可选配置
    -   `lang?: string` - 语言代码
    -   `rate?: number` - 语速（0.1 到 10）
    -   `pitch?: number` - 音调（0 到 2）
    -   `volume?: number` - 音量（0 到 1）

**返回：** `Promise<void>` - 直接播放，不返回音频数据

### `getAvailableVoices()`

获取浏览器支持的语音列表。

**返回：** `Promise<SpeechSynthesisVoice[]>` - 可用语音列表

## 故障排除

### Edge TTS API 无法连接

1. 检查 API 服务是否正常运行
2. 检查 URL 配置是否正确
3. 检查网络连接和防火墙设置

### 音频播放失败

1. 确保浏览器支持音频播放
2. 检查返回的音频格式是否正确
3. 查看浏览器控制台错误信息

### Web Speech API 不工作

1. 检查浏览器兼容性（Chrome、Edge、Safari 支持较好）
2. 确保网站使用 HTTPS（某些浏览器要求）
3. 检查浏览器权限设置
