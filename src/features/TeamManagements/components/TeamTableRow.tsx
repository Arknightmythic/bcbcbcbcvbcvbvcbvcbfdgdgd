import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Trash2, MoreVertical } from 'lucide-react'; 
import type { ActionType, Team } from '../utils/types';
import AccessRights from './AccessRights';
import { useClickOutside } from '../../../shared/hooks/useClickOutside';

interface TeamTableRowProps {
  team: Team; 
  onAction: (action: ActionType, team: Team) => void;
}

const TeamTableRow: React.FC<TeamTableRowProps> = ({ team, onAction }) => {
  // --- State & Ref untuk Dropdown Portal ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsDropdownOpen(false);
  });

  // Handler untuk membuka/menutup dan menghitung posisi dropdown
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }

    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      const dropdownHeight = 90; // Perkiraan tinggi: 2 item * 44px
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

  // --- Komponen Konten Dropdown (untuk Portal) ---
  const DropdownContent = () => (
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
          onClick={() => { onAction('edit', team); setIsDropdownOpen(false); }}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          title="Edit Team"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Team</span>
        </button>
        <button
          onClick={() => { onAction('delete', team); setIsDropdownOpen(false); }}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          title="Delete Team"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Team</span>
        </button>
      </div>
    </div>
  );

  return (
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{team.name}</td>
      <td className="px-4 py-3">
        <AccessRights rights={team.pages} />
      </td>
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        
        {/* Layout Desktop */}
        <div className="hidden md:flex items-center justify-center gap-x-3">
          <button onClick={() => onAction('edit', team)} className="text-blue-600 hover:text-blue-800" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onAction('delete', team)} className="text-red-600 hover:text-red-800" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Layout Mobile */}
        <div className="md:hidden">
          <button
            ref={moreButtonRef}
            onClick={handleDropdownToggle}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Render Portal */}
        {isDropdownOpen && createPortal(<DropdownContent />, document.body)}
      </td>
    </tr>
  );
};

export default TeamTableRow;