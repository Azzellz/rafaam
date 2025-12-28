/**
 * Sandbox Component Renderer
 * 沙盒组件统一渲染器
 */

import React from "react";
import {
    SandboxComponent,
    SandboxComponentType,
    TextComponentConfig,
    TextInputComponentConfig,
    ChoiceComponentConfig,
    FillBlankComponentConfig,
    MatchingComponentConfig,
    OrderingComponentConfig,
    AudioComponentConfig,
    DividerComponentConfig,
    GroupComponentConfig,
} from "@/types/sandbox";
import { Language } from "@/types";
import { translations } from "@/i18n";
import { TextRenderer, TextInputRenderer } from "./TextRenderer";
import { ChoiceRenderer } from "./ChoiceRenderer";
import { FillBlankRenderer } from "./FillBlankRenderer";
import { MatchingRenderer } from "./MatchingRenderer";
import { OrderingRenderer } from "./OrderingRenderer";
import { AudioRenderer } from "./AudioRenderer";
import { DividerRenderer } from "./DividerRenderer";
import { GroupRenderer } from "./GroupRenderer";

interface SandboxComponentRendererProps {
    component: SandboxComponent;
    isPreview?: boolean;
    showAnswer?: boolean;
    state?: any;
    onStateChange?: (componentId: string, value: any) => void;
    language: Language;
}

export const SandboxComponentRenderer: React.FC<
    SandboxComponentRendererProps
> = ({
    component,
    isPreview = false,
    showAnswer = false,
    state,
    onStateChange,
    language,
}) => {
    const t = translations[language];
    const handleChange = (value: any) => {
        onStateChange?.(component.id, value);
    };

    switch (component.type) {
        case SandboxComponentType.TEXT:
        case SandboxComponentType.PASSAGE:
        case SandboxComponentType.INSTRUCTION:
            return (
                <TextRenderer
                    config={component as TextComponentConfig}
                    isPreview={isPreview}
                    language={language}
                />
            );

        case SandboxComponentType.TEXT_INPUT:
        case SandboxComponentType.TEXT_AREA:
            return (
                <TextInputRenderer
                    config={component as TextInputComponentConfig}
                    value={state}
                    onChange={handleChange}
                    showAnswer={showAnswer}
                    isPreview={isPreview}
                    language={language}
                />
            );

        case SandboxComponentType.SINGLE_CHOICE:
        case SandboxComponentType.MULTIPLE_CHOICE:
        case SandboxComponentType.TRUE_FALSE:
            return (
                <ChoiceRenderer
                    config={component as ChoiceComponentConfig}
                    selected={state}
                    onSelect={handleChange}
                    showAnswer={showAnswer}
                    isPreview={isPreview}
                    language={language}
                />
            );

        case SandboxComponentType.FILL_BLANK:
        case SandboxComponentType.CLOZE:
            return (
                <FillBlankRenderer
                    config={component as FillBlankComponentConfig}
                    answers={state}
                    onAnswer={(blankId, value) =>
                        handleChange({ ...state, [blankId]: value })
                    }
                    showAnswer={showAnswer}
                    isPreview={isPreview}
                    language={language}
                />
            );

        case SandboxComponentType.MATCHING:
            return (
                <MatchingRenderer
                    config={component as MatchingComponentConfig}
                    matches={state}
                    onMatch={(leftId, rightId) =>
                        handleChange({ ...state, [leftId]: rightId })
                    }
                    showAnswer={showAnswer}
                    isPreview={isPreview}
                    language={language}
                />
            );

        case SandboxComponentType.ORDERING:
            return (
                <OrderingRenderer
                    config={component as OrderingComponentConfig}
                    currentOrder={state}
                    onReorder={handleChange}
                    showAnswer={showAnswer}
                    isPreview={isPreview}
                    language={language}
                />
            );

        case SandboxComponentType.AUDIO:
            return (
                <AudioRenderer
                    config={component as AudioComponentConfig}
                    isPreview={isPreview}
                    language={language}
                />
            );

        case SandboxComponentType.DIVIDER:
            return (
                <DividerRenderer config={component as DividerComponentConfig} />
            );

        case SandboxComponentType.GROUP:
            return (
                <GroupRenderer
                    config={component as GroupComponentConfig}
                    isPreview={isPreview}
                    language={language}
                    renderComponent={(child) => (
                        <SandboxComponentRenderer
                            component={child}
                            isPreview={isPreview}
                            showAnswer={showAnswer}
                            state={state?.[child.id]}
                            onStateChange={(id, value) =>
                                handleChange({ ...state, [id]: value })
                            }
                            language={language}
                        />
                    )}
                />
            );

        default:
            return <div className="text-red-500">{t.unknownComponent}</div>;
    }
};
