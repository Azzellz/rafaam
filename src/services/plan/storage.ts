import { StudyPlan, DailyProgress } from "@/types";

const PLAN_KEY = "rafaam_study_plan";
const PROGRESS_KEY = "rafaam_daily_progress";

export const getStudyPlan = (): StudyPlan => {
    const stored = localStorage.getItem(PLAN_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        enabled: false,
        type: "count",
        target: 1,
    };
};

export const saveStudyPlan = (plan: StudyPlan) => {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
};

export const getDailyProgress = (): Record<string, DailyProgress> => {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return {};
};

export const saveDailyProgress = (progress: Record<string, DailyProgress>) => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

export const updateDailyProgress = (
    date: string,
    increment: { count?: number; duration?: number },
    plan: StudyPlan
): DailyProgress => {
    const allProgress = getDailyProgress();
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
    saveDailyProgress(allProgress);
    return updated;
};
