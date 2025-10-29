import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';
import type { ActionType, User } from '../utils/types';
import UserTableRow from './UserTableRow';

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
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      <div className="overflow-y-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm font-semibold text-gray-600">
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Name</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Email</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Account Type</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Team</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Role</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Actions</th>
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

      <nav
        className="flex items-center justify-between pt-4"
        aria-label="Table navigation"
      >
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
                className="flex items-center justify-center h-9 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
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
                className="flex items-center justify-center h-9 px-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
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

export default UserTable;