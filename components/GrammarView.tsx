import React, { useState, useEffect } from 'react';
import { GrammarLesson, Language, GrammarPoint } from '../types';
import { PixelCard } from './PixelUI';
import { translations } from '../i18n';
import { getFavorites, addFavorite, removeFavorite } from '../services/storageService';
import { TTSButton } from './TTSButton';

interface Props {
  data: GrammarLesson;
  language: Language;
}

export const GrammarView: React.FC<Props> = ({ data, language }) => {
  const t = translations[language];
  // We store the list of favorite patterns to check existence efficiently
  const [favoritePatterns, setFavoritePatterns] = useState<Set<string>>(new Set());
  const [isLoadingFavs, setIsLoadingFavs] = useState(false);

  // Load favorites from API on mount
  useEffect(() => {
    const fetchFavs = async () => {
      setIsLoadingFavs(true);
      const points = await getFavorites();
      const patterns = new Set(points.map((p: GrammarPoint) => p.pattern));
      setFavoritePatterns(patterns);
      setIsLoadingFavs(false);
    };
    fetchFavs();
  }, []);

  const handleToggleFavorite = async (index: number) => {
    const point = data.points[index];
    const isFav = favoritePatterns.has(point.pattern);

    // Optimistic UI update
    const nextSet = new Set(favoritePatterns);
    if (isFav) {
      nextSet.delete(point.pattern);
    } else {
      nextSet.add(point.pattern);
    }
    setFavoritePatterns(nextSet);

    // API Call
    let success = false;
    if (isFav) {
      success = await removeFavorite(point.pattern);
    } else {
      success = await addFavorite(point);
    }

    // Revert if API failed
    if (!success) {
      setFavoritePatterns(prev => {
         const reverted = new Set(prev);
         if (isFav) reverted.add(point.pattern);
         else reverted.delete(point.pattern);
         return reverted;
      });
      alert(t.connectionError);
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-3xl md:text-5xl font-['DotGothic16'] mb-2 text-[#4f46e5] drop-shadow-[2px_2px_0_#000]">
          {data.title}
        </h2>
        <p className="text-lg md:text-xl font-['VT323'] text-gray-600 max-w-2xl mx-auto leading-tight">{data.introduction}</p>
      </div>

      {data.points.map((point, index) => {
        const isFavorite = favoritePatterns.has(point.pattern);
        
        return (
          <PixelCard key={index} title={`${t.point} ${index + 1}`} className="mb-8 mt-6">
            <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b-2 border-dashed border-gray-300">
              <div className="flex-1">
                <h3 className="text-2xl font-['DotGothic16'] text-[#dc2626] mb-1 leading-snug break-words">
                  {point.pattern}
                </h3>
                <p className="text-lg font-bold text-gray-800 font-['VT323'] uppercase tracking-wide">
                  {point.meaning}
                </p>
              </div>

              <div className="flex gap-2 self-end md:self-start w-full md:w-auto justify-end">
                 <TTSButton text={point.pattern} />
                 <button 
                   onClick={() => handleToggleFavorite(index)}
                   disabled={isLoadingFavs}
                   className={`
                     font-['VT323'] text-lg px-3 py-1 border-2 border-black transition-all h-[44px] whitespace-nowrap
                     ${isFavorite 
                        ? 'bg-[#facc15] text-black shadow-[2px_2px_0_0_#000]' 
                        : 'bg-white text-gray-400 hover:bg-gray-100'}
                     ${isLoadingFavs ? 'opacity-50 cursor-wait' : ''}
                   `}
                 >
                   {isFavorite ? `★ ${t.saved}` : `☆ ${t.addToFavorites}`}
                 </button>
              </div>
            </div>
            
            <p className="mb-6 text-gray-700 leading-relaxed font-['DotGothic16'] text-base md:text-lg">
              {point.explanation}
            </p>

            <div className="bg-[#f0f9ff] border-2 border-[#bae6fd] p-3 md:p-4">
              <h4 className="font-['VT323'] text-[#0ea5e9] mb-3 text-lg uppercase font-bold">{t.examples}</h4>
              <ul className="space-y-4">
                {point.examples.map((ex, i) => (
                  <li key={i} className="flex flex-col gap-1 relative pl-2 border-l-4 border-gray-200 hover:border-[#3b82f6] transition-colors group p-1 md:p-2">
                    <div className="flex justify-between items-start">
                      <span className="text-base md:text-lg font-['DotGothic16'] text-black leading-snug">{ex.japanese}</span>
                      <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                        <TTSButton text={ex.japanese} size="sm" />
                      </div>
                    </div>
                    <span className="text-xs md:text-sm font-mono text-gray-500">{ex.romaji}</span>
                    <span className="text-sm md:text-md font-['VT323'] text-gray-600 italic">"{ex.translation}"</span>
                  </li>
                ))}
              </ul>
            </div>
          </PixelCard>
        );
      })}
    </div>
  );
};