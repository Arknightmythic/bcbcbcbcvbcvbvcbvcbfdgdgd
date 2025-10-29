import React from 'react';

import TeamBadge from './TeamBadge';
import type { ActionType, User } from '../utils/types';
import UserActions from './UserAction';


interface UserTableRowProps {
  user: User;
  onAction: (action: ActionType, user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onAction }) => {
  return (
    <tr className="hover:bg-gray-50 text-sm text-gray-700">
      <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
      <td className="px-4 py-3">{user.email}</td>
      <td className="px-4 py-3 capitalize">{user.account_type}</td>
      <td className="px-4 py-3 text-center">
        <TeamBadge teamName={user.team} />
      </td>
      <td className="px-4 py-3 capitalize">{user.role || <span className="text-gray-400">No Role</span>}</td>
      <td className="px-4 py-3 text-center">
        <UserActions user={user} onAction={onAction} />
      </td>
    </tr>
  );
};

export default UserTableRow;