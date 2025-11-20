// src/features/UserManagement/components/UserManagementModal.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, X, Eye, EyeOff } from 'lucide-react'; // Tambahkan import icon Eye
// Import tipe data yang sudah diperbarui
import type { User, Team, Role, UserModalData } from '../utils/types';
import CustomSelect from '../../../shared/components/CustomSelect';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Prop onSave diubah untuk mengirim data form mentah
  onSave: (data: UserModalData, id?: number) => void;
  user: User | null; // Tipe User adalah DTO backend
  teams: Team[]; // Tipe Team adalah DTO backend
  roles: Role[]; // Tipe Role adalah DTO backend
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
    teamId: '', // ID team (dari role.team.id)
    roleId: '', // ID role (dari role.id)
  });

  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password

  const isEditMode = !!user;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        password: '', // Selalu kosongkan password saat edit dimulai
        teamId: user?.role?.team?.id?.toString() || '',
        roleId: user?.role?.id?.toString() || '',
      });
      setShowPassword(false); // Reset visibilitas password saat modal dibuka
    }
  }, [isOpen, user, teams, roles]); 

  // Opsi tim sekarang dari data API
  const teamOptions = useMemo(() => 
    teams.map(t => ({ value: t.id.toString(), label: t.name })),
    [teams]
  );

  // Opsi role di-filter berdasarkan teamId yang dipilih
  const roleOptions = useMemo(() => 
    formData.teamId
      ? roles
          .filter(r => r.team.id.toString() === formData.teamId)
          .map(r => ({ value: r.id.toString(), label: r.name }))
      : [],
    [roles, formData.teamId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modalData: UserModalData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      teamId: formData.teamId,
      roleId: formData.roleId,
    };
    // Kirim data modal ke parent, parent yg akan memformat payload API
    onSave(modalData, user?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-2xl font-bold">{isEditMode ? 'Edit User' : 'Create New User'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* PERBAIKAN BACKEND: 
                API UpdateUser (Repository) tidak melakukan update pada kolom email.
                Oleh karena itu, input email di-disable saat mode Edit.
            */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email 
                {isEditMode && <span className="text-xs text-gray-400 font-normal ml-1">(Cannot be changed)</span>}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                }`}
                required
                disabled={isEditMode} 
              />
            </div>

            {/* FITUR BARU: Eye Icon untuk Show/Hide Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={!isEditMode}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Team</label>
              <CustomSelect
                selectedType="default"
                value={formData.teamId}
                onChange={(value) => setFormData({ ...formData, teamId: value, roleId: '' })} // Reset role saat team berubah
                options={[{ value: '', label: 'Select a team' }, ...teamOptions]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <CustomSelect
                selectedType="default"
                value={formData.roleId}
                onChange={(value) => setFormData({ ...formData, roleId: value })}
                options={[{ value: '', label: formData.teamId ? 'Select a role' : 'Select a team first' }, ...roleOptions]}
                disabled={!formData.teamId}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center">
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