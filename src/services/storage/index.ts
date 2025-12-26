export {
    getApiBaseUrl,
    saveApiBaseUrl,
    getApiKey,
    saveApiKey,
    getAIConfig,
    saveAIConfig,
    getAIProviderConfig,
    saveAIProviderConfig,
} from "./config";
export { getBackgroundConfig, saveBackgroundConfig } from "./background";
export { storageManager } from "./manager";
export type { IStorage, StorageStrategy } from "./types";
