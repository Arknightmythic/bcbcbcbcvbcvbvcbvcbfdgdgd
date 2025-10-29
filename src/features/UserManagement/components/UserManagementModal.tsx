import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import type { User, Team, Role } from '../utils/types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>, id?: number) => void;
  user: User | null;
  teams: Team[];
  roles: Role[];
  isLoading: boolean;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  teams,
  roles,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    team: '',
    role: '',
  });

  const isEditMode = !!user;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        password: '', // Selalu kosongkan password
        team: user?.team || '',
        role: user?.role || '',
      });
    }
  }, [isOpen, user]);

  const filteredRoles = formData.team ? roles.filter(r => r.team_id === formData.team) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      ...formData,
      account_type: 'credential' as const,
    };
    onSave(userData, user?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{isEditMode ? 'Edit User' : 'Create New User'}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Fields... */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                placeholder={isEditMode ? "Leave blank to keep current password" : ""}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required={!isEditMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Team (Optional)</label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value, role: '' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role (Optional)</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={!formData.team}
              >
                <option value="">{formData.team ? "No Role Assigned" : "Select a team first"}</option>
                {filteredRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
              {isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
              {isEditMode ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;