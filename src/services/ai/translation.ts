/**
 * 翻译服务
 */

import { getProviderForType } from "./providers";

/**
 * 翻译文本
 * @param text 要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
export const translateText = async (
    text: string,
    targetLanguage: string
): Promise<string> => {
    const provider = await getProviderForType("text");
    return await provider.translate(text, targetLanguage);
};
