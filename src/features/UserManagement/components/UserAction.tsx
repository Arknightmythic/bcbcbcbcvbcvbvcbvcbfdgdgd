import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import type { ActionType, User } from '../utils/types';
import { useClickOutside } from '../../../shared/hooks/useClickOutside';

interface UserActionsProps {
  user: User;
  onAction: (action: ActionType, user: User) => void;
}

interface DropdownContentProps {
  dropdownRef: React.RefObject<HTMLDialogElement | null>; 
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
}) => {
  
  // PERBAIKAN: Menggunakan useEffect untuk menangani event listener.
  // Ini menghindari error SonarQube "Non-interactive elements should not be assigned..."
  // karena kita tidak lagi menaruh onClick langsung di JSX elemen <dialog>.
  useEffect(() => {
    const element = dropdownRef.current;
    if (!element) return;

    const handleStopPropagation = (e: MouseEvent) => {
      e.stopPropagation();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Menambahkan listener native DOM
    element.addEventListener('click', handleStopPropagation);
    element.addEventListener('keydown', handleKeyDown);

    // Membersihkan listener saat unmount
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
      className="fixed z-[9999] w-48 bg-white rounded-md shadow-lg border border-gray-200 outline-none m-0 p-0"
      style={{
        top: position.top ? `${position.top}px` : 'auto',
        right: position.right ? `${position.right}px` : 'auto',
        bottom: position.bottom ? `${position.bottom}px` : 'auto',
        left: 'auto'
      }}
      // onClick & onKeyDown dihapus dari JSX untuk memuaskan SonarQube
      // Fungsinya digantikan oleh useEffect di atas.
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
    </dialog>
  );
};

const UserActions: React.FC<UserActionsProps> = ({ user, onAction }) => {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  // Menggunakan HTMLDialogElement sesuai perubahan di DropdownContent
  const dropdownRef = useClickOutside<HTMLDialogElement>(() => {
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