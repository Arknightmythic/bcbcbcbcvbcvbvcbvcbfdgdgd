// src/features/UserManagement/pages/UserManagementPage.tsx

import { useState, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Import tipe baru dan tipe payload
import type {
  ActionType,
  User,
  UserModalData,
  CreateUserPayload,
  UpdateUserPayload,
} from '../utils/types';

// Import hooks
import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useGetTeams,
  useGetRoles,
} from '../hooks/useUserManagement';

import TableControls from '../../../shared/components/TableControls';
import UserTable from '../components/UserTable';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import UserManagementModal from '../components/UserManagementModal';

// Filter sekarang hanya untuk UI, API call akan menggunakan state lain
interface Filters {
  team: string;
  role: string;
}

const UserManagementPage = () => {
  // --- PERUBAHAN STATE SEARCH ---
  const [searchInput, setSearchInput] = useState(''); // State untuk input field
  const [searchTerm, setSearchTerm] = useState('');   // State untuk filter aktif
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk UI (modal, delete)
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // --- Integrasi React Query ---

  // 1. Buat parameter query untuk API
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', String(itemsPerPage));
    params.set('offset', String((currentPage - 1) * itemsPerPage));
    
    if (searchTerm) params.set('search', searchTerm); // <-- BARIS INI DIAKTIFKAN
    
    return params;
  }, [currentPage, itemsPerPage, searchTerm]); // <-- TAMBAHKAN 'searchTerm' // Hapus searchTerm dari dependency

  // 2. Fetch data menggunakan hooks
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers(searchParams);
  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeams();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoles();

  console.log(usersData)

  // 3. Siapkan data mutasi
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const isSaving = isCreating || isUpdating;

  // 4. Memoize data untuk tabel dan modal
  const users = useMemo(() => usersData?.data || [], [usersData]);
  const totalItems = useMemo(() => usersData?.total || 0, [usersData]);
  const teams = useMemo(() => teamsData || [], [teamsData]);
  const roles = useMemo(() => rolesData || [], [rolesData]);

  // --- Logika Filtering Sederhana di Client ---
  const [filters, setFilters] = useState<Filters>({ team: '', role: '' });

 const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const teamName = user.role?.team?.name || '';
      const roleName = user.role?.name || '';
      
      // LOGIKA SEARCH DIHAPUS DARI SINI

      const teamMatch = filters.team ? teamName === filters.team : true;
      const roleMatch = filters.role ? roleName === filters.role : true;

      return teamMatch && roleMatch; // <-- HAPUS 'searchMatch'
    });
  }, [users, filters]); // <-- HAPUS 'searchTerm'
  // --- Handler ---

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  // --- HANDLER BARU UNTUK SUBMIT SEARCH ---
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput); // Terapkan nilai dari input ke state filter aktif
    setCurrentPage(1); // Reset ke halaman pertama saat search
  };


  const handleOpenModal = (action: ActionType, user: User) => {
    if (action === 'edit') {
      setSelectedUser(user);
      setUserModalOpen(true);
    } else if (action === 'delete') {
      setUserToDelete(user);
      setConfirmModalOpen(true);
    }
  };

  const handleSaveUser = (modalData: UserModalData, id?: number) => {
    
    const payload: CreateUserPayload | UpdateUserPayload = {
      name: modalData.name,
      email: modalData.email,
      account_type: 'credential',
      role_id: modalData.roleId ? Number(modalData.roleId) : null,
      phone: null,
    };

    if (modalData.password) {
      payload.password = modalData.password;
    }

    if (id) {
      updateUser({ id, data: payload }, {
        onSuccess: () => setUserModalOpen(false),
      });
    } else {
      createUser(payload, {
        onSuccess: () => setUserModalOpen(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id, {
        onSuccess: () => {
          setConfirmModalOpen(false);
          setUserToDelete(null);
        }
      });
    }
  };

  // Opsi filter dari data API (disederhanakan)
   const filterTeamOptions = useMemo(() => [
     { value: '', label: 'All Teams' },
     ...teams.map(t => ({ value: t.name, label: t.name }))
   ], [teams]);
  
   const filterRoleOptions = useMemo(() => [
     { value: '', label: 'All Roles' },
     ...roles.map(r => ({ value: r.name, label: r.name }))
   ], [roles]);

  const filterConfig = [
    { key: 'team' as keyof Filters, options: filterTeamOptions },
    { key: 'role' as keyof Filters, options: filterRoleOptions },
  ];
  
  if (isLoadingTeams || isLoadingRoles) {
      return (
          <div className="flex-1 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
      )
  }

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
            <div className="flex justify-between items-center">
                 <div className="flex-grow">
                    {/* --- PERUBAHAN PROPS TableControls --- */}
                    <TableControls
                        searchTerm={searchInput} // <-- Prop 'searchTerm' diisi oleh 'searchInput'
                        searchPlaceholder="Search by name or email..."
                        filters={filters}
                        onSearchChange={setSearchInput} // <-- 'onSearchChange' mengubah 'searchInput'
                        onSearchSubmit={handleSearchSubmit} // <-- 'onSearchSubmit' memanggil handler baru
                        onFilterChange={handleFilterChange}
                        filterConfig={filterConfig}
                    />
                 </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={() => { setSelectedUser(null); setUserModalOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create User
                    </button>
                </div>
            </div>
        </div>
        
        <UserTable
          users={filteredUsers} // Gunakan data yg sudah di-filter
          onAction={handleOpenModal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems} // Total item tetap dari server
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        teams={teams}
        roles={roles}
        isLoading={isSaving}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        isConfirming={isDeleting}
      >
        <p>Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
};

export default UserManagementPage;