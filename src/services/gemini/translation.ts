import { getAIConfig } from "../storageService";
import { getAIClient } from "./client";

export const translateText = async (
    text: string,
    targetLanguage: string
): Promise<string> => {
    const aiConfig = getAIConfig();
    const model = aiConfig.defaultModel;
    const prompt = `Translate the following text into ${targetLanguage}. Only return the translation, no explanations.
    
    Text: "${text}"`;

    const response = await getAIClient().models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text?.trim() || "";
};
