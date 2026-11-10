import { useEffect } from 'react';
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-h-[90vh] bg-cream-light border-t-2 border-gold/40 rounded-t-3xl p-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Drag handle pill */}
        <div className="w-12 h-1.5 bg-sage/30 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
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

        <div className="overflow-y-auto max-h-[75vh] pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
