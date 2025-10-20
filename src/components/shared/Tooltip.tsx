import { FC, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  className?: string;
}

export const Tooltip: FC<TooltipProps> = ({ content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isVisible]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Info Icon Button */}
      <button
        ref={buttonRef}
        onClick={toggleTooltip}
        className="mr-2 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all cursor-pointer"
        aria-label="Information"
        type="button"
      >
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">i</span>
      </button>

      {/* Tooltip Content */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute right-0 top-full mt-2 z-50 w-64 p-3 rounded-lg shadow-lg bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/20 text-[var(--tg-theme-text-color)] text-sm animate-fadeIn"
          style={{
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Arrow pointing up */}
          <div
            className="absolute -top-2 right-2 w-3 h-3 bg-[var(--tg-theme-bg-color)] border-l border-t border-[var(--tg-theme-hint-color)]/20 transform rotate-45"
          />

          {/* Content */}
          <div className="relative whitespace-pre-line">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};
