import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';
import type { ActionType, User } from '../utils/types';
import UserTableRow from './UserTableRow';
import TablePagination from '../../../shared/components/TablePagination';

interface UserTableProps {
  users: User[];
  onAction: (action: ActionType, user: User) => void;
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

const UserTable: React.FC<UserTableProps> = ({
  users,
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
        <table className="min-w-full"> 
          <thead className="bg-gray-100 sticky top-0 "> 
            <tr className="text-left text-[10px] font-semibold text-gray-600">
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Nama</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Email</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Tipe Akun</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Tim</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Peran</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center right-0 z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <UserTableRow key={user.id} user={user} onAction={onAction} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  <p>No users found matching your criteria.</p>
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

export default UserTable;