import { getAIConfig } from "../storage";
import { getProviderForType } from "./providers";

export const translateText = async (
    text: string,
    targetLanguage: string
): Promise<string> => {
    const aiConfig = await getAIConfig();
    const model = aiConfig.defaultModel;
    const prompt = `Translate the following text into ${targetLanguage}. Only return the translation, no explanations.
    
    Text: "${text}"`;

    const provider = await getProviderForType("text");
    return await provider.translate(text, targetLanguage, { model });
};
