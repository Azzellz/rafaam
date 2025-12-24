import { PracticeRecord } from "@/types";

const STATS_STORAGE_KEY = "rafaam_practice_stats";

export const getPracticeRecords = (): PracticeRecord[] => {
    try {
        const stored = localStorage.getItem(STATS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to load practice records", error);
        return [];
    }
};

export const savePracticeRecord = (record: PracticeRecord): void => {
    try {
        const records = getPracticeRecords();
        records.push(record);
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        console.error("Failed to save practice record", error);
    }
};

export const clearPracticeRecords = (): void => {
    localStorage.removeItem(STATS_STORAGE_KEY);
};
