/**
 * Divider Renderer
 * 分隔线组件渲染器
 */

import React from "react";
import { DividerComponentConfig } from "@/types/sandbox";

interface DividerRendererProps {
    config: DividerComponentConfig;
}

export const DividerRenderer: React.FC<DividerRendererProps> = ({ config }) => {
    const styles = {
        solid: "border-solid",
        dashed: "border-dashed",
        dotted: "border-dotted",
    };

    return (
        <hr
            className={`border-t-2 border-gray-300 my-4 ${
                styles[config.style || "dashed"]
            }`}
        />
    );
};
