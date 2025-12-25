import React from "react";

interface PixelInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    size?: "sm" | "md" | "lg";
}

export const PixelInput: React.FC<PixelInputProps> = ({
    className = "",
    size = "md",
    ...props
}) => {
    const sizes: Record<string, string> = {
        sm: "text-sm p-1 md:p-2",
        md: "text-base md:text-lg p-2 md:p-3",
        lg: "text-lg md:text-xl p-3 md:p-4",
    };

    return (
        <input
            className={`${sizes[size]} w-full bg-[#f1f5f9] border-2 border-black focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-shadow placeholder-gray-500 ${className}`}
            {...props}
        />
    );
};
