import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import type { ActionType, User } from '../utils/types';
import { useClickOutside } from '../../../shared/hooks/useClickOutside';

interface UserActionsProps {
  user: User;
  onAction: (action: ActionType, user: User) => void;
}


interface DropdownContentProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  position: { top?: number; bottom?: number; right?: number };
  user: User;
  onAction: (action: ActionType, user: User) => void;
  onClose: () => void;
}


const DropdownContent: React.FC<DropdownContentProps> = ({
  dropdownRef,
  position,
  user,
  onAction,
  onClose
}) => (
  <div
    ref={dropdownRef}
    className="fixed z-[9999] w-48 bg-white rounded-md shadow-lg border border-gray-200"
    style={{
      top: position.top ? `${position.top}px` : 'auto',
      right: position.right ? `${position.right}px` : 'auto',
      bottom: position.bottom ? `${position.bottom}px` : 'auto',
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex flex-col py-1">
      <button
        onClick={() => { onAction('edit', user); onClose(); }}
        className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        title="Ubah Akun"
      >
        <Edit className="w-4 h-4" />
        <span>Ubah Akun</span>
      </button>
      <button
        onClick={() => { onAction('delete', user); onClose(); }}
        className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        title="Hapus Akun"
      >
        <Trash2 className="w-4 h-4" />
        <span>Hapus Akun</span>
      </button>
    </div>
  </div>
);

const UserActions: React.FC<UserActionsProps> = ({ user, onAction }) => {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsDropdownOpen(false);
  });

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }

    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      const dropdownHeight = 90; 
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let newPos: { top?: number, bottom?: number, right?: number } = {
        right: window.innerWidth - rect.right + 8, 
      };

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        newPos.bottom = window.innerHeight - rect.top;
      } else {
        newPos.top = rect.bottom;
      }
      
      setPosition(newPos);
      setIsDropdownOpen(true);
    }
  };

  return (
    <>
      {/* Layout Desktop: Ikon sejajar */}
      <div className="hidden md:flex items-center justify-center gap-x-3">
        <button
          onClick={() => onAction('edit', user)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Ubah Akun"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAction('delete', user)}
          className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Hapus Akun"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Layout Mobile: Tombol Ellipsis */}
      <div className="md:hidden">
        <button
          ref={moreButtonRef}
          onClick={handleDropdownToggle}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Render Portal untuk Dropdown dengan Passing Props */}
      {isDropdownOpen && createPortal(
        <DropdownContent 
          dropdownRef={dropdownRef}
          position={position}
          user={user}
          onAction={onAction}
          onClose={() => setIsDropdownOpen(false)}
        />, 
        document.body
      )}
    </>
  );
};

export default UserActions;