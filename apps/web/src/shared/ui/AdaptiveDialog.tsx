import type { ReactNode } from 'react';
import { Modal } from './Modal';
import type { ModalProps } from './Modal';
import { BottomSheet } from './BottomSheet';

export interface AdaptiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: ModalProps['maxWidth'];
  variant?: 'cream' | 'forest';
}

export function AdaptiveDialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'xl',
  variant = 'cream',
}: AdaptiveDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Desktop View: Centered Modal */}
      <div className="hidden md:block">
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth} variant={variant}>
          {children}
        </Modal>
      </div>

      {/* Mobile View: Bottom Sheet */}
      <div className="block md:hidden">
        <BottomSheet isOpen={isOpen} onClose={onClose} title={title} variant={variant}>
          {children}
        </BottomSheet>
      </div>
    </>
  );
}
