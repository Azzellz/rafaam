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
