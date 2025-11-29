import React from 'react';
import TeamBadge from './TeamBadge';
import type { ActionType, User } from '../utils/types'; // Tipe User diimpor dari types.ts
import UserActions from './UserAction';

interface UserTableRowProps {
  user: User; // Tipe User sekarang adalah DTO dari backend
  onAction: (action: ActionType, user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onAction }) => {
  // Ekstrak nama tim dan role dari objek user
  // user.role bisa null, dan user.role.team bisa null
  const teamName = user.role?.team?.name;
  const roleName = user.role?.name;

  return (
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
      <td className="px-4 py-3">{user.email}</td>
      <td className="px-4 py-3 capitalize">{user.account_type || 'N/A'}</td>
      <td className="px-4 py-3 text-center">
        {/* TeamBadge sudah bisa menangani jika teamName undefined */}
        <TeamBadge teamName={teamName} />
      </td>
      <td className="px-4 py-3 capitalize">
        {roleName || <span className="text-gray-400">Tidak ada peran</span>}
      </td>
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        {/* --- PERUBAHAN DI SINI: Menambahkan div wrapper --- */}
        <div className="flex items-center justify-center gap-x-3">
          <UserActions user={user} onAction={onAction} />
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;