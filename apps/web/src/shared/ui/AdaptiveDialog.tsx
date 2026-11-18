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
}

export function AdaptiveDialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'xl',
}: AdaptiveDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Desktop View: Centered Modal */}
      <div className="hidden md:block">
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
          {children}
        </Modal>
      </div>

      {/* Mobile View: Bottom Sheet */}
      <div className="block md:hidden">
        <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
          {children}
        </BottomSheet>
      </div>
    </>
  );
}
