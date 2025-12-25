import { IStorage, StorageStrategy } from "./types";
import { hasIndexedDBSupport, IndexedDBAdapter } from "./indexedDBAdapter";
import { LocalStorageAdapter } from "./localStorageAdapter";

const FALLBACK_LOG =
    "IndexedDB is unavailable; falling back to localStorage for storage.";

class StorageManager {
    public strategy: StorageStrategy = "indexedDB";
    private adapter: IStorage;
    private initialized = false;

    constructor() {
        // 初始化时尝试使用 IndexedDB
        this.adapter = new LocalStorageAdapter(); // 默认先用 localStorage
    }

    private async initialize(): Promise<void> {
        if (this.initialized) return;

        if (!hasIndexedDBSupport()) {
            console.warn(FALLBACK_LOG);
            this.strategy = "localStorage";
            this.adapter = new LocalStorageAdapter();
            this.initialized = true;
            return;
        }

        try {
            // 尝试创建 IndexedDB adapter 并测试
            const testAdapter = new IndexedDBAdapter();
            await testAdapter.set("__test__", "test");
            await testAdapter.remove("__test__");

            this.strategy = "indexedDB";
            this.adapter = testAdapter;
            this.initialized = true;
        } catch (error) {
            console.warn(
                "IndexedDB initialization failed, falling back to localStorage",
                error
            );
            this.strategy = "localStorage";
            this.adapter = new LocalStorageAdapter();
            this.initialized = true;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        await this.initialize();
        try {
            return await this.adapter.get<T>(key);
        } catch (error) {
            console.error(`Failed to get ${key}`, error);
            // 如果 IndexedDB 失败，尝试降级到 localStorage
            if (this.strategy === "indexedDB") {
                console.warn("Falling back to localStorage after error");
                this.strategy = "localStorage";
                this.adapter = new LocalStorageAdapter();
                return await this.adapter.get<T>(key);
            }
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        await this.initialize();
        try {
            await this.adapter.set(key, value);
        } catch (error) {
            console.error(`Failed to set ${key}`, error);
            // 如果 IndexedDB 失败，尝试降级到 localStorage
            if (this.strategy === "indexedDB") {
                console.warn("Falling back to localStorage after error");
                this.strategy = "localStorage";
                this.adapter = new LocalStorageAdapter();
                await this.adapter.set(key, value);
            } else {
                throw error;
            }
        }
    }

    async remove(key: string): Promise<void> {
        await this.initialize();
        try {
            await this.adapter.remove(key);
        } catch (error) {
            console.error(`Failed to remove ${key}`, error);
        }
    }

    async clear(): Promise<void> {
        await this.initialize();
        try {
            await this.adapter.clear();
        } catch (error) {
            console.error("Failed to clear storage", error);
        }
    }
}

export const storageManager = new StorageManager();
