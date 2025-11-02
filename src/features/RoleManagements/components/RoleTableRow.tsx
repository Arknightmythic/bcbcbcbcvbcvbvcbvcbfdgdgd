// src/features/RoleManagements/components/RoleTableRow.tsx

import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { ActionType, Role } from '../utils/types';
import TeamBadge from '../../UserManagement/components/TeamBadge'; // Re-use TeamBadge

interface RoleTableRowProps {
  role: Role; // Tipe Role adalah GetRoleDTO
  onAction: (action: ActionType, role: Role) => void;
}

const RoleTableRow: React.FC<RoleTableRowProps> = ({ role, onAction }) => {
  return (
    <tr className="hover:bg-gray-50 text-sm text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{role.name}</td>
      <td className="px-4 py-3">
        {/* Baca dari objek team */}
        <TeamBadge teamName={role.team.name} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {/* role.permissions sekarang array of object Permission */}
          {role.permissions.slice(0, 3).map(p => (
            <span key={p.id} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-800 rounded-full">{p.name}</span>
          ))}
          {role.permissions.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-gray-300 text-gray-800 rounded-full">+{role.permissions.length - 3} more</span>
          )}
          {role.permissions.length === 0 && (
             <span className="text-xs text-gray-400">No permissions</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <button onClick={() => onAction('view', role)} className="text-green-600 hover:text-green-800 mr-4" title="View Details">
          <Eye className="w-5 h-5" />
        </button>
        <button onClick={() => onAction('edit', role)} className="text-blue-600 hover:text-blue-800 mr-4" title="Edit">
          <Edit className="w-5 h-5" />
        </button>
        <button onClick={() => onAction('delete', role)} className="text-red-600 hover:text-red-800" title="Delete">
          <Trash2 className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export default RoleTableRow;