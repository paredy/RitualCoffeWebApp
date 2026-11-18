import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTranslateY(0);
      setIsDragging(false);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > 70) {
      setTranslateY(400);
      setTimeout(() => {
        onClose();
        setTranslateY(0);
      }, 150);
    } else {
      setTranslateY(0);
    }
  };

  const handleContentTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current && contentRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleContentTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0 && contentRef.current && contentRef.current.scrollTop <= 0) {
      setTranslateY(deltaY);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content with real-time swipe/drag down to dismiss */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative z-10 w-full max-h-[90vh] bg-cream-light border-t-2 border-gold/40 rounded-t-3xl p-4 sm:p-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Header & Touch Drag Handle Area */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="touch-none select-none cursor-grab active:cursor-grabbing pb-2"
        >
          {/* Visual pill handle with touch/click to dismiss */}
          <div
            onClick={onClose}
            className="w-12 h-1.5 bg-sage/40 hover:bg-sage/70 active:scale-95 rounded-full mx-auto mb-3 cursor-pointer transition-all"
            aria-label="Deslizar para cerrar"
            title="Desliza hacia abajo para cerrar"
          />

          <div className="flex items-center justify-between">
            {title ? (
              <h2 className="font-serif text-xl font-bold text-forest">
                {title}
              </h2>
            ) : <div />}
            <button
              onClick={onClose}
              aria-label="Cerrar panel"
              className="p-1.5 rounded-full text-sage hover:text-forest hover:bg-cream-dark transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content with top pull-down support */}
        <div
          ref={contentRef}
          onTouchStart={handleContentTouchStart}
          onTouchMove={handleContentTouchMove}
          onTouchEnd={handleTouchEnd}
          className="overflow-y-auto max-h-[75vh] pb-6"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
