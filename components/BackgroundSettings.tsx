import React, { useRef } from 'react';
import { BackgroundConfig, Language } from '../types';
import { PixelButton, PixelCard } from './PixelUI';
import { translations } from '../i18n';

interface Props {
  language: Language;
  config: BackgroundConfig;
  onConfigChange: (newConfig: BackgroundConfig) => void;
  onClose: () => void;
}

export const BackgroundSettings: React.FC<Props> = ({ language, config, onConfigChange, onClose }) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onConfigChange({ ...config, imageData: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    onConfigChange({
      imageData: null,
      blur: 0,
      overlayOpacity: 0.5
    });
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in p-4">
      <div className="w-full max-w-md relative">
        <PixelCard title={t.bgSettings}>
            <div className="space-y-6">
                
                {/* Image Upload */}
                <div>
                    <label className="block font-['VT323'] text-xl mb-2">{t.uploadImage}</label>
                    <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer">
                             <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="hidden"
                             />
                             <div className="border-2 border-black border-dashed bg-gray-50 hover:bg-gray-100 p-3 text-center font-['DotGothic16'] text-gray-600 truncate">
                                {config.imageData ? "🖼️ Image Selected" : t.noImage}
                             </div>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 font-['VT323'] mt-1">{t.bgNote}</p>
                </div>

                {/* Blur Slider */}
                <div>
                    <div className="flex justify-between font-['VT323'] text-xl mb-1">
                        <label>{t.blur}</label>
                        <span>{config.blur}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        step="1"
                        value={config.blur}
                        onChange={(e) => onConfigChange({ ...config, blur: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border-2 border-black accent-[#3b82f6]"
                    />
                </div>

                {/* Opacity Slider */}
                <div>
                    <div className="flex justify-between font-['VT323'] text-xl mb-1">
                        <label>{t.opacity}</label>
                        <span>{Math.round(config.overlayOpacity * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={config.overlayOpacity}
                        onChange={(e) => onConfigChange({ ...config, overlayOpacity: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border-2 border-black accent-[#3b82f6]"
                    />
                </div>

                <div className="flex justify-between gap-4 pt-4 border-t-2 border-gray-200">
                    <PixelButton onClick={handleReset} variant="danger" className="text-sm px-3">
                        {t.reset}
                    </PixelButton>
                    <PixelButton onClick={onClose} variant="primary">
                        {t.close}
                    </PixelButton>
                </div>
            </div>
        </PixelCard>
      </div>
    </div>
  );
};