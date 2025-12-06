import React from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import type { ActionType, Role } from '../utils/types';
import TeamBadge from '../../UserManagement/components/TeamBadge'; 



import { ActionMenuDialog } from '../../../shared/components/ActionMenuDialog';
import { useActionMenu } from '../../../shared/utils/useActionMenu';





const shouldShowPermission = (name: string) => name.endsWith(':read');
const formatPermissionLabel = (name: string) => name.replace(':read', ':access');

interface RoleTableRowProps {
  role: Role; 
  onAction: (action: ActionType, role: Role) => void;
}

const RoleTableRow: React.FC<RoleTableRowProps> = ({ role, onAction }) => {
  const isDefault = role.name.toLowerCase() === 'default';

  
  const { isOpen, setIsOpen, position, buttonRef, dropdownRef, toggle } = useActionMenu(130);

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
             <span className="text-xs text-gray-400">Tidak ada akses</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        
        {/* Layout Desktop */}
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

        {/* Layout Mobile dengan Hook */}
        <div className="md:hidden">
          <button
            ref={buttonRef}
            onClick={toggle}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown menggunakan Shared Component */}
        {isOpen && createPortal(
          <ActionMenuDialog
            dropdownRef={dropdownRef}
            position={position}
            onClose={() => setIsOpen(false)}
          >
            <button
              onClick={() => { onAction('view', role); setIsOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              title="Lihat Detail"
            >
              <Eye className="w-4 h-4" />
              <span>Lihat Detail</span>
            </button>
            <button
              onClick={() => { onAction('edit', role); setIsOpen(false); }}
              disabled={isDefault}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed"
              title={isDefault ? "Tidak dapat mengedit peran default" : "Ubah Peran"}
            >
              <Edit className="w-4 h-4" />
              <span>Ubah Peran</span>
            </button>
            <button
              onClick={() => { onAction('delete', role); setIsOpen(false); }}
              disabled={isDefault}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed"
              title={isDefault ? "Tidak dapat menghapus peran default" : "Hapus Peran"}
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Peran</span>
            </button>
          </ActionMenuDialog>,
          document.body
        )}
      </td>
    </tr>
  );
};

export default RoleTableRow;