import React, { useEffect, useState } from "react";
import { Language } from "@/types";
import { translations } from "@/i18n";
import { PixelButton } from "@/components/pixel";

interface Props {
    language: Language;
}

interface StorageItem {
    key: string;
    label: string;
    size: number;
    type: "localStorage" | "indexedDB";
}

export const StorageSettings: React.FC<Props> = ({ language }) => {
    const t = translations[language];
    const [usage, setUsage] = useState<StorageItem[]>([]);
    const [totalUsage, setTotalUsage] = useState<number>(0);
    const [quota, setQuota] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateStorage();
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return `0 ${t.bytes}`;
        const k = 1024;
        const sizes = [t.bytes, t.kb, t.mb, "GB", "TB"];
        const i = Math.min(
            Math.floor(Math.log(bytes) / Math.log(k)),
            sizes.length - 1
        );
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const calculateStorage = async () => {
        setLoading(true);
        let items: StorageItem[] = [];
        let total = 0;

        // LocalStorage
        if (typeof window !== "undefined" && window.localStorage) {
            let lsTotal = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("rafaam_")) {
                    const value = localStorage.getItem(key) || "";
                    const size = new Blob([value]).size;
                    lsTotal += size;

                    let label = key;
                    if (key === "rafaam_background_config") {
                        label = t.bgSettings;
                    } else if (key.startsWith("rafaam_favorites_")) {
                        label = `${t.myFavorites} (${key.replace(
                            "rafaam_favorites_",
                            ""
                        )})`;
                    } else if (key === "rafaam_ai_config") {
                        label = "AI Settings";
                    } else if (key === "rafaam_api_base_url") {
                        label = "API Base URL";
                    } else if (key === "rafaam_practice_stats") {
                        label = "Practice Statistics";
                    } else if (key === "rafaam_study_plan") {
                        label = "Study Plan";
                    } else if (key === "rafaam_daily_progress") {
                        label = "Daily Progress";
                    }

                    items.push({
                        key,
                        label,
                        size,
                        type: "localStorage",
                    });
                }
            }
            total += lsTotal;
        }

        // IndexedDB Estimate
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                if (estimate.usage) {
                    setQuota(estimate.quota || null);

                    items.push({
                        key: "indexedDB_storage",
                        label: "IndexedDB (Storage)",
                        size: estimate.usage,
                        type: "indexedDB",
                    });

                    items.push({
                        key: "indexedDB_favorites",
                        label: "IndexedDB (Favorites)",
                        size: 0, // Will be included in estimate.usage
                        type: "indexedDB",
                    });
                }
            } catch (e) {
                console.error("Storage estimate failed", e);
            }
        }

        setUsage(items);
        setTotalUsage(total);
        setLoading(false);
    };

    const clearItem = (item: StorageItem) => {
        if (confirm(t.confirmClear)) {
            if (item.type === "localStorage") {
                localStorage.removeItem(item.key);
            } else if (item.type === "indexedDB") {
                if (window.indexedDB) {
                    if (item.key === "indexedDB_storage") {
                        window.indexedDB.deleteDatabase("rafaam_storage");
                    } else if (item.key === "indexedDB_favorites") {
                        window.indexedDB.deleteDatabase("rafaam_client_store");
                    }
                }
            }
            setTimeout(calculateStorage, 500);
        }
    };

    const clearAll = async () => {
        if (confirm(t.confirmClear)) {
            // Clear LocalStorage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("rafaam_")) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((k) => localStorage.removeItem(k));

            // Clear IndexedDB - both databases
            if (window.indexedDB) {
                window.indexedDB.deleteDatabase("rafaam_storage");
                window.indexedDB.deleteDatabase("rafaam_client_store");
            }

            calculateStorage();
            alert(t.cleared);
            window.location.reload(); // Reload to reset state
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl mb-4">{t.storageUsage}</h3>
                {loading ? (
                    <p>{t.calculating}</p>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 border-2 border-black">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-bold">
                                    {t.total} (LocalStorage)
                                </span>
                                <span className="text-xl text-theme">
                                    {formatBytes(totalUsage)}
                                </span>
                            </div>
                            {quota && (
                                <p className="text-sm text-gray-500">
                                    {t.systemQuota}: {formatBytes(quota)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            {usage.length === 0 && (
                                <p className="text-gray-500 italic">
                                    No data found.
                                </p>
                            )}
                            {usage.map((item) => (
                                <div
                                    key={item.key}
                                    className="flex justify-between items-center p-3 bg-white border border-gray-200"
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="font-bold truncate">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono truncate">
                                            {item.key}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <span className="text-gray-600">
                                            {formatBytes(item.size)}
                                        </span>
                                        {item.size > 0 && (
                                            <button
                                                onClick={() => clearItem(item)}
                                                className="text-red-500 hover:text-red-700 hover:underline text-sm"
                                            >
                                                {t.clearStorage}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t-2 border-dashed border-gray-300">
                <PixelButton
                    onClick={clearAll}
                    variant="danger"
                    className="w-full md:w-auto"
                >
                    {t.clearAll}
                </PixelButton>
                <p className="my-4 text-gray-600">
                    This will remove all favorites, settings, and cached data.
                </p>
            </div>
        </div>
    );
};
