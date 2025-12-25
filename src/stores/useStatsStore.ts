import { create } from "zustand";
import { PracticeRecord } from "@/types";
import {
    getPracticeRecords,
    savePracticeRecord,
    clearPracticeRecords,
} from "@/services/statsService";
import { usePlanStore } from "./usePlanStore";

type StatsState = {
    records: PracticeRecord[];
    addRecord: (record: Omit<PracticeRecord, "id" | "timestamp">) => void;
    clearRecords: () => void;
    refreshRecords: () => void;
};

export const useStatsStore = create<StatsState>((set) => ({
    records: getPracticeRecords(),
    addRecord: (recordData) => {
        const newRecord: PracticeRecord = {
            ...recordData,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        savePracticeRecord(newRecord);

        // Update plan progress
        usePlanStore.getState().recordProgress({
            count: 1,
            duration: recordData.duration || 0,
        });

        set((state) => ({ records: [...state.records, newRecord] }));
    },
    clearRecords: () => {
        clearPracticeRecords();
        set({ records: [] });
    },
    refreshRecords: () => {
        set({ records: getPracticeRecords() });
    },
}));
