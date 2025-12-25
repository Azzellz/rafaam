import { create } from "zustand";
import { StudyPlan, DailyProgress } from "@/types";
import {
    getStudyPlan,
    saveStudyPlan,
    getDailyProgress,
    updateDailyProgress,
} from "@/services/plan";

type PlanState = {
    plan: StudyPlan;
    progress: Record<string, DailyProgress>;
    updatePlan: (plan: StudyPlan) => void;
    recordProgress: (increment: { count?: number; duration?: number }) => void;
    getTodayProgress: () => DailyProgress;
};

export const usePlanStore = create<PlanState>((set, get) => ({
    plan: getStudyPlan(),
    progress: getDailyProgress(),
    updatePlan: (newPlan) => {
        saveStudyPlan(newPlan);
        // Re-evaluate today's completion status with new plan
        const today = new Date().toISOString().split("T")[0];
        updateDailyProgress(today, {}, newPlan);
        set({ plan: newPlan, progress: getDailyProgress() });
    },
    recordProgress: (increment) => {
        const today = new Date().toISOString().split("T")[0];
        const { plan } = get();
        updateDailyProgress(today, increment, plan);
        set({ progress: getDailyProgress() });
    },
    getTodayProgress: () => {
        const today = new Date().toISOString().split("T")[0];
        const { progress } = get();
        return (
            progress[today] || {
                date: today,
                count: 0,
                duration: 0,
                isCompleted: false,
            }
        );
    },
}));
