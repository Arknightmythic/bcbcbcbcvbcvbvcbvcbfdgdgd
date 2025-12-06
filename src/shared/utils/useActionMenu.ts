// Path: src/shared/hooks/useActionMenu.ts
import { useState, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

export const useActionMenu = (estimatedHeight = 100) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; right?: number }>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  const dropdownRef = useClickOutside<HTMLDialogElement>(() => {
    setIsOpen(false);
  });

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let newPos: { top?: number; bottom?: number; right?: number } = {
        right: window.innerWidth - rect.right + 8,
      };

      if (spaceBelow < estimatedHeight && spaceAbove > estimatedHeight) {
        newPos.bottom = window.innerHeight - rect.top;
      } else {
        newPos.top = rect.bottom;
      }
      
      setPosition(newPos);
      setIsOpen(true);
    }
  };

  return { isOpen, setIsOpen, position, buttonRef, dropdownRef, toggle };
};