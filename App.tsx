import React, { useEffect, useState } from "react";
import {
    ContentType,
    GeneratedContent,
    Language,
    BackgroundConfig,
    PracticeLanguage,
} from "@/types";
import { generateLesson, generateRandomTopic } from "@/services/geminiService";
import {
    getBackgroundConfig,
    saveBackgroundConfig,
} from "@/services/storageService";
import { LoadingSprite } from "@/components/widgets/LoadingSprite";
import { FavoritesView } from "@/components/views/FavoritesView";
import { SettingsView } from "@/components/views/SettingsView";
import { StatsView } from "@/components/views/StatsView";
import { SelectionTool } from "@/components/widgets/SelectionTool";
import { InstallPWA } from "@/components/widgets/InstallPWA";
import { translations } from "@/i18n";
import { useAppStore } from "@/stores/useAppStore";
import { AppBackground } from "@/components/layout/AppBackground";
import { AppHeader } from "@/components/layout/AppHeader";
import { GeneratorIntro } from "@/components/views/GeneratorIntro";
import { QuestResults } from "@/components/views/QuestResults";
import { ErrorBanner } from "@/components/widgets/ErrorBanner";
import { PixelToastContainer } from "@/components/pixel";
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { CustomView } from "@/components/views/CustomView";
import { useCustomTypesStore } from "@/stores/useCustomTypesStore";
import { mixColorWithBlack } from "@/utils/color";

const App: React.FC = () => {
    const {
        topic,
        setTopic,
        level,
        setLevel,
        practiceLanguage,
        setPracticeLanguage,
        contentType,
        setContentType,
        customTypeId,
        setCustomTypeId,
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
    const [showStats, setShowStats] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const isFavoritesRoute = location.pathname.startsWith("/favorites");

    useEffect(() => {
        setBgConfig(getBackgroundConfig());
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

    const handleRandomTopic = async () => {
        if (isRandomizingTopic) return;
        setIsRandomizingTopic(true);
        try {
            const randomTopic = await generateRandomTopic(
                practiceLanguage,
                language
            );
            setTopic(randomTopic);
        } catch (err) {
            console.error(err);
            alert(t.connectionError);
        } finally {
            setIsRandomizingTopic(false);
        }
    };

    const { getCustomType } = useCustomTypesStore();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        // Special handling for Conversation/Chat: No need to generate beforehand, just switch view
        if (
            contentType === ContentType.CONVERSATION ||
            contentType === ContentType.CHAT
        ) {
            setContent({
                type: contentType,
                data: { topic, level, practiceLanguage },
            } as GeneratedContent);
            return;
        }

        setLoading(true);
        setError(null);
        setContent(null);

        try {
            const customTypeDefinition =
                contentType === ContentType.CUSTOM && customTypeId
                    ? getCustomType(customTypeId)
                    : undefined;

            const result = await generateLesson(
                level,
                topic,
                contentType,
                language,
                practiceLanguage,
                customTypeDefinition
            );
            setContent({ type: contentType, data: result } as GeneratedContent);
        } catch (err: any) {
            console.error(err);
            setError(t.connectionError);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        resetQuestState();
    };

    const handleToggleFavorites = () => {
        navigate(isFavoritesRoute ? "/" : "/favorites");
    };

    const handleLogoClick = () => {
        navigate("/");
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
                isFavoritesActive={isFavoritesRoute}
                onLogoClick={handleLogoClick}
                onToggleFavorites={handleToggleFavorites}
                onOpenSettings={() => navigate("/settings")}
                onOpenStats={() => setShowStats(true)}
                onLanguageChange={handleLanguageChange}
                t={t}
            />

            {showStats && (
                <StatsView
                    language={language}
                    onClose={() => setShowStats(false)}
                />
            )}

            <main className="max-w-4xl mx-auto px-3 md:px-4">
                <Routes>
                    <Route path="/" element={generatorView} />
                    <Route
                        path="/favorites"
                        element={
                            <FavoritesView
                                language={language}
                                practiceLanguage={practiceLanguage}
                                onBack={() => navigate("/")}
                            />
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <SettingsView
                                language={language}
                                onBack={() => navigate("/")}
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <PixelToastContainer />
        </div>
    );
};

export default App;
