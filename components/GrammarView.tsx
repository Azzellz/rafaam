import React, { useState, useEffect } from 'react';
import { GrammarLesson, Language } from '../types';
import { PixelCard } from './PixelUI';
import { translations } from '../i18n';
import { isFavorite, toggleFavorite } from '../services/storageService';
import { TTSButton } from './TTSButton';

interface Props {
  data: GrammarLesson;
  language: Language;
}

export const GrammarView: React.FC<Props> = ({ data, language }) => {
  const t = translations[language];
  const [favoritesState, setFavoritesState] = useState<boolean[]>([]);

  useEffect(() => {
    const initialState = data.points.map(point => isFavorite(point.pattern));
    setFavoritesState(initialState);
  }, [data]);

  const handleToggleFavorite = (index: number) => {
    const point = data.points[index];
    const isNowFavorite = toggleFavorite(point);
    
    const newStates = [...favoritesState];
    newStates[index] = isNowFavorite;
    setFavoritesState(newStates);
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-['DotGothic16'] mb-2 text-[#4f46e5] drop-shadow-[2px_2px_0_#000]">
          {data.title}
        </h2>
        <p className="text-xl font-['VT323'] text-gray-600 max-w-2xl mx-auto">{data.introduction}</p>
      </div>

      {data.points.map((point, index) => (
        <PixelCard key={index} title={`${t.point} ${index + 1}`} className="mb-8">
          <div className="absolute top-0 right-0 mt-4 mr-4 flex gap-2">
             <TTSButton text={point.pattern} />
             <button 
               onClick={() => handleToggleFavorite(index)}
               className={`
                 font-['VT323'] text-lg px-3 py-1 border-2 border-black transition-all h-[44px]
                 ${favoritesState[index] 
                    ? 'bg-[#facc15] text-black shadow-[2px_2px_0_0_#000]' 
                    : 'bg-white text-gray-400 hover:bg-gray-100'}
               `}
             >
               {favoritesState[index] ? `★ ${t.saved}` : `☆ ${t.addToFavorites}`}
             </button>
          </div>

          <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300 pr-48">
            <h3 className="text-2xl font-['DotGothic16'] text-[#dc2626] mb-1">
              {point.pattern}
            </h3>
            <p className="text-lg font-bold text-gray-800 font-['VT323'] uppercase tracking-wide">
              {point.meaning}
            </p>
          </div>
          
          <p className="mb-6 text-gray-700 leading-relaxed font-['DotGothic16']">
            {point.explanation}
          </p>

          <div className="bg-[#f0f9ff] border-2 border-[#bae6fd] p-4">
            <h4 className="font-['VT323'] text-[#0ea5e9] mb-3 text-lg uppercase font-bold">{t.examples}</h4>
            <ul className="space-y-4">
              {point.examples.map((ex, i) => (
                <li key={i} className="flex flex-col gap-1 relative pl-2 border-l-4 border-gray-200 hover:border-[#3b82f6] transition-colors group p-2">
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-['DotGothic16'] text-black">{ex.japanese}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <TTSButton text={ex.japanese} size="sm" />
                    </div>
                  </div>
                  <span className="text-sm font-mono text-gray-500">{ex.romaji}</span>
                  <span className="text-md font-['VT323'] text-gray-600 italic">"{ex.translation}"</span>
                </li>
              ))}
            </ul>
          </div>
        </PixelCard>
      ))}
    </div>
  );
};