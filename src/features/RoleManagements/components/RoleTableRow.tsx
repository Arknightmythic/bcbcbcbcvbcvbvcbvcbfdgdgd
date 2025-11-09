import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { ActionType, Role } from '../utils/types';
import TeamBadge from '../../UserManagement/components/TeamBadge'; 

interface RoleTableRowProps {
  role: Role; 
  onAction: (action: ActionType, role: Role) => void;
}

const RoleTableRow: React.FC<RoleTableRowProps> = ({ role, onAction }) => {
  return (
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{role.name}</td>
      <td className="px-4 py-3">
        {/* Baca dari objek team */}
        <TeamBadge teamName={role.team.name} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {/* role.permissions sekarang array of object Permission */}
          {role.permissions.slice(0, 3).map(p => (
            <span key={p.id} className="px-2 py-0.5 text-[10px] bg-gray-200 text-gray-800 rounded-full">{p.name}</span>
          ))}
          {role.permissions.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] bg-gray-300 text-gray-800 rounded-full">+{role.permissions.length - 3} more</span>
          )}
          {role.permissions.length === 0 && (
             <span className="text-xs text-gray-400">No permissions</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        {/* --- PERUBAHAN DI SINI: Menambahkan div wrapper --- */}
        <div className="flex items-center justify-center gap-x-3">
          <button onClick={() => onAction('view', role)} className="text-green-600 hover:text-green-800" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => onAction('edit', role)} className="text-blue-600 hover:text-blue-800" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onAction('delete', role)} className="text-red-600 hover:text-red-800" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default RoleTableRow;