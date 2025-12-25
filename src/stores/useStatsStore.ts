import { create } from "zustand";
import { PracticeRecord } from "@/types";
import {
    getPracticeRecords,
    savePracticeRecord,
    clearPracticeRecords,
} from "@/services/stats";
import { usePlanStore } from "./usePlanStore";

type StatsState = {
    records: PracticeRecord[];
    addRecord: (
        record: Omit<PracticeRecord, "id" | "timestamp">
    ) => Promise<void>;
    clearRecords: () => Promise<void>;
    refreshRecords: () => Promise<void>;
};

export const useStatsStore = create<StatsState>((set) => ({
    records: [],
    addRecord: async (recordData) => {
        const newRecord: PracticeRecord = {
            ...recordData,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        await savePracticeRecord(newRecord);

        // Update plan progress
        await usePlanStore.getState().recordProgress({
            count: 1,
            duration: recordData.duration || 0,
        });

        set((state) => ({ records: [...state.records, newRecord] }));
    },
    clearRecords: async () => {
        await clearPracticeRecords();
        set({ records: [] });
    },
    refreshRecords: async () => {
        const records = await getPracticeRecords();
        set({ records });
    },
}));
