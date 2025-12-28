"use client";

import { create } from "zustand";
import {
    BackgroundConfig,
    ContentType,
    GeneratedContent,
    Language,
    PracticeLanguage,
} from "../types";
import {
    DEFAULT_PRACTICE_LANGUAGE,
    getDefaultLevel,
} from "@/constants/practiceLanguages";

const defaultPracticeLanguage = DEFAULT_PRACTICE_LANGUAGE;

type AppState = {
    topic: string;
    level: string;
    practiceLanguage: PracticeLanguage;
    contentType: ContentType;
    language: Language;
    loading: boolean;
    content: GeneratedContent | null;
    error: string | null;
    bgConfig: BackgroundConfig;
    setTopic: (topic: string) => void;
    setLevel: (level: string) => void;
    setPracticeLanguage: (practiceLanguage: PracticeLanguage) => void;
    setContentType: (contentType: ContentType) => void;
    setLanguage: (language: Language) => void;
    setLoading: (loading: boolean) => void;
    setContent: (content: GeneratedContent | null) => void;
    setError: (error: string | null) => void;
    setBgConfig: (config: BackgroundConfig) => void;
    resetQuestState: () => void;
};

export const useAppStore = create<AppState>((set) => ({
    topic: "",
    practiceLanguage: defaultPracticeLanguage,
    level: getDefaultLevel(defaultPracticeLanguage),
    contentType: ContentType.GRAMMAR,

    language: Language.EN,
    loading: false,
    content: null,
    error: null,
    bgConfig: {
        imageData: null,
        blur: 0,
        overlayOpacity: 0.5,
        themeColor: "#4f46e5",
    },
    setTopic: (topic) => set({ topic }),
    setLevel: (level) => set({ level }),
    setPracticeLanguage: (practiceLanguage) =>
        set(() => ({
            practiceLanguage,
            level: getDefaultLevel(practiceLanguage),
            content: null,
        })),
    setContentType: (contentType) => set({ contentType }),
    setLanguage: (language) => set({ language }),
    setLoading: (loading) => set({ loading }),
    setContent: (content) => set({ content }),
    setError: (error) => set({ error }),
    setBgConfig: (config) => set({ bgConfig: config }),
    resetQuestState: () => set({ content: null, topic: "", error: null }),
}));

