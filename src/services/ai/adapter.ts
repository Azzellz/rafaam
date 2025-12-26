/**
 * AI Client 适配器
 * 提供向后兼容的接口，同时使用新的 Provider 架构
 */

import { getProviderForType } from "./providers";
import { GeminiProvider } from "./providers/gemini";

/**
 * 获取 AI 客户端（向后兼容）
 * @deprecated 推荐使用 getProviderForType() 获取通用 Provider
 */
export const getAIClient = async () => {
    const provider = await getProviderForType("text");

    // 如果是 Gemini Provider，返回原生客户端
    if (provider instanceof GeminiProvider) {
        return provider.getNativeClient();
    }

    // 对于其他 Provider，返回一个兼容对象
    throw new Error(
        "getAIClient() only supports Gemini. Use getProviderForType() for other providers."
    );
};
