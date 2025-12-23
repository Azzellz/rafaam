import { create } from "zustand";
import {
    BackgroundConfig,
    ContentType,
    GeneratedContent,
    JLPTLevel,
    Language,
} from "../types";

export enum ViewMode {
    GENERATOR = "GENERATOR",
    FAVORITES = "FAVORITES",
}

type AppState = {
    viewMode: ViewMode;
    topic: string;
    level: JLPTLevel;
    contentType: ContentType;
    language: Language;
    loading: boolean;
    content: GeneratedContent | null;
    error: string | null;
    bgConfig: BackgroundConfig;
    showSettings: boolean;
    setViewMode: (viewMode: ViewMode) => void;
    setTopic: (topic: string) => void;
    setLevel: (level: JLPTLevel) => void;
    setContentType: (contentType: ContentType) => void;
    setLanguage: (language: Language) => void;
    setLoading: (loading: boolean) => void;
    setContent: (content: GeneratedContent | null) => void;
    setError: (error: string | null) => void;
    setBgConfig: (config: BackgroundConfig) => void;
    setShowSettings: (show: boolean) => void;
    resetQuestState: () => void;
};

export const useAppStore = create<AppState>((set) => ({
    viewMode: ViewMode.GENERATOR,
    topic: "",
    level: JLPTLevel.N5,
    contentType: ContentType.GRAMMAR,
    language: Language.EN,
    loading: false,
    content: null,
    error: null,
    bgConfig: { imageData: null, blur: 0, overlayOpacity: 0.5 },
    showSettings: false,
    setViewMode: (viewMode) => set({ viewMode }),
    setTopic: (topic) => set({ topic }),
    setLevel: (level) => set({ level }),
    setContentType: (contentType) => set({ contentType }),
    setLanguage: (language) => set({ language }),
    setLoading: (loading) => set({ loading }),
    setContent: (content) => set({ content }),
    setError: (error) => set({ error }),
    setBgConfig: (config) => set({ bgConfig: config }),
    setShowSettings: (show) => set({ showSettings: show }),
    resetQuestState: () => set({ content: null, topic: "", error: null }),
}));
