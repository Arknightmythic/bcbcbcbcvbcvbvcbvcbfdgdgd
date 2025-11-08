import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { ActionType, User } from '../utils/types';

interface UserActionsProps {
  user: User;
  onAction: (action: ActionType, user: User) => void;
}

const UserActions: React.FC<UserActionsProps> = ({ user, onAction }) => {
  return (
    <div className="flex items-center justify-center gap-x-3">
      <button
        onClick={() => onAction('edit', user)}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="Edit User"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onAction('delete', user)}
        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        title="Delete User"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UserActions;