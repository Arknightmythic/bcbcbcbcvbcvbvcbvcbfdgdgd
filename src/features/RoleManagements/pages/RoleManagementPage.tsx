import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { ActionType, Role, Permission, Team} from '../utils/types';// Reuse
import TableControls from '../../../shared/components/TableControls';
import RoleTable from '../components/RoleTable';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import RoleManagementModal from '../components/RoleManagementModal';
import ViewPermissionsModal from '../components/ViewPermissionModal';

// --- DUMMY DATA ---
const DUMMY_TEAMS: Team[] = [
    { id: '1', name: 'Superadmin' }, { id: '2', name: 'Finance' }, { id: '3', name: 'Legal' }, { id: '4', name: 'IT' },
];

const DUMMY_PERMISSIONS: Permission[] = [
    { id: 'p1', name: 'dashboard-read' }, { id: 'p2', name: 'user-management-master' },
    { id: 'p3', name: 'document-management-read' }, { id: 'p4', name: 'document-management-create' },
    { id: 'p5', name: 'agent-dashboard-access' }, { id: 'p6', 'name': 'role-management-delete'}
];

const DUMMY_ROLES: Role[] = [
    { id: 1, name: 'Admin', description: 'Administrator role', team_name: 'Superadmin', permissions: [DUMMY_PERMISSIONS[1], DUMMY_PERMISSIONS[5]] },
    { id: 2, name: 'Finance Staff', description: 'Handles financial documents', team_name: 'Finance', permissions: [DUMMY_PERMISSIONS[0], DUMMY_PERMISSIONS[2]] },
    { id: 3, name: 'Legal Counsel', description: 'Manages legal aspects', team_name: 'Legal', permissions: [DUMMY_PERMISSIONS[2], DUMMY_PERMISSIONS[3]] },
];
// --- END DUMMY DATA ---

interface Filters {
  team: string;
}

const RoleManagementPage = () => {
    const [roles, setRoles] = useState<Role[]>(DUMMY_ROLES);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Filters>({ team: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
  
    const [isModalOpen, setModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  
    const [isSaving, setIsSaving] = useState(false);
  
    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const searchMatch = role.name.toLowerCase().includes(lowerSearchTerm) || role.team_name.toLowerCase().includes(lowerSearchTerm);
          const teamMatch = filters.team ? role.team_name === filters.team : true;
          return searchMatch && teamMatch;
        });
      }, [roles, searchTerm, filters]);

    const paginatedRoles = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredRoles.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRoles, currentPage, itemsPerPage]);

    const handleFilterChange = (filterName: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
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

    const handleSaveRole = (roleData: any, id?: number) => {
        setIsSaving(true);
        setTimeout(() => {
            const teamName = DUMMY_TEAMS.find(t => t.id === roleData.teamId)?.name || 'N/A';
            const permissions = roleData.permissions.map((pId: string) => DUMMY_PERMISSIONS.find(p => p.id === pId)).filter(Boolean);

            if (id) {
                setRoles(roles.map(r => r.id === id ? { ...r, name: roleData.name, description: roleData.description, permissions, team_name: teamName } : r));
            } else {
                const newRole: Role = { id: Date.now(), name: roleData.name, description: roleData.description, team_name: teamName, permissions };
                setRoles([newRole, ...roles]);
            }
            setIsSaving(false);
            setModalOpen(false);
        }, 1000);
    };
    
    const handleConfirmDelete = () => {
        if (roleToDelete) {
            setRoles(roles.filter(r => r.id !== roleToDelete.id));
            setConfirmModalOpen(false);
            setRoleToDelete(null);
        }
    };

    const filterConfig = [
        { key: 'team' as keyof Filters, options: [{ value: '', label: 'All Teams' }, ...DUMMY_TEAMS.map(t => ({ value: t.name, label: t.name }))] },
    ];
  
    return (
      <>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="bg-gray-50 rounded-t-lg shadow-md">
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex-grow">
                    <TableControls
                        searchTerm={searchTerm}
                        searchPlaceholder="Search by role or team name..."
                        filters={filters}
                        onSearchChange={setSearchTerm}
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
          
          <RoleTable
            roles={paginatedRoles}
            onAction={handleAction}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRoles.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
  
        <RoleManagementModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveRole} role={selectedRole} teams={DUMMY_TEAMS} permissions={DUMMY_PERMISSIONS} isLoading={isSaving} />
        <ViewPermissionsModal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} role={selectedRole} />
        <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="Confirm Deletion" confirmText="Delete" confirmColor="bg-red-600 hover:bg-red-700">
          <p>Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.</p>
        </ConfirmationModal>
      </>
    );
  };
  
export default RoleManagementPage;