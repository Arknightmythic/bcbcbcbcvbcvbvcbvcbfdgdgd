// src/features/RoleManagements/pages/RoleManagementPage.tsx

import { useState, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import type { ActionType, Role, RoleModalData, RolePayload, Team } from '../utils/types';

// Import hooks
import {
  useGetRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useGetModalDependencies, // Hook baru untuk ambil data modal
} from '../hooks/useRoleManagement';

import TableControls from '../../../shared/components/TableControls';
import RoleTable from '../components/RoleTable';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import RoleManagementModal from '../components/RoleManagementModal';
import ViewPermissionsModal from '../components/ViewPermissionModal';

// --- HAPUS DUMMY DATA ---

interface Filters {
  team: string; // Akan digunakan untuk filter client-side
}

const RoleManagementPage = () => {
    // Hapus state 'roles'
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Filters>({ team: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
  
    const [isModalOpen, setModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  
    // --- Integrasi React Query ---
    const searchParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set('limit', String(itemsPerPage));
        params.set('offset', String((currentPage - 1) * itemsPerPage));
        // Backend GET /api/roles tidak support search
        return params;
    }, [currentPage, itemsPerPage]);

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

    // Filter client-side
    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const searchMatch = role.name.toLowerCase().includes(lowerSearchTerm) || 
                              role.team.name.toLowerCase().includes(lowerSearchTerm);
          
          const teamMatch = filters.team ? role.team.name === filters.team : true;
          return searchMatch && teamMatch;
        });
      }, [roles, searchTerm, filters]);

    const paginatedRoles = useMemo(() => {
        // Paginasi di-handle backend, filter di client
        return filteredRoles;
    }, [filteredRoles]);

    const handleFilterChange = (filterName: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1); // Filter client-side
    };

    const handleSearchSubmit = () => {
        setSearchTerm(searchInput);
        setCurrentPage(1);
    };

    const handleAction = (action: ActionType, role: Role) => {
        if (action === 'view') {
            setSelectedRole(role);
            setViewModalOpen(true);
        } else if (action === 'edit') {
            setSelectedRole(role);
            setModalOpen(true);
        } else if (action === 'delete') {
            setRoleToDelete(role);
            setConfirmModalOpen(true);
        }
    };

    // Handler Save baru
    const handleSaveRole = (modalData: RoleModalData, id?: number) => {
        // Konversi modal data ke payload API
        const payload: RolePayload = {
            name: modalData.name,
            team_id: Number(modalData.teamId), // Konversi ke number
            permissions: modalData.permissionIds, // Sudah string[]
        };

        if (id) {
            updateRole({ id, data: payload }, {
                onSuccess: () => setModalOpen(false)
            });
        } else {
            createRole(payload, {
                onSuccess: () => setModalOpen(false)
            });
        }
    };
    
    const handleConfirmDelete = () => {
        if (roleToDelete) {
            deleteRole(roleToDelete.id, {
                onSuccess: () => {
                    setConfirmModalOpen(false);
                    setRoleToDelete(null);
                }
            });
        }
    };

    // Buat opsi filter dari data teams
    const filterTeamOptions = useMemo(() => [
        { value: '', label: 'All Teams' },
        ...teams.map(t => ({ value: t.name, label: t.name }))
    ], [teams]);


    const filterConfig = [
        { key: 'team' as keyof Filters, options: filterTeamOptions },
    ];
  
    // Tampilkan loading utama jika data dependensi modal belum siap
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
            <div className="px-4 flex items-center justify-between gap-4">
                <div className="flex-grow">
                    <TableControls
                        searchTerm={searchInput}
                        searchPlaceholder="Search by role or team name..."
                        filters={filters}
                        onSearchChange={setSearchInput}
                        onSearchSubmit={handleSearchSubmit} // Hubungkan handler
                        onFilterChange={handleFilterChange}
                        filterConfig={filterConfig}
                    />
                </div>
                <div className="flex-shrink-0">
                    <button onClick={() => { setSelectedRole(null); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Role
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
                roles={paginatedRoles} // Kirim data dari API
                onAction={handleAction}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems} // Kirim total dari API
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
  
        <RoleManagementModal 
            isOpen={isModalOpen} 
            onClose={() => setModalOpen(false)} 
            onSave={handleSaveRole} 
            role={selectedRole} 
            teams={teams} // Kirim data teams
            permissions={permissions} // Kirim data permissions
            isLoading={isSaving} 
        />
        <ViewPermissionsModal 
            isOpen={isViewModalOpen} 
            onClose={() => setViewModalOpen(false)} 
            role={selectedRole} 
        />
        <ConfirmationModal 
            isOpen={isConfirmModalOpen} 
            onClose={() => setConfirmModalOpen(false)} 
            onConfirm={handleConfirmDelete} 
            title="Confirm Deletion" 
            confirmText="Delete" 
            confirmColor="bg-red-600 hover:bg-red-700"
            isConfirming={isDeleting} // Tambahkan status loading
        >
          <p>Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.</p>
        </ConfirmationModal>
      </>
    );
  };
  
export default RoleManagementPage;