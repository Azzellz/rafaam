import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                vt323: ["VT323", "monospace"],
                dot: ["DotGothic16", "sans-serif"],
            },
            boxShadow: {
                pixel: "4px 4px 0 0 rgba(0,0,0,0.8)",
            },
        },
    },
    plugins: [],
};

export default config;
