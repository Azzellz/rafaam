import React from "react";
import { BackgroundConfig } from "../../types";

type AppBackgroundProps = {
    config: BackgroundConfig;
};

export const AppBackground: React.FC<AppBackgroundProps> = ({ config }) => (
    <>
        <div
            className="fixed inset-0 z-[-1] transition-all duration-300"
            style={{
                backgroundColor: "#f0f0f0",
                backgroundImage: config.imageData
                    ? `url(${config.imageData})`
                    : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: `blur(${config.blur}px)`,
            }}
        />
        <div
            className="fixed inset-0 z-[-1] pointer-events-none transition-all duration-300 bg-white"
            style={{ opacity: config.imageData ? config.overlayOpacity : 0 }}
        />
    </>
);
