import React from "react";

type ErrorBannerProps = {
    title: string;
    message: string;
    dismissLabel: string;
    onDismiss: () => void;
};

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
    title,
    message,
    dismissLabel,
    onDismiss,
}) => (
    <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 shadow-md"
        role="alert"
    >
        <p className="font-bold font-['VT323']">{title}</p>
        <p>{message}</p>
        <button onClick={onDismiss} className="underline mt-2 text-sm">
            {dismissLabel}
        </button>
    </div>
);
