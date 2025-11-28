import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, X, Check, Square, CheckSquare } from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';
import type { Role, Permission, Team, RoleModalData } from '../utils/types';
import toast from 'react-hot-toast';

const shouldShowPermission = (permissionName: string): boolean => {
  return permissionName.endsWith(':read');
};

const formatPermissionLabel = (permissionName: string): string => {
  return permissionName.replace(':read', ':access');
};

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: RoleModalData, id?: number) => void;
  role: Role | null;
  permissions: Permission[];
  teams: Team[];
  isLoading: boolean;
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  role, 
  permissions, 
  teams, 
  isLoading 
}) => {
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  
  const isEditMode = !!role;

  useEffect(() => {
    if (isOpen) {
      setName(role?.name || '');   
      setTeamId(role?.team?.id ? String(role.team.id) : ''); 
      const permissionIds = role?.permissions?.map(p => String(p.id)) || [];
      setSelectedPermissions(new Set(permissionIds));
    } else {
      setName('');
      setTeamId('');
      setSelectedPermissions(new Set());
    }
  }, [isOpen, role]);

  const groupedPermissions = useMemo(() => {
    const currentTeam = teams.find(t => String(t.id) === teamId);
    if (!currentTeam) return {};
    const allowedPages = new Set(currentTeam.pages || []);
    const groups: Record<string, Permission[]> = {};

    permissions.forEach((perm) => {
      
      if (!shouldShowPermission(perm.name)) {
        return;
      }

      const [category] = perm.name.split(':');
      if (allowedPages.has(category)) {
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(perm);
      }
    });

    return groups;
  }, [permissions, teams, teamId]);

  const handleCheckboxChange = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newPermissions = new Set(prev);
      if (newPermissions.has(permissionId)) {
        newPermissions.delete(permissionId);
      } else {
        newPermissions.add(permissionId);
      }
      return newPermissions;
    });
  };

  const toggleGroup = (permsInGroup: Permission[]) => {
    const allIds = permsInGroup.map(p => String(p.id));
    const allSelected = allIds.every(id => selectedPermissions.has(id));

    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        allIds.forEach(id => newSet.delete(id));
      } else {
        allIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (name.trim().toLowerCase() === 'default') {
        toast.error("tidak dapat menggunakan nama 'default' untuk peran.");
        return;
    }
    

    if (!teamId) {
        toast.error("silakan pilih tim untuk peran ini."); 
        return;
    }

    const modalData: RoleModalData = {
        name,
        teamId,
        permissionIds: Array.from(selectedPermissions)
    };

    onSave(modalData, role?.id);
  };

  const formatGroupName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center pb-4 border-b flex-shrink-0">
            <h2 className="text-2xl font-bold">{isEditMode ? 'Ubah Peran' : 'Buat Peran Baru'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
              <X className="w-6 h-6" />
            </button>
        </div>

        <div className="overflow-y-auto flex-grow p-2 mt-6 custom-scrollbar">
          <form id="role-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Role</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Super Admin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daftakan ke tim</label>
                <div className="w-full"> 
                  <CustomSelect
                    options={teams.map(t => ({ value: String(t.id), label: t.name }))}
                    value={teamId}
                    onChange={setTeamId}
                    placeholder="Pilih Tim"
                    disabled={isEditMode}
                    selectedType='default'
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Izin secara otomatis difilter berdasarkan Hak Akses Tim yang dipilih.
                </p>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Izin
                {teamId && (
                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Difilter berdasarkan Tim
                    </span>
                )}
              </label>
              
              {!teamId ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                   <p>Silakan pilih Tim terlebih dahulu untuk melihat izin yang tersedia</p>
                </div>
              ) : Object.keys(groupedPermissions).length === 0 ? (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md text-sm">
                  Tidak ada izin yang ditemukan yang cocok dengan Hak Akses tim ini.
                  <br/>
                  <span className="text-xs opacity-75">Periksa apakah tim memiliki 'Hak Akses' yang ditetapkan di Manajemen Tim.</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([groupName, perms]) => {
                    const allSelected = perms.every(p => selectedPermissions.has(String(p.id)));

                    return (
                      <div key={groupName} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                            {formatGroupName(groupName)}
                          </h3>
                          <button
                            type="button"
                            onClick={() => toggleGroup(perms)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            {allSelected ? (
                                <>
                                    <CheckSquare className="w-3 h-3" /> Unselect All
                                </>
                            ) : (
                                <>
                                    <Square className="w-3 h-3" /> Select All
                                </>
                            )}
                          </button>
                        </div>
                        
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                          {perms.map(permission => (
                            <label 
                              key={permission.id} 
                              className={`flex items-center p-2 rounded-md border transition-all cursor-pointer hover:bg-blue-50 ${
                                selectedPermissions.has(String(permission.id)) 
                                  ? 'border-blue-200 bg-blue-50' 
                                  : 'border-gray-100'
                              }`}
                            >
                              <div className="relative flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.has(String(permission.id))}
                                  onChange={() => handleCheckboxChange(String(permission.id))}
                                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-blue-600 checked:bg-blue-600 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                              </div>
                              {/* PERUBAHAN DI SINI: Gunakan helper formatPermissionLabel */}
                              <span className="ml-3 text-sm text-gray-700 select-none">
                                {formatPermissionLabel(permission.name)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="pt-4 mt-4 border-t flex justify-end space-x-3 flex-shrink-0">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                Batal
            </button>
            <button 
                type="submit" 
                form="role-form"
                disabled={isLoading || !teamId} 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-sm"
            >
              {isLoading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              {isEditMode ? 'Simpan Perubahan' : 'Buat Role'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementModal;