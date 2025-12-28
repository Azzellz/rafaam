"use client";

/**
 * Sandbox Template Store
 * 沙盒模板状态管理
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SandboxTemplate } from "@/types/sandbox";

interface SandboxTemplateState {
    templates: SandboxTemplate[];

    // CRUD
    addTemplate: (template: Omit<SandboxTemplate, "id">) => string;
    updateTemplate: (id: string, template: Partial<SandboxTemplate>) => void;
    deleteTemplate: (id: string) => void;
    getTemplate: (id: string) => SandboxTemplate | undefined;

    // 导入导出
    importTemplate: (template: SandboxTemplate) => void;
    exportTemplate: (id: string) => string | null;

    // 复制模板
    duplicateTemplate: (id: string) => string | null;
}

const generateId = () =>
    `sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

export const useSandboxTemplateStore = create<SandboxTemplateState>()(
    persist(
        (set, get) => ({
            templates: [],

            addTemplate: (template) => {
                const id = generateId();
                const newTemplate: SandboxTemplate = {
                    ...template,
                    id,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                set((state) => ({
                    templates: [...state.templates, newTemplate],
                }));
                return id;
            },

            updateTemplate: (id, template) => {
                set((state) => ({
                    templates: state.templates.map((t) =>
                        t.id === id
                            ? { ...t, ...template, updatedAt: Date.now() }
                            : t
                    ),
                }));
            },

            deleteTemplate: (id) => {
                set((state) => ({
                    templates: state.templates.filter((t) => t.id !== id),
                }));
            },

            getTemplate: (id) => {
                return get().templates.find((t) => t.id === id);
            },

            importTemplate: (template) => {
                // 生成新ID避免冲突
                const newTemplate: SandboxTemplate = {
                    ...template,
                    id: generateId(),
                    name: `${template.name} (导入)`,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                set((state) => ({
                    templates: [...state.templates, newTemplate],
                }));
            },

            exportTemplate: (id) => {
                const template = get().templates.find((t) => t.id === id);
                if (!template) return null;
                return JSON.stringify(template, null, 2);
            },

            duplicateTemplate: (id) => {
                const template = get().templates.find((t) => t.id === id);
                if (!template) return null;

                const newId = generateId();
                const newTemplate: SandboxTemplate = {
                    ...template,
                    id: newId,
                    name: `${template.name} (副本)`,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                set((state) => ({
                    templates: [...state.templates, newTemplate],
                }));
                return newId;
            },
        }),
        {
            name: "rafaam-sandbox-templates",
        }
    )
);

