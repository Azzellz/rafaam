import React from 'react';

// Common button styles
export const PixelButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const baseStyle = "font-['VT323'] text-lg md:text-xl px-4 md:px-6 py-2 border-2 border-black transition-transform active:translate-y-1 active:shadow-none";
  
  const variants = {
    primary: "bg-[#3b82f6] text-white shadow-[3px_3px_0_0_#1e3a8a] md:shadow-[4px_4px_0_0_#1e3a8a] hover:bg-[#2563eb]",
    secondary: "bg-[#facc15] text-black shadow-[3px_3px_0_0_#a16207] md:shadow-[4px_4px_0_0_#a16207] hover:bg-[#eab308]",
    danger: "bg-[#ef4444] text-white shadow-[3px_3px_0_0_#991b1b] md:shadow-[4px_4px_0_0_#991b1b] hover:bg-[#dc2626]",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

// Card container
export const PixelCard: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ 
  children, 
  className = '',
  title
}) => {
  return (
    <div className={`bg-white border-2 md:border-4 border-black shadow-[4px_4px_0_0_#cbd5e1] md:shadow-[8px_8px_0_0_#cbd5e1] p-4 md:p-6 relative ${className}`}>
      {title && (
        <div className="absolute -top-4 md:-top-5 left-2 md:left-4 bg-[#6366f1] text-white px-3 py-0.5 md:px-4 md:py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">
          <span className="font-['VT323'] text-lg md:text-xl uppercase tracking-wider">{title}</span>
        </div>
      )}
      {children}
    </div>
  );
};

// Input field
export const PixelInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`font-['DotGothic16'] text-base md:text-lg w-full bg-[#f1f5f9] border-2 border-black p-2 md:p-3 focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-shadow placeholder-gray-500 ${className}`}
      {...props}
    />
  );
};

// Select field
export const PixelSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className="relative">
      <select 
        className={`font-['VT323'] text-lg md:text-xl appearance-none w-full bg-white border-2 border-black p-2 pr-8 focus:outline-none focus:shadow-[4px_4px_0_0_#000] cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};