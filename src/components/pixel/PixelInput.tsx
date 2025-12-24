import React from "react";

export const PixelInput: React.FC<
    React.InputHTMLAttributes<HTMLInputElement>
> = ({ className = "", ...props }) => {
    return (
        <input
            className={`text-base md:text-lg w-full bg-[#f1f5f9] border-2 border-black p-2 md:p-3 focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-shadow placeholder-gray-500 ${className}`}
            {...props}
        />
    );
};
