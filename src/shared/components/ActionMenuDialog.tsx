// Path: src/shared/components/ActionMenuDialog.tsx
import React, { useEffect } from 'react';

interface ActionMenuDialogProps {
  dropdownRef: React.RefObject<HTMLDialogElement | null>;
  position: { top?: number; bottom?: number; right?: number };
  onClose: () => void;
  children: React.ReactNode;
}

export const ActionMenuDialog: React.FC<ActionMenuDialogProps> = ({
  dropdownRef,
  position,
  onClose,
  children
}) => {
  useEffect(() => {
    const element = dropdownRef.current;
    if (!element) return;

    const handleStopPropagation = (e: MouseEvent) => {
      e.stopPropagation();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') onClose();
    };

    element.addEventListener('click', handleStopPropagation);
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('click', handleStopPropagation);
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownRef, onClose]);

  return (
    <dialog
      ref={dropdownRef}
      open={true}
      tabIndex={-1}
      aria-modal="true"
      className="fixed z-[9999] w-48 bg-white rounded-md shadow-lg border border-gray-200 m-0 p-0 outline-none"
      style={{
        top: position.top ? `${position.top}px` : 'auto',
        right: position.right ? `${position.right}px` : 'auto',
        bottom: position.bottom ? `${position.bottom}px` : 'auto',
        left: 'auto'
      }}
    >
      <div className="flex flex-col py-1">
        {children}
      </div>
    </dialog>
  );
};