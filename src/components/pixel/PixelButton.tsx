import React from "react";

export const PixelButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: "primary" | "secondary" | "danger";
    }
> = ({ children, className = "", variant = "primary", ...props }) => {
    const baseStyle =
        "text-lg md:text-xl px-4 md:px-6 py-2 border-2 border-black transition-transform active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-theme text-white shadow-[3px_3px_0_0_var(--theme-shadow)] md:shadow-[4px_4px_0_0_var(--theme-shadow)] hover:bg-theme-hover",
        secondary:
            "bg-[#facc15] text-black shadow-[3px_3px_0_0_#a16207] md:shadow-[4px_4px_0_0_#a16207] hover:bg-[#eab308]",
        danger: "bg-[#ef4444] text-white shadow-[3px_3px_0_0_#991b1b] md:shadow-[4px_4px_0_0_#991b1b] hover:bg-[#dc2626]",
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
