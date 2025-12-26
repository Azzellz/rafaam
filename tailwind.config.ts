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
                vt323: ["VT323", "zpix", "DotGothic16", "NSimSun", "monospace"],
                dot: ["DotGothic16", "zpix", "NSimSun", "sans-serif"],
            },
            boxShadow: {
                pixel: "4px 4px 0 0 rgba(0,0,0,0.8)",
            },
            colors: {
                theme: "var(--theme-color)",
                "theme-hover": "var(--theme-hover)",
                "theme-shadow": "var(--theme-shadow)",
            },
            keyframes: {
                "slide-in-top": {
                    "0%": { transform: "translateY(-100%)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "scale-in": {
                    "0%": { transform: "scale(0.9)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
            animation: {
                "slide-in-top": "slide-in-top 0.3s ease-out forwards",
                "fade-in": "fade-in 0.2s ease-out forwards",
                "scale-in": "scale-in 0.2s ease-out forwards",
            },
        },
    },
    plugins: [],
};

export default config;
