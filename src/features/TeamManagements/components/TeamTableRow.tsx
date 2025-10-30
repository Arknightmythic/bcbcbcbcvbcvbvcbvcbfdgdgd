import React from 'react';
import { Users, Edit, Trash2 } from 'lucide-react';
import type { ActionType, Team } from '../utils/types';
import AccessRights from './AccessRights';

interface TeamTableRowProps {
  team: Team;
  onAction: (action: ActionType, team: Team) => void;
}

const TeamTableRow: React.FC<TeamTableRowProps> = ({ team, onAction }) => {
  return (
    <tr className="hover:bg-gray-50 text-sm text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{team.name}</td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-500" />
          {team.user_count}
        </div>
      </td>
      <td className="px-4 py-3">
        <AccessRights rights={team.access} />
      </td>
      <td className="px-4 py-3 text-center">
        <button onClick={() => onAction('edit', team)} className="text-blue-600 hover:text-blue-800 mr-4" title="Edit">
          <Edit className="w-5 h-5" />
        </button>
        <button onClick={() => onAction('delete', team)} className="text-red-600 hover:text-red-800" title="Delete">
          <Trash2 className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export default TeamTableRow;