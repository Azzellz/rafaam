"use client";

import React, { useEffect, useState } from "react";
import { ContentType, GeneratedContent, Language } from "@/types";
import { generateLesson, generateRandomTopic } from "@/services/ai";
import { handleAIConfigError } from "@/services/ai/configErrorHandler";
import { getBackgroundConfig } from "@/services/storage";
import { LoadingSprite } from "@/components/widgets/LoadingSprite";
import { SettingsView } from "@/components/views/SettingsView";
import { SelectionTool } from "@/components/widgets/SelectionTool";
import { InstallPWA } from "@/components/widgets/InstallPWA";
import { translations } from "@/i18n";
import { useAppStore } from "@/stores/useAppStore";
import { AppBackground } from "@/components/layout/AppBackground";
import { AppHeader } from "@/components/layout/AppHeader";
import { GeneratorIntro } from "@/components/views/GeneratorIntro";
import { QuestResults } from "@/components/views/QuestResults";
import { ErrorBanner } from "@/components/widgets/ErrorBanner";
import dynamic from "next/dynamic";
import { PixelToastContainer, PixelDialog } from "@/components/pixel";
import { showAlert } from "@/stores/useDialogStore";
import { mixColorWithBlack } from "@/utils/color";

const ScrollToTop = dynamic(
    () =>
        import("@/components/widgets/ScrollToTop").then(
            (mod) => mod.ScrollToTop
        ),
    { ssr: false }
);

type View = "home" | "settings";

const MainApp: React.FC = () => {
    const {
        topic,
        setTopic,
        level,
        setLevel,
        practiceLanguage,
        setPracticeLanguage,
        contentType,
        setContentType,
        language,
        setLanguage,
        loading,
        setLoading,
        content,
        setContent,
        error,
        setError,
        bgConfig,
        setBgConfig,
        resetQuestState,
    } = useAppStore();

    const [isRandomizingTopic, setIsRandomizingTopic] = useState(false);
    const [currentView, setCurrentView] = useState<View>("home");

    useEffect(() => {
        const loadBgConfig = async () => {
            const config = await getBackgroundConfig();
            setBgConfig(config);
        };
        loadBgConfig();
    }, [setBgConfig]);

    useEffect(() => {
        if (bgConfig.themeColor) {
            const root = document.documentElement;
            root.style.setProperty("--theme-color", bgConfig.themeColor);
            root.style.setProperty(
                "--theme-hover",
                mixColorWithBlack(bgConfig.themeColor, 0.1)
            );
            root.style.setProperty(
                "--theme-shadow",
                mixColorWithBlack(bgConfig.themeColor, 0.4)
            );
        }
    }, [bgConfig.themeColor]);

    const t = translations[language as keyof typeof translations];

    const startQuest = async (questTopic: string) => {
        if (!questTopic.trim()) return;

        // Special handling for Conversation/Chat: No need to generate beforehand, just switch view
        if (
            contentType === ContentType.CONVERSATION ||
            contentType === ContentType.CHAT
        ) {
            setContent({
                type: contentType,
                data: { topic: questTopic, level, practiceLanguage },
            } as GeneratedContent);
            return;
        }

        setLoading(true);
        setError(null);
        setContent(null);

        try {
            const result = await generateLesson(
                level,
                questTopic,
                contentType,
                language,
                practiceLanguage
            );
            setContent({ type: contentType, data: result } as GeneratedContent);
        } catch (err: any) {
            console.error(err);

            // 检查是否是配置错误，如果是则显示引导dialog
            const isConfigError = handleAIConfigError({
                error: err,
                language,
                onNavigateToSettings: () => {
                    setCurrentView("settings");
                },
            });

            if (!isConfigError) {
                setError(t.connectionError);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRandomTopic = async () => {
        if (isRandomizingTopic) return;
        setIsRandomizingTopic(true);
        try {
            const randomTopic = await generateRandomTopic(
                practiceLanguage,
                language
            );
            setTopic(randomTopic);
            await startQuest(randomTopic);
        } catch (err: any) {
            console.error(err);

            // 检查是否是配置错误
            const isConfigError = handleAIConfigError({
                error: err,
                language,
                onNavigateToSettings: () => {
                    setCurrentView("settings");
                },
            });

            if (!isConfigError) {
                showAlert(t.connectionError, undefined, language);
            }
        } finally {
            setIsRandomizingTopic(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        await startQuest(topic);
    };

    const handleReset = () => {
        resetQuestState();
    };

    const handleLogoClick = () => {
        setCurrentView("home");
    };

    const handleLanguageChange = (nextLanguage: Language) => {
        setLanguage(nextLanguage);
    };

    const handleDismissError = () => {
        setError(null);
    };

    const handleClearContent = () => {
        setContent(null);
    };

    const generatorView = (
        <>
            {error && (
                <ErrorBanner
                    title={t.errorTitle}
                    message={error}
                    dismissLabel={t.errorDismiss}
                    onDismiss={handleDismissError}
                />
            )}

            {!content && !loading && (
                <GeneratorIntro
                    language={language}
                    t={t}
                    topic={topic}
                    level={level}
                    practiceLanguage={practiceLanguage}
                    contentType={contentType}
                    onTopicChange={setTopic}
                    onRandomTopic={handleRandomTopic}
                    randomTopicLoading={isRandomizingTopic}
                    onLevelChange={setLevel}
                    onPracticeLanguageChange={setPracticeLanguage}
                    onContentTypeChange={setContentType}
                    onSubmit={handleGenerate}
                />
            )}

            {loading && <LoadingSprite language={language} />}

            {content && !loading && (
                <QuestResults
                    content={content}
                    language={language}
                    resetLabel={t.newQuest}
                    onReset={handleReset}
                    onClearContent={handleClearContent}
                />
            )}
        </>
    );

    return (
        <div className="min-h-screen pb-20 relative isolate">
            <AppBackground config={bgConfig} />

            <SelectionTool />
            <InstallPWA />

            <AppHeader
                language={language}
                practiceLanguage={practiceLanguage}
                onLogoClick={handleLogoClick}
                onOpenSettings={() => setCurrentView("settings")}
                onLanguageChange={handleLanguageChange}
                t={t}
            />

            <main className="max-w-4xl mx-auto px-3 md:px-4">
                {currentView === "home" && generatorView}
                {currentView === "settings" && (
                    <SettingsView
                        language={language}
                        onBack={() => setCurrentView("home")}
                    />
                )}
            </main>
            <ScrollToTop />
            <PixelToastContainer />
            <PixelDialog />
        </div>
    );
};

export default MainApp;
