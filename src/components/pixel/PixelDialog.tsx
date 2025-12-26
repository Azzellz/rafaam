import React from "react";
import { useDialogStore } from "@/stores/useDialogStore";
import { PixelButton } from "./PixelButton";

export const PixelDialog: React.FC = () => {
    const { isOpen, config, confirm, cancel } = useDialogStore();

    if (!isOpen || !config) return null;

    const {
        title,
        message,
        confirmText = "OK",
        cancelText = "Cancel",
        showCancel = false,
    } = config;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4 animate-fade-in"
            onClick={showCancel ? cancel : undefined}
        >
            <div
                className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-w-md w-full p-6 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <h3 className="text-2xl font-bold mb-4 border-b-4 border-black pb-2">
                        {title}
                    </h3>
                )}
                <p className="text-lg mb-6 whitespace-pre-wrap">{message}</p>
                <div className="flex gap-3 justify-end">
                    {showCancel && (
                        <PixelButton
                            onClick={cancel}
                            className="bg-gray-300 hover:bg-gray-400"
                        >
                            {cancelText}
                        </PixelButton>
                    )}
                    <PixelButton onClick={confirm}>{confirmText}</PixelButton>
                </div>
            </div>
        </div>
    );
};
