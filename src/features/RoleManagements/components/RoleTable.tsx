import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ActionType, Role } from '../utils/types';
import CustomSelect from '../../../shared/components/CustomSelect';
import RoleTableRow from './RoleTableRow';
import TablePagination from '../../../shared/components/TablePagination';

interface RoleTableProps {
  roles: Role[];
  onAction: (action: ActionType, role: Role) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}


const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  onAction,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      <div className="overflow-x-auto relative">
        <table className="min-w-full min-w-[768px]"> {/* Tambah min-w */}
          <thead className="bg-gray-100 sticky top-0 "> {/* Tambah sticky & z-index */}
            <tr className="text-left text-[10px] font-semibold text-gray-600">
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Nama Role</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Tim</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Izin Akses</th>
              {/* --- PERUBAHAN DI SINI: Buat header Action sticky --- */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center right-0 z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.length > 0 ? (
              roles.map((role) => (
                <RoleTableRow key={role.id} role={role} onAction={onAction} />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  <p>Tidak ada peran yang ditemukan sesuai kriteria Anda.</p>
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

export default RoleTable;