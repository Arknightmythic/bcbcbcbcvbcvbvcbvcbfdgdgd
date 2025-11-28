import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ActionType, Role } from '../utils/types';
import CustomSelect from '../../../shared/components/CustomSelect';
import RoleTableRow from './RoleTableRow';

interface RoleTableProps {
  roles: Role[];
  onAction: (action: ActionType, role: Role) => void;
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

const RoleTable: React.FC<RoleTableProps> = ({
  roles,
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
      {/* --- PERUBAHAN DI SINI: ganti overflow-y-auto -> overflow-x-auto --- */}
      <div className="overflow-x-auto relative">
        <table className="min-w-full min-w-[768px]"> {/* Tambah min-w */}
          <thead className="bg-gray-100 sticky top-0 "> {/* Tambah sticky & z-index */}
            <tr className="text-left text-[10px] font-semibold text-gray-600">
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Nama Role</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Tim</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Izin</th>
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

      {/* --- PERUBAHAN DI SINI: Kontrol Paginasi Responsif --- */}
      <nav
        className="flex flex-col md:flex-row items-center justify-between pt-4 gap-4 md:gap-0"
        aria-label="Table navigation"
      >
        <span className="text-xs font-normal text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {startItem}-{endItem}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{totalItems}</span>
        </span>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-normal text-gray-500">
            Rows per page:
          </span>
          <CustomSelect
            value={String(itemsPerPage)}
            onChange={(value) => onItemsPerPageChange(Number(value))}
            options={itemsPerPageOptions}
            selectedType="pagerow"
            direction="up"
          />
          <ul className="inline-flex -space-x-px text-xs">
            <li>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center h-[30px] px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </li>
            <li>
              <span
                aria-current="page"
                className="flex items-center justify-center h-[30px] px-4 leading-tight text-gray-700 bg-white border border-gray-300"
              >
                Page {currentPage} of {totalPages > 0 ? totalPages : 1}
              </span>
            </li>
            <li>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center h-[30px] px-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default RoleTable;