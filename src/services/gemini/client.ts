import { GoogleGenAI, GoogleGenAIOptions } from "@google/genai";
import { getApiBaseUrl } from "../storageService";

export const getAIClient = () => {
    const baseUrl = getApiBaseUrl();
    const config: GoogleGenAIOptions = { apiKey: process.env.API_KEY };
    if (baseUrl) {
        config.httpOptions = { baseUrl };
    }
    return new GoogleGenAI(config);
};
