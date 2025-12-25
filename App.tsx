import React, { useEffect, useState } from "react";
import {
    ContentType,
    GeneratedContent,
    Language,
    BackgroundConfig,
    PracticeLanguage,
} from "@/types";
import { generateLesson, generateRandomTopic } from "@/services/ai";
import { getBackgroundConfig, saveBackgroundConfig } from "@/services/storage";
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
import { ScrollToTop } from "@/components/widgets/ScrollToTop";
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

    const location = useLocation();
    const navigate = useNavigate();

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

    const { getCustomType } = useCustomTypesStore();

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
            const customTypeDefinition =
                contentType === ContentType.CUSTOM && customTypeId
                    ? getCustomType(customTypeId)
                    : undefined;

            const result = await generateLesson(
                level,
                questTopic,
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
        } catch (err) {
            console.error(err);
            alert(t.connectionError);
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
                onLogoClick={handleLogoClick}
                onOpenSettings={() => navigate("/settings")}
                onLanguageChange={handleLanguageChange}
                t={t}
            />

            <main className="max-w-4xl mx-auto px-3 md:px-4">
                <Routes>
                    <Route path="/" element={generatorView} />
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
            <ScrollToTop />
            <PixelToastContainer />
        </div>
    );
};

export default App;
