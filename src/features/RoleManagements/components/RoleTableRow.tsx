import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import type { ActionType, Role } from '../utils/types';
import TeamBadge from '../../UserManagement/components/TeamBadge'; 
import { useClickOutside } from '../../../shared/hooks/useClickOutside';

interface RoleTableRowProps {
  role: Role; 
  onAction: (action: ActionType, role: Role) => void;
}

const shouldShowPermission = (name: string) => name.endsWith(':read');
const formatPermissionLabel = (name: string) => name.replace(':read', ':access');

const RoleTableRow: React.FC<RoleTableRowProps> = ({ role, onAction }) => {
  // --- CEK DEFAULT ---
  const isDefault = role.name.toLowerCase() === 'default';

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
      const dropdownHeight = 130;
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
          onClick={() => { onAction('view', role); setIsDropdownOpen(false); }}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          title="Lihat Detail"
        >
          <Eye className="w-4 h-4" />
          <span>Lihat Detail</span>
        </button>
        <button
          onClick={() => { onAction('edit', role); setIsDropdownOpen(false); }}
          disabled={isDefault}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed"
          title={isDefault ? "Tidak dapat mengedit peran default" : "Ubah Peran"}
        >
          <Edit className="w-4 h-4" />
          <span>Ubah Peran</span>
        </button>
        <button
          onClick={() => { onAction('delete', role); setIsDropdownOpen(false); }}
          disabled={isDefault}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed"
          title={isDefault ? "Tidak dapat menghapus peran default" : "Hapus Peran"}
        >
          <Trash2 className="w-4 h-4" />
          <span>Hapus Peran</span>
        </button>
      </div>
    </div>
  );

  const allPermissions = role.permissions || [];
  const visiblePermissions = allPermissions.filter(p => shouldShowPermission(p.name));

  return (
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{role.name}</td>
      <td className="px-4 py-3">
        <TeamBadge teamName={role.team.name} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {visiblePermissions.slice(0, 3).map(p => (
            <span key={p.id} className="px-2 py-0.5 text-[10px] bg-gray-200 text-gray-800 rounded-full">
              {formatPermissionLabel(p.name)}
            </span>
          ))}
          
          {visiblePermissions.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] bg-gray-300 text-gray-800 rounded-full">
              +{visiblePermissions.length - 3} lebih banyak
            </span>
          )}
          
          {visiblePermissions.length === 0 && (
             <span className="text-xs text-gray-400">No specific access</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        
        <div className="hidden md:flex items-center justify-center gap-x-3">
          <button onClick={() => onAction('view', role)} className="text-green-600 hover:text-green-800" title="Lihat Detail">
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onAction('edit', role)} 
            disabled={isDefault}
            className={`hover:text-blue-800 ${isDefault ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600'}`}
            title={isDefault ? "Tidak dapat mengedit peran default" : "Ubah"}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onAction('delete', role)} 
            disabled={isDefault}
            className={`hover:text-red-800 ${isDefault ? 'text-gray-300 cursor-not-allowed' : 'text-red-600'}`}
            title={isDefault ? "Tidak dapat menghapus peran default" : "Hapus"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="md:hidden">
          <button
            ref={moreButtonRef}
            onClick={handleDropdownToggle}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {isDropdownOpen && createPortal(<DropdownContent />, document.body)}
      </td>
    </tr>
  );
};

export default RoleTableRow;