/**
 * Storage Service
 * 统一的存储服务导出
 */

// Manager
export { storageManager } from "./manager";

// Config
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

// Background
export { getBackgroundConfig, saveBackgroundConfig } from "./background";

// Adapters (for direct usage if needed)
export {
    IndexedDBAdapter,
    LocalStorageAdapter,
    hasIndexedDBSupport,
    hasLocalStorageSupport,
} from "./adapters";

// Types
export type { IStorage, StorageStrategy } from "./types";
