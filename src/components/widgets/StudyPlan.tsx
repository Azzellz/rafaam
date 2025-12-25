import React, { useState } from "react";
import { Language, StudyPlan as StudyPlanType, DailyGoalType } from "@/types";
import { translations } from "@/i18n";
import { usePlanStore } from "@/stores/usePlanStore";
import { PixelButton, PixelInput } from "@/components/pixel";

interface Props {
    language: Language;
}

export const StudyPlan: React.FC<Props> = ({ language }) => {
    const t = translations[language];
    const { plan, updatePlan, getTodayProgress, progress } = usePlanStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editPlan, setEditPlan] = useState<StudyPlanType>(plan);

    const todayProgress = getTodayProgress();

    const handleSave = () => {
        if (editPlan.target <= 0) return;
        updatePlan(editPlan);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditPlan(plan);
        setIsEditing(false);
    };

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split("T")[0]);
        }
        return days;
    };

    if (!plan.enabled && !isEditing) {
        return (
            <div className="border-2 border-gray-200 p-4 mb-6 bg-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold">{t.studyPlan}</h3>
                        <p className="text-gray-500 text-sm">{t.enablePlan}</p>
                    </div>
                    <PixelButton
                        onClick={() => {
                            setEditPlan({ ...plan, enabled: true });
                            setIsEditing(true);
                        }}
                    >
                        {t.setGoal}
                    </PixelButton>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="border-2 border-theme p-4 mb-6 bg-blue-50">
                <h3 className="text-lg font-bold mb-4">{t.setGoal}</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">
                            {t.planType}
                        </label>
                        <div className="flex gap-2">
                            <PixelButton
                                variant={
                                    editPlan.type === "count"
                                        ? "primary"
                                        : "secondary"
                                }
                                onClick={() =>
                                    setEditPlan({ ...editPlan, type: "count" })
                                }
                                className="flex-1"
                            >
                                {t.byCount}
                            </PixelButton>
                            <PixelButton
                                variant={
                                    editPlan.type === "duration"
                                        ? "primary"
                                        : "secondary"
                                }
                                onClick={() =>
                                    setEditPlan({
                                        ...editPlan,
                                        type: "duration",
                                    })
                                }
                                className="flex-1"
                            >
                                {t.byDuration}
                            </PixelButton>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">
                            {t.target} (
                            {editPlan.type === "count" ? t.byCount : t.minutes})
                        </label>
                        <PixelInput
                            value={
                                editPlan.target === 0
                                    ? ""
                                    : editPlan.target.toString()
                            }
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                    setEditPlan({ ...editPlan, target: 0 });
                                    return;
                                }
                                const num = parseInt(val);
                                if (!isNaN(num) && num >= 0) {
                                    setEditPlan({ ...editPlan, target: num });
                                }
                            }}
                            type="number"
                            min="1"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <PixelButton onClick={handleSave} className="flex-1">
                            {t.save}
                        </PixelButton>
                        <PixelButton
                            variant="secondary"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            {t.cancel}
                        </PixelButton>
                    </div>
                </div>
            </div>
        );
    }

    // Display Progress
    const progressValue =
        plan.type === "count"
            ? todayProgress.count
            : Math.floor(todayProgress.duration / 60);
    const targetValue = plan.target;
    const percentage = Math.min(
        100,
        Math.round((progressValue / targetValue) * 100)
    );
    const isCompleted = todayProgress.isCompleted;

    return (
        <div className="border-2 border-black p-4 mb-6 bg-white relative overflow-hidden">
            {isCompleted && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1">
                    COMPLETED
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold">{t.todayProgress}</h3>
                    <p className="text-sm text-gray-500">
                        {plan.type === "count" ? t.byCount : t.byDuration}:{" "}
                        {targetValue} {plan.type === "count" ? "" : t.minutes}
                    </p>
                </div>
                <PixelButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                >
                    {t.edit}
                </PixelButton>
            </div>

            <div className="mb-2">
                <div className="flex justify-between text-sm font-bold mb-1">
                    <span>
                        {progressValue} / {targetValue}
                    </span>
                    <span>{percentage}%</span>
                </div>
                <div className="h-4 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${
                            isCompleted ? "bg-green-500" : "bg-theme"
                        }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {isCompleted ? (
                <p className="text-green-600 font-bold text-center mt-2">
                    {t.goalReached}
                </p>
            ) : (
                <p className="text-gray-500 text-center text-sm mt-2">
                    {t.keepGoing}
                </p>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-gray-100">
                {getLast7Days().map((date) => {
                    const dayProgress = progress[date];
                    const isDone = dayProgress?.isCompleted;
                    const isToday =
                        date === new Date().toISOString().split("T")[0];

                    return (
                        <div key={date} className="flex flex-col items-center">
                            <div
                                className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-xs
                                    ${
                                        isDone
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 text-gray-400"
                                    }
                                    ${
                                        isToday
                                            ? "ring-2 ring-theme ring-offset-1"
                                            : ""
                                    }
                                `}
                                title={date}
                            >
                                {isDone ? "✓" : ""}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1">
                                {date.slice(5).replace("-", "/")}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
