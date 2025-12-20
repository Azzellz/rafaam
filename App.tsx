import React, { useState } from 'react';
import { JLPTLevel, ContentType, GeneratedContent, Language } from './types';
import { generateLesson } from './services/geminiService';
import { PixelButton, PixelCard, PixelInput, PixelSelect } from './components/PixelUI';
import { LoadingSprite } from './components/LoadingSprite';
import { GrammarView } from './components/GrammarView';
import { QuizView } from './components/QuizView';
import { FavoritesView } from './components/FavoritesView';
import { SelectionReader } from './components/SelectionReader';
import { ConversationView } from './components/ConversationView';
import { translations } from './i18n';

enum ViewMode {
  GENERATOR = 'GENERATOR',
  FAVORITES = 'FAVORITES'
}

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GENERATOR);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<JLPTLevel>(JLPTLevel.N5);
  const [contentType, setContentType] = useState<ContentType>(ContentType.GRAMMAR);
  const [language, setLanguage] = useState<Language>(Language.EN);
  
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Special handling for Conversation: No need to generate beforehand, just switch view
    if (contentType === ContentType.CONVERSATION) {
      setContent({ 
        type: ContentType.CONVERSATION, 
        data: { topic, level } 
      });
      return;
    }

    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const result = await generateLesson(level, topic, contentType, language);
      setContent({ type: contentType, data: result } as GeneratedContent);
    } catch (err: any) {
      console.error(err);
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContent(null);
    setTopic('');
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <SelectionReader />
      {/* Header */}
      <header className="bg-[#4f46e5] border-b-4 border-black p-4 mb-10 sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,0.2)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div 
            className="cursor-pointer" 
            onClick={() => setViewMode(ViewMode.GENERATOR)}
          >
            <h1 className="text-2xl md:text-4xl text-white font-['VT323'] tracking-widest drop-shadow-[2px_2px_0_#000]">
              {t.title} <span className="text-[#facc15]">{t.subtitle}</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewMode(viewMode === ViewMode.GENERATOR ? ViewMode.FAVORITES : ViewMode.GENERATOR)}
              className="bg-[#facc15] border-2 border-black p-2 hover:bg-[#eab308] shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none mr-2"
              title={t.myFavorites}
            >
              <span className="text-xl">★</span>
            </button>

            <div className="w-32">
              <PixelSelect 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="text-sm py-1 pl-2 pr-6 h-10"
              >
                <option value={Language.EN}>English</option>
                <option value={Language.ZH_CN}>简体中文</option>
                <option value={Language.ZH_TW}>繁體中文</option>
                <option value={Language.JA}>日本語</option>
              </PixelSelect>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        
        {viewMode === ViewMode.FAVORITES ? (
          <FavoritesView 
            language={language} 
            onBack={() => setViewMode(ViewMode.GENERATOR)} 
          />
        ) : (
          <>
            {/* Intro / Form State */}
            {!content && !loading && (
              <div className="animate-fade-in">
                <div className="text-center mb-12">
                  <p className="text-xl md:text-2xl font-['DotGothic16'] text-gray-700 mb-2">
                    {t.introTitle}
                  </p>
                  <p className="text-gray-500 font-['VT323']">{t.introSubtitle}</p>
                </div>

                <PixelCard title={t.configureQuest}>
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-['VT323'] text-xl mb-2 uppercase font-bold">{t.jlptLevel}</label>
                        <PixelSelect 
                          value={level} 
                          onChange={(e) => setLevel(e.target.value as JLPTLevel)}
                        >
                          {Object.values(JLPTLevel).map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </PixelSelect>
                      </div>
                      <div>
                        <label className="block font-['VT323'] text-xl mb-2 uppercase font-bold">{t.questType}</label>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                          <label className="flex items-center space-x-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="type" 
                              checked={contentType === ContentType.GRAMMAR}
                              onChange={() => setContentType(ContentType.GRAMMAR)}
                              className="hidden"
                            />
                            <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${contentType === ContentType.GRAMMAR ? 'bg-[#3b82f6]' : 'bg-white'}`}>
                               {contentType === ContentType.GRAMMAR && <div className="w-2 h-2 bg-white"></div>}
                            </div>
                            <span className="font-['VT323'] text-xl group-hover:underline">{t.grammarLesson}</span>
                          </label>

                          <label className="flex items-center space-x-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="type" 
                              checked={contentType === ContentType.QUIZ}
                              onChange={() => setContentType(ContentType.QUIZ)}
                              className="hidden"
                            />
                            <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${contentType === ContentType.QUIZ ? 'bg-[#3b82f6]' : 'bg-white'}`}>
                               {contentType === ContentType.QUIZ && <div className="w-2 h-2 bg-white"></div>}
                            </div>
                            <span className="font-['VT323'] text-xl group-hover:underline">{t.quizBattle}</span>
                          </label>

                           <label className="flex items-center space-x-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="type" 
                              checked={contentType === ContentType.CONVERSATION}
                              onChange={() => setContentType(ContentType.CONVERSATION)}
                              className="hidden"
                            />
                            <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${contentType === ContentType.CONVERSATION ? 'bg-[#3b82f6]' : 'bg-white'}`}>
                               {contentType === ContentType.CONVERSATION && <div className="w-2 h-2 bg-white"></div>}
                            </div>
                            <span className="font-['VT323'] text-xl group-hover:underline">{t.voicePractice}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-['VT323'] text-xl mb-2 uppercase font-bold">{t.questTopic}</label>
                      <PixelInput 
                        placeholder={t.topicPlaceholder} 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                      />
                    </div>

                    <div className="pt-4 text-center">
                      <PixelButton type="submit" className="w-full md:w-1/2">
                        {t.startQuest}
                      </PixelButton>
                    </div>
                  </form>
                </PixelCard>
                
                <div className="mt-12 grid grid-cols-3 gap-4 opacity-50 text-center font-['VT323']">
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 bg-gray-300 border-2 border-black mb-2 flex items-center justify-center text-2xl">⚡</div>
                     <span>{t.instantGen}</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 bg-gray-300 border-2 border-black mb-2 flex items-center justify-center text-2xl">🎌</div>
                     <span>{t.nativeExamples}</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 bg-gray-300 border-2 border-black mb-2 flex items-center justify-center text-2xl">⚔️</div>
                     <span>{t.battleQuiz}</span>
                   </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && <LoadingSprite language={language} />}

            {/* Error State */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 shadow-md" role="alert">
                <p className="font-bold font-['VT323']">{t.errorTitle}</p>
                <p>{error}</p>
                <button onClick={() => setError(null)} className="underline mt-2 text-sm">{t.errorDismiss}</button>
              </div>
            )}

            {/* Content Display */}
            {content && !loading && (
              <div className="animate-fade-in-up relative">
                <div className="mb-4 flex justify-end">
                   <PixelButton variant="secondary" onClick={handleReset} className="text-sm px-4 py-1">
                    {t.newQuest}
                   </PixelButton>
                </div>
                {content.type === ContentType.GRAMMAR ? (
                  <GrammarView data={content.data as any} language={language} />
                ) : content.type === ContentType.QUIZ ? (
                  <QuizView 
                    data={content.data as any} 
                    onRestart={() => setContent(null)}
                    language={language}
                  />
                ) : (
                  <ConversationView
                    data={content.data as any}
                    language={language}
                    onExit={() => setContent(null)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;