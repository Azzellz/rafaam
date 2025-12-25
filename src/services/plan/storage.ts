import { StudyPlan, DailyProgress } from "@/types";
import { storageManager } from "@/services/storage";

const PLAN_KEY = "rafaam_study_plan";
const PROGRESS_KEY = "rafaam_daily_progress";

export const getStudyPlan = async (): Promise<StudyPlan> => {
    const stored = await storageManager.get<StudyPlan>(PLAN_KEY);
    if (stored) {
        return stored;
    }
    return {
        enabled: false,
        type: "count",
        target: 1,
    };
};

export const saveStudyPlan = async (plan: StudyPlan): Promise<void> => {
    await storageManager.set(PLAN_KEY, plan);
};

export const getDailyProgress = async (): Promise<
    Record<string, DailyProgress>
> => {
    const stored = await storageManager.get<Record<string, DailyProgress>>(
        PROGRESS_KEY
    );
    if (stored) {
        return stored;
    }
    return {};
};

export const saveDailyProgress = async (
    progress: Record<string, DailyProgress>
): Promise<void> => {
    await storageManager.set(PROGRESS_KEY, progress);
};

export const updateDailyProgress = async (
    date: string,
    increment: { count?: number; duration?: number },
    plan: StudyPlan
): Promise<DailyProgress> => {
    const allProgress = await getDailyProgress();
    const current = allProgress[date] || {
        date,
        count: 0,
        duration: 0,
        isCompleted: false,
    };

    const updated: DailyProgress = {
        ...current,
        count: current.count + (increment.count || 0),
        duration: current.duration + (increment.duration || 0),
    };

    // Check completion
    if (plan.enabled) {
        if (plan.type === "count") {
            updated.isCompleted = updated.count >= plan.target;
        } else {
            updated.isCompleted = updated.duration >= plan.target * 60; // target is in minutes
        }
    }

    allProgress[date] = updated;
    await saveDailyProgress(allProgress);
    return updated;
};
