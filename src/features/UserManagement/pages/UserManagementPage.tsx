// src/features/UserManagement/pages/UserManagementPage.tsx

import { useState, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';

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

import TableControls from '../../../shared/components/tablecontrols/TableControls';
import UserTable from '../components/UserTable';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import UserManagementModal from '../components/UserManagementModal';

// --- PERUBAHAN 1: Update interface Filters ---
interface Filters {
  accountType: string;
  teamId: string;
  roleId: string;
}

const UserManagementPage = () => {
  // --- PERUBAHAN 2: Update state Search ---
  const [searchInput, setSearchInput] = useState(''); // State untuk input field
  const [searchTerm, setSearchTerm] = useState('');   // State untuk filter aktif
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- PERUBAHAN 3: Update state Filters ---
  const [filters, setFilters] = useState<Filters>({
    accountType: '',
    teamId: '',
    roleId: '',
  });

  // State untuk UI (modal, delete)
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // --- Integrasi React Query ---

  // --- PERUBAHAN 4: Update searchParams ---
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', String(itemsPerPage));
    params.set('offset', String((currentPage - 1) * itemsPerPage));
    
    if (searchTerm) params.set('search', searchTerm);
    // Tambahkan filter baru ke parameter API
    if (filters.accountType) params.set('account_type', filters.accountType);
    if (filters.teamId) params.set('team_id', filters.teamId);
    if (filters.roleId) params.set('role_id', filters.roleId);
    
    return params;
  }, [currentPage, itemsPerPage, searchTerm, filters]); // <-- TAMBAHKAN 'filters'

  // 2. Fetch data menggunakan hooks
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers(searchParams);
  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeams();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoles();

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

  // --- PERUBAHAN 5: Hapus 'filteredUsers' (client-side filtering) ---
  // const filteredUsers = useMemo(() => { ... }); // <-- HAPUS BLOK INI

  // --- Handler ---

  // --- PERUBAHAN 6: Update handleFilterChange ---
  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset paginasi saat filter berubah
  };
  
  // (Handler ini sudah benar)
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
    const currentAccountType = (id && selectedUser?.account_type) 
      ? selectedUser.account_type 
      : 'credential';

    const payload: CreateUserPayload | UpdateUserPayload = {
      name: modalData.name,
      email: modalData.email,
      account_type: currentAccountType, 
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

  // --- PERUBAHAN 7: Update opsi filter ---
  const accountTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'credential', label: 'Credential' },
    { value: 'microsoft', label: 'Microsoft' },
  ];

   const filterTeamOptions = useMemo(() => [
     { value: '', label: 'All Teams' },
     ...teams.map(t => ({ value: t.id.toString(), label: t.name })) // Gunakan ID
   ], [teams]);
  
   const filterRoleOptions = useMemo(() => [
     { value: '', label: 'All Roles' },
     ...roles.map(r => ({ value: r.id.toString(), label: r.name })) // Gunakan ID
   ], [roles]);

  // --- PERUBAHAN 8: Update filterConfig ---
  const filterConfig = [
    { key: 'accountType' as keyof Filters, options: accountTypeOptions },
    { key: 'teamId' as keyof Filters, options: filterTeamOptions },
    { key: 'roleId' as keyof Filters, options: filterRoleOptions },
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
            {/* --- PERUBAHAN DI SINI: Bungkus dengan flex container --- */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                 <div className="flex-grow">
                    <TableControls
                        searchTerm={searchInput}
                        searchPlaceholder="Cari bedasarkan nama atau email..."
                        filters={filters}
                        onSearchChange={setSearchInput}
                        onSearchSubmit={handleSearchSubmit}
                        onFilterChange={handleFilterChange}
                        filterConfig={filterConfig}
                    />
                 </div>
                {/* --- PERUBAHAN DI SINI: Atur lebar tombol --- */}
                <div className="w-full lg:w-auto flex-shrink-0 text-xs">
                    <button
                        onClick={() => { setSelectedUser(null); setUserModalOpen(true); }}
                        /* Tambahkan w-full lg:w-auto dan justify-center */
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center w-full lg:w-auto"
                    >
                        <Plus className="w-3 h-3 mr-2" />
                        Create User
                    </button>
                </div>
            </div>
        </div>
        
        {/* --- PERUBAHAN 9: Gunakan 'users' dari server --- */}
        <UserTable
          users={users} // Gunakan data dari server, bukan 'filteredUsers'
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