import React, { useState, useEffect, useMemo } from "react";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import type { User, Team, Role, UserModalData } from "../utils/types";
import CustomSelect from "../../../shared/components/CustomSelect";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserModalData, id?: number) => void;
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
    name: "",
    email: "",
    password: "",
    teamId: "",
    roleId: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = !!user;
  const isMicrosoftAccount = user?.account_type === "microsoft";
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        teamId: user?.role?.team?.id?.toString() || "",
        roleId: user?.role?.id?.toString() || "",
      });
      setShowPassword(false);
    }
  }, [isOpen, user, teams, roles]);

  const teamOptions = useMemo(
    () => teams.map((t) => ({ value: t.id.toString(), label: t.name })),
    [teams]
  );

  const roleOptions = useMemo(
    () =>
      formData.teamId
        ? roles
            .filter((r) => r.team.id.toString() === formData.teamId)
            .map((r) => ({ value: r.id.toString(), label: r.name }))
        : [],
    [roles, formData.teamId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (!isEditMode || formData.password.length > 0) &&
      formData.password.length < 8
    ) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    const modalData: UserModalData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      teamId: formData.teamId,
      roleId: formData.roleId,
    };
    onSave(modalData, user?.id);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      {/* PERUBAHAN 1: 
        - Added 'max-h-[90vh]' untuk membatasi tinggi modal 
        - Added 'flex flex-col' untuk layout vertikal 
      */}
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Added 'flex-shrink-0' agar tidak mengecil */}
        <div className="flex justify-between items-center pb-4 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold">
            {isEditMode ? "Edit User" : "Create New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PERUBAHAN 2: 
          - Wrapper div untuk konten scrollable
          - Form dipindahkan ke sini 
        */}
        <div className="overflow-y-auto flex-grow mt-6 p-2 custom-scrollbar">
          <form id="user-form" onSubmit={handleSubmit} autoComplete="off">
            {/* Hack untuk mematikan autofill Chrome */}
            <input type="text" style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  autoComplete="off"
                  name="user_name_custom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                  {isEditMode && (
                    <span className="text-xs text-gray-400 font-normal ml-1">
                      (Cannot be changed)
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isEditMode
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : ""
                  }`}
                  required
                  disabled={isEditMode}
                  autoComplete="off"
                  name="user_email_custom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    // Ubah placeholder jika akun Microsoft
                    placeholder={
                      isMicrosoftAccount
                        ? "Managed by Microsoft SSO"
                        : isEditMode
                        ? "Leave blank to keep current"
                        : "Enter password (min. 8 chars)"
                    }
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      isMicrosoftAccount
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                    // Syarat required: HANYA jika bukan edit mode DAN bukan akun microsoft
                    required={!isEditMode && !isMicrosoftAccount}
                    minLength={8}
                    autoComplete="new-password"
                    name="user_password_custom"
                    // Disable jika akun Microsoft
                    disabled={isMicrosoftAccount}
                  />

                  {/* Sembunyikan tombol mata jika disabled agar lebih bersih */}
                  {!isMicrosoftAccount && (
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
                  )}
                </div>

                {/* Info text */}
                {isMicrosoftAccount ? (
                  <p className="text-xs text-orange-500 mt-1">
                    Password cannot be changed manually for Microsoft accounts.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team
                </label>
                <CustomSelect
                  selectedType="default"
                  value={formData.teamId}
                  onChange={(value) =>
                    setFormData({ ...formData, teamId: value, roleId: "" })
                  }
                  options={[
                    { value: "", label: "Select a team" },
                    ...teamOptions,
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <CustomSelect
                  selectedType="default"
                  value={formData.roleId}
                  onChange={(value) =>
                    setFormData({ ...formData, roleId: value })
                  }
                  options={[
                    {
                      value: "",
                      label: formData.teamId
                        ? "Select a role"
                        : "Select a team first",
                    },
                    ...roleOptions,
                  ]}
                  disabled={!formData.teamId}
                />
              </div>
            </div>
          </form>
        </div>
        <div className="flex justify-end space-x-4 mt-4 pt-4 border-t flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="user-form" // Link button ke form
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
          >
            {isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            {isEditMode ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>

      {/* Style untuk scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default UserManagementModal;
