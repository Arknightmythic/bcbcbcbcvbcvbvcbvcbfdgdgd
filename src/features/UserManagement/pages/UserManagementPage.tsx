import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { ActionType, User, Team, Role } from '../utils/types';
import TableControls from '../../../shared/components/TableControls';
import UserTable from '../components/UserTable';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import UserManagementModal from '../components/UserManagementModal';

// --- DUMMY DATA ---
const DUMMY_TEAMS: Team[] = [
  { id: '1', name: 'Superadmin' },
  { id: '2', name: 'Finance' },
  { id: '3', name: 'Legal' },
  { id: '4', name: 'IT' },
];

const DUMMY_ROLES: Role[] = [
  { id: '101', name: 'Super User', team_id: '1' },
  { id: '201', name: 'Accountant', team_id: '2' },
  { id: '202', name: 'Auditor', team_id: '2' },
  { id: '301', name: 'Lawyer', team_id: '3' },
  { id: '401', name: 'Developer', team_id: '4' },
];

const DUMMY_USERS: User[] = [
  { id: 1, name: 'Budi Santoso', email: 'budi.santoso@example.com', account_type: 'credential', team: 'IT', role: 'Developer' },
  { id: 2, name: 'Citra Lestari', email: 'citra.lestari@example.com', account_type: 'microsoft', team: 'Finance', role: 'Accountant' },
  { id: 3, name: 'Admin Utama', email: 'admin@example.com', account_type: 'credential', team: 'Superadmin', role: 'Super User' },
  { id: 4, name: 'Dewi Anggraini', email: 'dewi.anggraini@example.com', account_type: 'microsoft', team: 'Legal' },
  { id: 5, name: 'Eko Prasetyo', email: 'eko.prasetyo@example.com', account_type: 'credential', team: 'Finance', role: 'Auditor' },
];
// --- END DUMMY DATA ---


interface Filters {
  team: string;
  role: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({ team: '', role: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [isSaving, setIsSaving] = useState(false);


  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const teamName = user.team || '';
      const roleName = user.role || '';
      
      const searchMatch = user.name.toLowerCase().includes(lowerSearchTerm) ||
                          user.email.toLowerCase().includes(lowerSearchTerm);
      
      const teamMatch = filters.team ? teamName === DUMMY_TEAMS.find(t => t.id === filters.team)?.name : true;
      const roleMatch = filters.role ? roleName === DUMMY_ROLES.find(r => r.id === filters.role)?.name : true;

      return searchMatch && teamMatch && roleMatch;
    });
  }, [users, searchTerm, filters]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
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

  const handleSaveUser = (userData: Omit<User, 'id'>, id?: number) => {
    setIsSaving(true);
    setTimeout(() => { // Simulasi async
      if (id) { // Edit
        setUsers(users.map(u => u.id === id ? { ...u, ...userData, id } : u));
      } else { // Create
        const newUser = { ...userData, id: Date.now() };
        setUsers([newUser, ...users]);
      }
      setIsSaving(false);
      setUserModalOpen(false);
    }, 1000);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setConfirmModalOpen(false);
      setUserToDelete(null);
    }
  };

  const filterConfig = [
    { key: 'team' as keyof Filters, options: [{ value: '', label: 'All Teams' }, ...DUMMY_TEAMS.map(t => ({ value: t.id, label: t.name }))] },
    { key: 'role' as keyof Filters, options: [{ value: '', label: 'All Roles' }, ...DUMMY_ROLES.map(r => ({ value: r.id, label: r.name }))] },
  ];

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
            <div className="flex justify-between items-center">
                 <div className="flex-grow">
                    <TableControls
                        searchTerm={searchTerm}
                        searchPlaceholder="Search by name or email..."
                        filters={filters}
                        onSearchChange={setSearchTerm}
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
          users={paginatedUsers}
          onAction={handleOpenModal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredUsers.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        teams={DUMMY_TEAMS}
        roles={DUMMY_ROLES}
        isLoading={isSaving}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
      >
        <p>Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
};

export default UserManagementPage;