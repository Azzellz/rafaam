import { create } from "zustand";

export interface DialogConfig {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
}

interface DialogState {
    isOpen: boolean;
    config: DialogConfig | null;
    showDialog: (config: DialogConfig) => void;
    closeDialog: () => void;
    confirm: () => void;
    cancel: () => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
    isOpen: false,
    config: null,
    showDialog: (config) => set({ isOpen: true, config }),
    closeDialog: () => set({ isOpen: false, config: null }),
    confirm: () => {
        const { config } = get();
        config?.onConfirm?.();
        get().closeDialog();
    },
    cancel: () => {
        const { config } = get();
        config?.onCancel?.();
        get().closeDialog();
    },
}));

// Helper function for alert-like usage
export const showAlert = (message: string, title?: string) => {
    useDialogStore.getState().showDialog({
        message,
        title,
        confirmText: "OK",
        showCancel: false,
    });
};

// Helper function for confirm dialog
export const showConfirm = (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    title?: string
) => {
    useDialogStore.getState().showDialog({
        message,
        title,
        confirmText: "Confirm",
        cancelText: "Cancel",
        showCancel: true,
        onConfirm,
        onCancel,
    });
};
