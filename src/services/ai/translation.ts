import { getAIConfig } from "../storage";
import { getProviderForType } from "./providers";

export const translateText = async (
    text: string,
    targetLanguage: string
): Promise<string> => {
    const provider = await getProviderForType("text");
    return await provider.translate(text, targetLanguage);
};
