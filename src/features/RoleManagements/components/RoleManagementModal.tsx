import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import type { Role, Permission, Team } from '../utils/types';
import CustomSelect from '../../../shared/components/CustomSelect';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: any, id?: number) => void;
  role: Role | null;
  teams: Team[];
  permissions: Permission[];
  isLoading: boolean;
}

type Tab = 'operation' | 'manager_master' | 'agent';

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({ isOpen, onClose, onSave, role, teams, permissions, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>('operation');
  
  const isEditMode = !!role;

  useEffect(() => {
    if (isOpen) {
      const currentTeam = teams.find(t => t.name === role?.team_name);
      setName(role?.name || '');
      setDescription(role?.description || '');
      setTeamId(currentTeam?.id || '');
      setSelectedPermissions(new Set(role?.permissions.map(p => p.id) || []));
      setActiveTab('operation');
    }
  }, [isOpen, role, teams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, teamId, permissions: Array.from(selectedPermissions) }, role?.id);
  };

  const handleCheckboxChange = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      newSet.has(permissionId) ? newSet.delete(permissionId) : newSet.add(permissionId);
      return newSet;
    });
  };

  const filterPermissions = (category: Tab) => {
    if(category === 'operation') return permissions.filter(p => ["create", "read", "update", "delete"].some(k => p.name.includes(k)) && !p.name.includes("agent"));
    if(category === 'manager_master') return permissions.filter(p => ["manager", "master"].some(k => p.name.includes(k)));
    if(category === 'agent') return permissions.filter(p => p.name.includes("agent-dashboard"));
    return [];
  };
  
  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }));
  const currentPermissions = filterPermissions(activeTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Role' : 'Create New Role'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Team</label>
                <CustomSelect
                    selectedType="default"
                    value={teamId}
                    onChange={setTeamId}
                    options={[{ value: '', label: 'Select a team'}, ...teamOptions]}
                    disabled={isEditMode}
                />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full input-style" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full input-style" rows={2}></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {(['operation', 'manager_master', 'agent'] as Tab[]).map(tab => (
                            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                                className={`${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                                {tab.replace(/_/g, ' & ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-2 border p-3 rounded-b-md max-h-48 overflow-y-auto custom-scrollbar">
                    {currentPermissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {currentPermissions.map(p => (
                                <label key={p.id} className="flex items-center space-x-2 py-1">
                                    <input type="checkbox" checked={selectedPermissions.has(p.id)} onChange={() => handleCheckboxChange(p.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-800 capitalize">{p.name}</span>
                                </label>
                            ))}
                        </div>
                    ) : <p className="text-center text-gray-500">No permissions in this category.</p>}
                </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center">
              {isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
              {isEditMode ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
      <style>{`.input-style { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }`}</style>
    </div>
  );
};

export default RoleManagementModal;