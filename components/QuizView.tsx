import React, { useState } from 'react';
import { QuizSession, Language } from '../types';
import { PixelCard, PixelButton } from './PixelUI';
import { translations } from '../i18n';

interface Props {
  data: QuizSession;
  language: Language;
  onRestart: () => void;
}

export const QuizView: React.FC<Props> = ({ data, language, onRestart }) => {
  const t = translations[language];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const question = data.questions[currentQuestionIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === question.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <PixelCard className="text-center py-12">
        <h2 className="text-4xl font-['VT323'] mb-6">{t.questComplete}</h2>
        <div className="text-6xl mb-6 font-['DotGothic16'] text-[#4f46e5]">
          {score} / {data.questions.length}
        </div>
        <p className="text-xl mb-8 text-gray-600">
          {score === data.questions.length ? t.perfectScore : t.goodEffort}
        </p>
        <PixelButton onClick={onRestart}>{t.playAgain}</PixelButton>
      </PixelCard>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-end font-['VT323'] text-xl text-gray-500">
        <span>{t.question} {currentQuestionIndex + 1} / {data.questions.length}</span>
        <span>{t.score}: {score}</span>
      </div>
      
      <div className="w-full bg-gray-200 h-4 border-2 border-black mb-8">
        <div 
          className="bg-[#3b82f6] h-full transition-all duration-300" 
          style={{ width: `${((currentQuestionIndex) / data.questions.length) * 100}%` }}
        ></div>
      </div>

      <PixelCard title={t.quizBattleTitle}>
        <h3 className="text-2xl font-['DotGothic16'] mb-8 text-center leading-relaxed">
          {question.question}
        </h3>

        <div className="grid gap-4 mb-6">
          {question.options.map((option, index) => {
            let buttonStyle = "bg-white hover:bg-gray-50";
            if (isAnswered) {
              if (index === question.correctIndex) {
                buttonStyle = "bg-[#86efac] border-[#166534] text-[#14532d]"; // Green
              } else if (index === selectedOption) {
                buttonStyle = "bg-[#fca5a5] border-[#991b1b] text-[#7f1d1d]"; // Red
              } else {
                buttonStyle = "opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                className={`
                  w-full text-left p-4 border-2 border-black font-['DotGothic16'] text-lg transition-all
                  ${buttonStyle}
                  ${!isAnswered && 'hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none'}
                `}
              >
                <span className="font-['VT323'] mr-3 text-xl font-bold">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="animate-fade-in bg-[#fff7ed] border-2 border-[#fdba74] p-4 mb-6">
            <p className="font-bold text-[#ea580c] font-['VT323'] mb-1">{t.explanation}</p>
            <p className="font-['DotGothic16'] text-gray-700">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          <PixelButton 
            onClick={handleNext} 
            disabled={!isAnswered}
            className={!isAnswered ? "opacity-50 cursor-not-allowed" : ""}
          >
            {currentQuestionIndex === data.questions.length - 1 ? t.finish : t.next}
          </PixelButton>
        </div>
      </PixelCard>
    </div>
  );
};