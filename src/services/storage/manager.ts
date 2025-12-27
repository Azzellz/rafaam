/**
 * Storage Manager
 * 统一的存储管理器，支持 IndexedDB 和 localStorage 自动降级
 */

import { IStorage, StorageStrategy } from "./types";
import {
    IndexedDBAdapter,
    LocalStorageAdapter,
    hasIndexedDBSupport,
} from "./adapters";

class StorageManager implements IStorage {
    public strategy: StorageStrategy = "indexedDB";
    private adapter: IStorage;
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    constructor() {
        // 默认使用 localStorage 作为初始适配器
        this.adapter = new LocalStorageAdapter();
    }

    /**
     * 初始化存储管理器
     * 自动检测并选择最佳存储策略
     */
    private async initialize(): Promise<void> {
        if (this.initialized) return;

        // 防止并发初始化
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this.doInitialize();
        return this.initPromise;
    }

    private async doInitialize(): Promise<void> {
        if (!hasIndexedDBSupport()) {
            console.warn(
                "[Storage] IndexedDB unavailable, using localStorage"
            );
            this.strategy = "localStorage";
            this.adapter = new LocalStorageAdapter();
            this.initialized = true;
            return;
        }

        try {
            // 测试 IndexedDB 是否真正可用
            const testAdapter = new IndexedDBAdapter();
            await testAdapter.set("__test__", "test");
            await testAdapter.remove("__test__");

            this.strategy = "indexedDB";
            this.adapter = testAdapter;
        } catch (error) {
            console.warn(
                "[Storage] IndexedDB init failed, falling back to localStorage",
                error
            );
            this.strategy = "localStorage";
            this.adapter = new LocalStorageAdapter();
        }

        this.initialized = true;
    }

    /**
     * 降级到 localStorage
     */
    private fallbackToLocalStorage(): void {
        console.warn("[Storage] Falling back to localStorage");
        this.strategy = "localStorage";
        this.adapter = new LocalStorageAdapter();
    }

    async get<T>(key: string): Promise<T | null> {
        await this.initialize();

        try {
            return await this.adapter.get<T>(key);
        } catch (error) {
            console.error(`[Storage] Failed to get "${key}"`, error);

            if (this.strategy === "indexedDB") {
                this.fallbackToLocalStorage();
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
            console.error(`[Storage] Failed to set "${key}"`, error);

            if (this.strategy === "indexedDB") {
                this.fallbackToLocalStorage();
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
            console.error(`[Storage] Failed to remove "${key}"`, error);
        }
    }

    async clear(): Promise<void> {
        await this.initialize();

        try {
            await this.adapter.clear();
        } catch (error) {
            console.error("[Storage] Failed to clear", error);
        }
    }

    /**
     * 获取当前存储策略
     */
    getStrategy(): StorageStrategy {
        return this.strategy;
    }

    /**
     * 检查是否已初始化
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

export const storageManager = new StorageManager();
