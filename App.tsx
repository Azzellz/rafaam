import React, { useEffect } from "react";
import {
    JLPTLevel,
    ContentType,
    GeneratedContent,
    Language,
    BackgroundConfig,
} from "@/types";
import { generateLesson } from "@/services/geminiService";
import {
    getBackgroundConfig,
    saveBackgroundConfig,
} from "@/services/storageService";
import { LoadingSprite } from "@/components/widgets/LoadingSprite";
import { FavoritesView } from "@/components/views/FavoritesView";
import { SelectionReader } from "@/components/widgets/SelectionReader";
import { BackgroundSettings } from "@/components/layout/BackgroundSettings";
import { InstallPWA } from "@/components/widgets/InstallPWA";
import { translations } from "@/components/i18n";
import { useAppStore, ViewMode } from "@/stores/useAppStore";
import { AppBackground } from "@/components/layout/AppBackground";
import { AppHeader } from "@/components/layout/AppHeader";
import { GeneratorIntro } from "@/components/views/GeneratorIntro";
import { QuestResults } from "@/components/views/QuestResults";
import { ErrorBanner } from "@/components/widgets/ErrorBanner";

const App: React.FC = () => {
    const {
        viewMode,
        setViewMode,
        topic,
        setTopic,
        level,
        setLevel,
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
        showSettings,
        setShowSettings,
        resetQuestState,
    } = useAppStore();

    useEffect(() => {
        setBgConfig(getBackgroundConfig());
    }, [setBgConfig]);

    const handleBgConfigChange = (newConfig: BackgroundConfig) => {
        setBgConfig(newConfig);
        saveBackgroundConfig(newConfig);
    };

    const t = translations[language];

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        // Special handling for Conversation: No need to generate beforehand, just switch view
        if (contentType === ContentType.CONVERSATION) {
            setContent({
                type: ContentType.CONVERSATION,
                data: { topic, level },
            });
            return;
        }

        setLoading(true);
        setError(null);
        setContent(null);

        try {
            const result = await generateLesson(
                level,
                topic,
                contentType,
                language
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
        setViewMode(
            viewMode === ViewMode.GENERATOR
                ? ViewMode.FAVORITES
                : ViewMode.GENERATOR
        );
    };

    const handleLogoClick = () => {
        setViewMode(ViewMode.GENERATOR);
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

    const handleShowSettings = (visible: boolean) => {
        setShowSettings(visible);
    };

    const isFavoritesView = viewMode === ViewMode.FAVORITES;

    return (
        <div className="min-h-screen pb-20 relative isolate">
            <AppBackground config={bgConfig} />

            <SelectionReader />
            <InstallPWA />

            {showSettings && (
                <BackgroundSettings
                    language={language}
                    config={bgConfig}
                    onConfigChange={handleBgConfigChange}
                    onClose={() => handleShowSettings(false)}
                />
            )}

            <AppHeader
                language={language}
                viewMode={viewMode}
                onLogoClick={handleLogoClick}
                onToggleFavorites={handleToggleFavorites}
                onOpenSettings={() => handleShowSettings(true)}
                onLanguageChange={handleLanguageChange}
                t={t}
            />

            <main className="max-w-4xl mx-auto px-3 md:px-4">
                {isFavoritesView ? (
                    <FavoritesView
                        language={language}
                        onBack={() => setViewMode(ViewMode.GENERATOR)}
                    />
                ) : (
                    <>
                        {!content && !loading && (
                            <GeneratorIntro
                                t={t}
                                topic={topic}
                                level={level}
                                contentType={contentType}
                                onTopicChange={setTopic}
                                onLevelChange={setLevel}
                                onContentTypeChange={setContentType}
                                onSubmit={handleGenerate}
                            />
                        )}

                        {loading && <LoadingSprite language={language} />}

                        {error && (
                            <ErrorBanner
                                title={t.errorTitle}
                                message={error}
                                dismissLabel={t.errorDismiss}
                                onDismiss={handleDismissError}
                            />
                        )}

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
                )}
            </main>
        </div>
    );
};

export default App;
