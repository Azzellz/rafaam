import { PracticeRecord } from "@/types";
import { storageManager } from "@/services/storage";

const STATS_STORAGE_KEY = "rafaam_practice_stats";

export const getPracticeRecords = async (): Promise<PracticeRecord[]> => {
    try {
        const records = await storageManager.get<PracticeRecord[]>(
            STATS_STORAGE_KEY
        );
        return records || [];
    } catch (error) {
        console.error("Failed to load practice records", error);
        return [];
    }
};

export const savePracticeRecord = async (
    record: PracticeRecord
): Promise<void> => {
    try {
        const records = await getPracticeRecords();
        records.push(record);
        await storageManager.set(STATS_STORAGE_KEY, records);
    } catch (error) {
        console.error("Failed to save practice record", error);
    }
};

export const clearPracticeRecords = async (): Promise<void> => {
    await storageManager.remove(STATS_STORAGE_KEY);
};
