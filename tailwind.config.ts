import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    safelist: [
        "bg-theme",
        "text-theme",
        "border-theme",
        "bg-theme-hover",
        "hover:bg-theme",
        "hover:border-theme",
        "hover:bg-theme-hover",
        "accent-theme",
        "ring-theme",
        "focus:ring-theme",
    ],
    theme: {
        extend: {
            fontFamily: {
                vt323: ["VT323", "monospace"],
                dot: ["DotGothic16", "sans-serif"],
            },
            boxShadow: {
                pixel: "4px 4px 0 0 rgba(0,0,0,0.8)",
            },
            colors: {
                theme: "var(--theme-color)",
                "theme-hover": "var(--theme-hover)",
                "theme-shadow": "var(--theme-shadow)",
            },
        },
    },
    plugins: [],
};

export default config;
