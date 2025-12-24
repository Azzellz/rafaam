import React from "react";

// Common button styles
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

// Card container
export const PixelCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    title?: string;
}> = ({ children, className = "", title }) => {
    return (
        <div
            className={`bg-white border-2 md:border-4 border-black shadow-[4px_4px_0_0_#cbd5e1] md:shadow-[8px_8px_0_0_#cbd5e1] p-4 md:p-6 relative ${className}`}
        >
            {title && (
                <div className="absolute -top-4 md:-top-5 left-2 md:left-4 bg-[var(--theme-color)] text-white px-3 py-0.5 md:px-4 md:py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">
                    <span className="text-lg md:text-xl uppercase tracking-wider">
                        {title}
                    </span>
                </div>
            )}
            <div className="mb-2"></div>
            {children}
        </div>
    );
};

// Input field
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

// Select field
export interface PixelSelectOption {
    value: string | number;
    label: string;
}

interface PixelSelectProps {
    value: string | number;
    onChange: (value: string) => void;
    options: PixelSelectOption[];
    className?: string;
    placeholder?: string;
}

export const PixelSelect: React.FC<PixelSelectProps> = ({
    value,
    onChange,
    options,
    className = "",
    placeholder = "Select...",
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                className={`text-lg md:text-xl w-full bg-white border-2 border-black p-2 pr-10 cursor-pointer flex items-center justify-between select-none transition-all ${
                    isOpen
                        ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_0_#000]"
                        : "shadow-[4px_4px_0_0_#000] hover:shadow-[4px_4px_0_0_var(--theme-color)]"
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div
                    className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M4 8H20V10H4V8Z" fill="black" />
                        <path d="M6 10H18V12H6V10Z" fill="black" />
                        <path d="M8 12H16V14H8V12Z" fill="black" />
                        <path d="M10 14H14V16H10V14Z" fill="black" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-black shadow-[4px_4px_0_0_#000] max-h-60 overflow-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`text-lg md:text-xl px-4 py-2 cursor-pointer hover:bg-theme hover:text-white transition-colors ${
                                option.value === value ? "bg-[#eff6ff]" : ""
                            }`}
                            onClick={() => {
                                onChange(String(option.value));
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
