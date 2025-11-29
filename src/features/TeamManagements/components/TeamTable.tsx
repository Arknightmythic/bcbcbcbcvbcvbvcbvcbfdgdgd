import React from 'react';
import type { ActionType, Team } from '../utils/types';
import TeamTableRow from './TeamTableRow';
import TablePagination from '../../../shared/components/TablePagination';

interface TeamTableProps {
  teams: Team[];
  onAction: (action: ActionType, team: Team) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}



const TeamTable: React.FC<TeamTableProps> = ({
  teams,
  onAction,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      {/* --- PERUBAHAN DI SINI: ganti overflow-y-auto -> overflow-x-auto --- */}
      <div className="overflow-x-auto relative">
        <table className="min-w-full min-w-[768px]"> {/* Tambah min-w */}
          <thead className="bg-gray-100 sticky top-0 "> {/* Tambah sticky & z-index */}
            <tr className="text-left text-[10px] font-semibold text-gray-600">
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Nama Tim</th>
              {/* HAPUS HEADER 'USERS' */}
              {/* <th className="px-4 py-3 sticky top-0 bg-gray-100">Users</th> */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Hak Akses</th>
              {/* --- PERUBAHAN DI SINI: Buat header Action sticky --- */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center right-0 z-10">Aksi</th>
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
                  <p>Tidak ada tim yang ditemukan sesuai kriteria Anda.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       <TablePagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </div>
  );
};

export default TeamTable;