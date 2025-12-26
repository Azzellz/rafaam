/**
 * @deprecated 此文件已被弃用
 * 请使用 providers/factory.ts 中的 getAIProvider()
 * 或使用 adapter.ts 中的 getAIClient() 以保持向后兼容
 */

import { GoogleGenAI, GoogleGenAIOptions } from "@google/genai";
import { getApiBaseUrl, getApiKey } from "../storage";

export const getAIClient = async () => {
    const [baseUrl, apiKey] = await Promise.all([getApiBaseUrl(), getApiKey()]);
    const config: GoogleGenAIOptions = {
        apiKey: apiKey,
    };
    if (baseUrl) {
        config.httpOptions = { baseUrl };
    }
    return new GoogleGenAI(config);
};
