import React, { useEffect, useState, useRef } from 'react';
import { TTSButton } from './TTSButton';
import { createPortal } from 'react-dom';

export const SelectionReader: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = (e: Event) => {
      // If clicking/interacting inside the popup, do not recalculate/clear selection
      if (popupRef.current && e.target instanceof Node && popupRef.current.contains(e.target)) {
        return;
      }

      // Small delay to allow selection to settle
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setPosition(null);
          setSelectedText('');
          return;
        }

        const text = selection.toString().trim();
        if (text.length === 0) {
          setPosition(null);
          return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Calculate position (centered above selection)
        setPosition({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + window.scrollY - 50 // 50px above
        });
        setSelectedText(text);
      }, 200);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking inside the popup, do not close it
      if (popupRef.current && e.target instanceof Node && popupRef.current.contains(e.target)) {
        return;
      }
      // Hide popup immediately on click outside
      setPosition(null);
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection); // For keyboard selection
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('mousedown', handleMouseDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!position || !selectedText) return null;

  return createPortal(
    <div 
      ref={popupRef}
      className="absolute z-50 transform -translate-x-1/2 animate-bounce-in"
      style={{ left: position.x, top: position.y }}
    >
      <div className="bg-[#facc15] border-2 border-black p-1 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] flex items-center">
        <TTSButton text={selectedText} size="sm" label="READ" />
        {/* Little triangle arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black mt-[-2px]"></div>
      </div>
    </div>,
    document.body
  );
};