import React from "react";
import { PixelModal } from "./PixelModal";
import { PixelButton } from "./PixelButton";

interface PixelInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
    type?: "info" | "success" | "warning" | "error";
}

export const PixelInfoModal: React.FC<PixelInfoModalProps> = ({
    isOpen,
    onClose,
    title = "提示",
    message,
    confirmText = "确定",
    cancelText = "取消",
    onConfirm,
    onCancel,
    showCancel = false,
    type = "info",
}) => {
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onClose();
    };

    return (
        <PixelModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            className="max-w-md"
        >
            <div className="flex flex-col gap-6 p-2">
                <div className="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200">
                    {message}
                </div>
                <div className="flex justify-end gap-4">
                    {showCancel && (
                        <PixelButton onClick={handleCancel} variant="secondary">
                            {cancelText}
                        </PixelButton>
                    )}
                    <PixelButton
                        onClick={handleConfirm}
                        variant={type === "error" ? "danger" : "primary"}
                    >
                        {confirmText}
                    </PixelButton>
                </div>
            </div>
        </PixelModal>
    );
};
