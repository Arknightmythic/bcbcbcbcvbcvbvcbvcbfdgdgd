import React from 'react';
import { Edit, Trash2 } from 'lucide-react'; 
import type { ActionType, Team } from '../utils/types';
import AccessRights from './AccessRights';

interface TeamTableRowProps {
  team: Team; 
  onAction: (action: ActionType, team: Team) => void;
}

const TeamTableRow: React.FC<TeamTableRowProps> = ({ team, onAction }) => {
  return (
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{team.name}</td>
      

      <td className="px-4 py-3">
        {/* Ubah 'team.access' menjadi 'team.pages' */}
        <AccessRights rights={team.pages} />
      </td>
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        {/* --- PERUBAHAN DI SINI: Menambahkan div wrapper --- */}
        <div className="flex items-center justify-center gap-x-3">
          <button onClick={() => onAction('edit', team)} className="text-blue-600 hover:text-blue-800" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onAction('delete', team)} className="text-red-600 hover:text-red-800" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TeamTableRow;