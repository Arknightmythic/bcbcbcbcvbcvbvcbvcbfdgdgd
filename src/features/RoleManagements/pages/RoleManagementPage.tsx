// src/features/RoleManagements/pages/RoleManagementPage.tsx

import { useState, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import type { ActionType, Role, RoleModalData, RolePayload} from '../utils/types';

import {
  useGetRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useGetModalDependencies, 
} from '../hooks/useRoleManagement';

import TableControls from '../../../shared/components/tablecontrols/TableControls';
import RoleTable from '../components/RoleTable';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import RoleManagementModal from '../components/RoleManagementModal';
import ViewPermissionsModal from '../components/ViewPermissionModal';

// PERBAIKAN 1: Definisikan Filters sebagai Record<string, string> agar kompatibel dengan TableControls
interface Filters extends Record<string, string> {
  teamId: string; 
}

const RoleManagementPage = () => {
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [filters, setFilters] = useState<Filters>({ teamId: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    
    const searchParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set('limit', String(itemsPerPage));
        params.set('offset', String((currentPage - 1) * itemsPerPage));
        if (searchTerm) params.set('search', searchTerm);
        if (filters.teamId) params.set('team_id', filters.teamId); 
        return params;
    }, [currentPage, itemsPerPage, searchTerm, filters]); 

    const { data: rolesData, isLoading: isLoadingRoles } = useGetRoles(searchParams);
    const { 
        teams, 
        permissions, 
        isLoading: isLoadingModalDeps 
    } = useGetModalDependencies();

    const { mutate: createRole, isPending: isCreating } = useCreateRole();
    const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
    const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

    const isSaving = isCreating || isUpdating;

    const roles = useMemo(() => rolesData?.roles || [], [rolesData]);
    const totalItems = useMemo(() => rolesData?.total || 0, [rolesData]);

    // PERBAIKAN 2: Ubah tipe filterName menjadi string umum
    const handleFilterChange = (filterName: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1); 
    };

    const handleSearchSubmit = () => {
        setSearchTerm(searchInput);
        setCurrentPage(1);
    };

    const handleAction = (action: ActionType, role: Role) => {
        if (action === 'view') {
            setSelectedRole(role);
            setIsViewModalOpen(true);
        } else if (action === 'edit') {
            setSelectedRole(role);
            setIsModalOpen(true);
        } else if (action === 'delete') {
            setRoleToDelete(role);
            setIsConfirmModalOpen(true);
        }
    };
    
    const handleSaveRole = (modalData: RoleModalData, id?: number) => {
        const payload: RolePayload = {
            name: modalData.name,
            team_id: Number(modalData.teamId), 
            permissions: modalData.permissionIds, 
        };

        if (id) {
            updateRole({ id, data: payload }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createRole(payload, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };
    
    const handleConfirmDelete = () => {
        if (roleToDelete) {
            deleteRole(roleToDelete.id, {
                onSuccess: () => {
                    setIsConfirmModalOpen(false);
                    setRoleToDelete(null);
                }
            });
        }
    };
    
    const filterTeamOptions = useMemo(() => [
        { value: '', label: 'Semua Tim' },
        ...teams.map(t => ({ value: t.id.toString(), label: t.name })) 
    ], [teams]);

    const filterConfig = [
        { key: 'teamId', options: filterTeamOptions },
    ];
  
    if (isLoadingModalDeps) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
      <>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="bg-gray-50 rounded-t-lg shadow-md">
            <div className="px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-grow">
                    <TableControls
                        searchTerm={searchInput}
                        searchPlaceholder="Cari berdasarkan peran dan tim"
                        filters={filters}
                        onSearchChange={setSearchInput}
                        onSearchSubmit={handleSearchSubmit} 
                        onFilterChange={handleFilterChange}
                        filterConfig={filterConfig}
                    />
                </div>
                <div className="w-full lg:w-auto flex-shrink-0 text-xs">
                    <button onClick={() => { setSelectedRole(null); setIsModalOpen(true); }} 
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center w-full lg:w-auto"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Buat Peran
                    </button>
                </div>
            </div>
          </div>
          
          {isLoadingRoles && roles.length === 0 ? (
            <div className="flex-1 flex justify-center items-center p-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
             </div>
          ) : (
            <RoleTable
                roles={roles} 
                onAction={handleAction}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems} 
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
  
        <RoleManagementModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveRole} 
            role={selectedRole} 
            teams={teams} 
            permissions={permissions} 
            isLoading={isSaving} 
        />
        <ViewPermissionsModal 
            isOpen={isViewModalOpen} 
            onClose={() => setIsViewModalOpen(false)} 
            role={selectedRole} 
        />
        <ConfirmationModal 
            isOpen={isConfirmModalOpen} 
            onClose={() => setIsConfirmModalOpen(false)} 
            onConfirm={handleConfirmDelete} 
            title="Konfirmasi Penghapusan" 
            confirmText="Hapus" 
            confirmColor="bg-red-600 hover:bg-red-700"
            isConfirming={isDeleting} 
        >
          <p> Apakah Anda yakin akan menghapus role "{roleToDelete?.name}"? Aksi ini tidak dapat dibatalkan</p>
        </ConfirmationModal>
      </>
    );
  };
  
export default RoleManagementPage;