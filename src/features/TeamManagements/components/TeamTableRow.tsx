import React from 'react';
import { createPortal } from 'react-dom';
import { Edit, Trash2, MoreVertical } from 'lucide-react'; 
import type { ActionType, Team } from '../utils/types';
import AccessRights from './AccessRights';

// IMPORT Shared Components & Hooks

import { ActionMenuDialog } from '../../../shared/components/ActionMenuDialog';
import { useActionMenu } from '../../../shared/utils/useActionMenu';

interface TeamTableRowProps {
  team: Team; 
  onAction: (action: ActionType, team: Team) => void;
}

const TeamTableRow: React.FC<TeamTableRowProps> = ({ team, onAction }) => {
  const isDefault = team.name.toLowerCase() === 'default';
  
  // Menggunakan Hook untuk logika dropdown
  const { isOpen, setIsOpen, position, buttonRef, dropdownRef, toggle } = useActionMenu(90);

  return (
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{team.name}</td>
      <td className="px-4 py-3">
        <AccessRights rights={team.pages} />
      </td>
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        
        {/* Layout Desktop */}
        <div className="hidden md:flex items-center justify-center gap-x-3">
          <button 
            onClick={() => onAction('edit', team)} 
            disabled={isDefault}
            className={`hover:text-blue-800 ${isDefault ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600'}`}
            title={isDefault ? "'tidak bisa ubah tim default'" : "ubah"}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onAction('delete', team)} 
            disabled={isDefault}
            className={`hover:text-red-800 ${isDefault ? 'text-gray-300 cursor-not-allowed' : 'text-red-600'}`}
            title={isDefault ? "tidak bisa hapus tim 'default'" : "hapus"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Layout Mobile */}
        <div className="md:hidden">
          <button
            ref={buttonRef}
            onClick={toggle}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown via Portal dengan Shared Component */}
        {isOpen && createPortal(
          <ActionMenuDialog
            dropdownRef={dropdownRef}
            position={position}
            onClose={() => setIsOpen(false)}
          >
            <button
              onClick={() => { onAction('edit', team); setIsOpen(false); }}
              disabled={isDefault} 
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed"
              title={isDefault ? "tidak bisa edit tim 'default'" : "Ubah tim"}
            >
              <Edit className="w-4 h-4" />
              <span>Ubah Tim</span>
            </button>
            <button
              onClick={() => { onAction('delete', team); setIsOpen(false); }}
              disabled={isDefault} 
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed"
              title={isDefault ? "'Tidak bisa hapus tim'" : "Hapus Tim"}
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Tim</span>
            </button>
          </ActionMenuDialog>,
          document.body
        )}
      </td>
    </tr>
  );
};

export default TeamTableRow;