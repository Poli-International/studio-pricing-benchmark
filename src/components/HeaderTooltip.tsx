import React, { useState, useRef, useEffect } from 'react';

export interface HeaderTooltipProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export const HeaderTooltip: React.FC<HeaderTooltipProps> = ({ id, title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center text-left normal-case tracking-normal"
    >
      <button
        type="button"
        id={`btn-tooltip-${id}`}
        aria-label={title}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? `tooltip-content-${id}` : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[10px] font-bold transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      >
        ℹ️
      </button>

      {isOpen && (
        <div
          id={`tooltip-content-${id}`}
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 sm:w-80 p-3.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-2xl text-xs text-[var(--text)] animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
            <h4 className="font-bold text-[var(--text-heading)] text-xs flex items-center gap-1.5">
              <span>📋</span>
              <span>{title}</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[var(--muted)] hover:text-[var(--text)] text-xs p-1 rounded hover:bg-[var(--surface)] cursor-pointer"
              aria-label="Close tooltip"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-[11px] leading-relaxed text-[var(--muted)]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
