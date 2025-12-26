import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    return {
        server: {
            port: 3333,
            host: "0.0.0.0",
        },
        plugins: [
            react(),
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: ["favicon.svg"],
                manifest: {
                    name: "Rafaam - AI Japanese Learning",
                    short_name: "Rafaam",
                    description:
                        "A pixel-art styled AI Japanese learning platform",
                    theme_color: "#4f46e5",
                    background_color: "#f0f0f0",
                    display: "standalone",
                    orientation: "portrait",
                    start_url: "/",
                    icons: [
                        {
                            src: "favicon.svg",
                            sizes: "any",
                            type: "image/svg+xml",
                            purpose: "any maskable",
                        },
                    ],
                },
                workbox: {
                    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
                },
            }),
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});
