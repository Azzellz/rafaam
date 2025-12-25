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
    updatePlan: (plan: StudyPlan) => Promise<void>;
    recordProgress: (increment: {
        count?: number;
        duration?: number;
    }) => Promise<void>;
    getTodayProgress: () => DailyProgress;
    refreshData: () => Promise<void>;
};

const defaultPlan: StudyPlan = {
    enabled: false,
    type: "count",
    target: 1,
};

export const usePlanStore = create<PlanState>((set, get) => ({
    plan: defaultPlan,
    progress: {},
    updatePlan: async (newPlan) => {
        await saveStudyPlan(newPlan);
        // Re-evaluate today's completion status with new plan
        const today = new Date().toISOString().split("T")[0];
        await updateDailyProgress(today, {}, newPlan);
        const progress = await getDailyProgress();
        set({ plan: newPlan, progress });
    },
    recordProgress: async (increment) => {
        const today = new Date().toISOString().split("T")[0];
        const { plan } = get();
        await updateDailyProgress(today, increment, plan);
        const progress = await getDailyProgress();
        set({ progress });
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
    refreshData: async () => {
        const plan = await getStudyPlan();
        const progress = await getDailyProgress();
        set({ plan, progress });
    },
}));
