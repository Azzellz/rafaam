/**
 * Group Renderer
 * 题组组件渲染器
 */

import React from "react";
import { SandboxComponent, GroupComponentConfig } from "@/types/sandbox";
import { Language } from "@/types";
import { translations } from "@/i18n";
import { PixelCard } from "@/components/pixel";

interface GroupRendererProps {
    config: GroupComponentConfig;
    isPreview?: boolean;
    renderComponent: (component: SandboxComponent) => React.ReactNode;
    language: Language;
}

export const GroupRenderer: React.FC<GroupRendererProps> = ({
    config,
    isPreview,
    renderComponent,
    language,
}) => {
    const t = translations[language];
    return (
        <PixelCard className="space-y-4">
            {config.title && (
                <h3 className="text-xl font-bold border-b-2 border-dashed pb-2">
                    {config.title}
                </h3>
            )}
            {config.children.map((child) => (
                <div key={child.id}>{renderComponent(child)}</div>
            ))}
            {isPreview && config.repeatCount && config.repeatCount > 1 && (
                <div className="text-sm text-gray-500 text-center">
                    {t.repeatGenerate.replace(
                        "{n}",
                        String(config.repeatCount)
                    )}
                </div>
            )}
        </PixelCard>
    );
};
