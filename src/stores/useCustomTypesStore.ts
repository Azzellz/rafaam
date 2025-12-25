import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CustomTypeDefinition } from "@/types";

interface CustomTypesState {
    customTypes: CustomTypeDefinition[];
    addCustomType: (type: Omit<CustomTypeDefinition, "id">) => void;
    updateCustomType: (id: string, type: Partial<CustomTypeDefinition>) => void;
    deleteCustomType: (id: string) => void;
    getCustomType: (id: string) => CustomTypeDefinition | undefined;
}

export const useCustomTypesStore = create<CustomTypesState>()(
    persist(
        (set, get) => ({
            customTypes: [],
            addCustomType: (type) =>
                set((state) => ({
                    customTypes: [
                        ...state.customTypes,
                        {
                            ...type,
                            id: Math.random().toString(36).substring(2, 9),
                        },
                    ],
                })),
            updateCustomType: (id, type) =>
                set((state) => ({
                    customTypes: state.customTypes.map((t) =>
                        t.id === id ? { ...t, ...type } : t
                    ),
                })),
            deleteCustomType: (id) =>
                set((state) => ({
                    customTypes: state.customTypes.filter((t) => t.id !== id),
                })),
            getCustomType: (id) => get().customTypes.find((t) => t.id === id),
        }),
        {
            name: "custom-types-storage",
        }
    )
);
