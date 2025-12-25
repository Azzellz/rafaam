// 存储接口定义
export interface IStorage {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}

export type StorageStrategy = "indexedDB" | "localStorage";
