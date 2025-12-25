import React, { useEffect } from "react";
import { useToastStore, Toast, ToastType } from "@/stores/useToastStore";

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
    toast,
    onRemove,
}) => {
    const { id, message, type } = toast;

    const variants: Record<ToastType, string> = {
        info: "bg-blue-100 border-blue-500 text-blue-900",
        success: "bg-green-100 border-green-500 text-green-900",
        warning: "bg-yellow-100 border-yellow-500 text-yellow-900",
        error: "bg-red-100 border-red-500 text-red-900",
    };

    const iconMap: Record<ToastType, string> = {
        info: "ℹ️",
        success: "✅",
        warning: "⚠️",
        error: "❌",
    };

    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 min-w-[300px] max-w-md
                border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]
                animate-slide-in-top transition-all duration-300
                ${variants[type]}
            `}
            role="alert"
        >
            <span className="text-xl">{iconMap[type]}</span>
            <p className="flex-1 font-medium text-sm md:text-base">{message}</p>
            <button
                onClick={() => onRemove(id)}
                className="ml-2 text-xl font-bold hover:opacity-70 leading-none"
            >
                ×
            </button>
        </div>
    );
};

export const PixelToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
};
