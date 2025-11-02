// src/features/TeamManagements/components/TeamTable.tsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ActionType, Team } from '../utils/types';
import CustomSelect from '../../../shared/components/CustomSelect';
import TeamTableRow from './TeamTableRow';

interface TeamTableProps {
  teams: Team[];
  onAction: (action: ActionType, team: Team) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

const itemsPerPageOptions = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
];

const TeamTable: React.FC<TeamTableProps> = ({
  teams,
  onAction,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      <div className="overflow-y-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm font-semibold text-gray-600">
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Team Name</th>
              {/* HAPUS HEADER 'USERS' */}
              {/* <th className="px-4 py-3 sticky top-0 bg-gray-100">Users</th> */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Access Rights</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teams.length > 0 ? (
              teams.map((team) => (
                <TeamTableRow key={team.id} team={team} onAction={onAction} />
              ))
            ) : (
              <tr>
                {/* Ubah colSpan dari 4 menjadi 3 */}
                <td colSpan={3} className="text-center py-10 text-gray-500">
                  <p>No teams found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
        <span className="text-sm font-normal text-gray-500">
          Showing <span className="font-semibold text-gray-900">{startItem}-{endItem}</span> of <span className="font-semibold text-gray-900">{totalItems}</span>
        </span>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-normal text-gray-500">Rows per page:</span>
          <CustomSelect
            selectedType="pagerow"
            direction="up"
            value={String(itemsPerPage)}
            onChange={(value) => onItemsPerPageChange(Number(value))}
            options={itemsPerPageOptions}
          />
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center h-9 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </li>
            <li>
              <span className="flex items-center justify-center h-9 px-4 leading-tight text-gray-700 bg-white border border-gray-300">
                Page {currentPage} of {totalPages > 0 ? totalPages : 1}
              </span>
            </li>
            <li>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center justify-center h-9 px-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default TeamTable;