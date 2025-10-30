import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { ActionType, Team } from '../utils/types';
import TableControls from '../../../shared/components/TableControls';
import TeamTable from '../components/TeamTable';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import TeamManagementModal from '../components/TeamManagementModal';

// --- DUMMY DATA ---
const DUMMY_TEAMS: Team[] = [
    { id: 1, name: 'Finance', user_count: 5, access: ['dashboard', 'document-management'] },
    { id: 2, name: 'Legal', user_count: 3, access: ['knowledge-base', 'sipp-case-details'] },
    { id: 3, name: 'IT', user_count: 8, access: ['dashboard', 'user-management', 'team-management'] },
    { id: 4, name: 'Marketing', user_count: 12, access: ['market-competitor-insight'] },
];
// --- END DUMMY DATA ---

interface Filters {
  access: string;
}

const TeamManagementPage = () => {
    const [teams, setTeams] = useState<Team[]>(DUMMY_TEAMS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Filters>({ access: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
  
    const [isTeamModalOpen, setTeamModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  
    const [isSaving, setIsSaving] = useState(false);
  
    const filteredTeams = useMemo(() => {
        return teams.filter(team => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const searchMatch = team.name.toLowerCase().includes(lowerSearchTerm);
          const accessMatch = filters.access ? team.access.includes(filters.access) : true;
    
          return searchMatch && accessMatch;
        });
      }, [teams, searchTerm, filters]);

    const paginatedTeams = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeams.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTeams, currentPage, itemsPerPage]);

    const handleFilterChange = (filterName: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const handleAction = (action: ActionType, team: Team) => {
        if (action === 'edit') {
            setSelectedTeam(team);
            setTeamModalOpen(true);
        } else if (action === 'delete') {
            setTeamToDelete(team);
            setConfirmModalOpen(true);
        }
    };

    const handleSaveTeam = (teamData: Omit<Team, 'id' | 'user_count'>, id?: number) => {
        setIsSaving(true);
        setTimeout(() => { // Simulate API call
            if (id) { // Edit mode
                setTeams(teams.map(t => t.id === id ? { ...t, ...teamData } : t));
            } else { // Create mode
                const newTeam: Team = { ...teamData, id: Date.now(), user_count: 0 };
                setTeams([newTeam, ...teams]);
            }
            setIsSaving(false);
            setTeamModalOpen(false);
        }, 1000);
    };
    
    const handleConfirmDelete = () => {
        if (teamToDelete) {
            setTeams(teams.filter(t => t.id !== teamToDelete.id));
            setConfirmModalOpen(false);
            setTeamToDelete(null);
        }
    };

    const accessRightsOptions = [
        { value: '', label: 'All Access Rights' },
        ...Array.from(new Set(teams.flatMap(t => t.access))).map(right => ({ value: right, label: right.replace(/_/g, ' ') }))
    ];

    const filterConfig = [
        { key: 'access' as keyof Filters, options: accessRightsOptions },
    ];
  
    return (
      <>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="bg-gray-50 rounded-t-lg shadow-md">
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex-grow">
                    <TableControls
                        searchTerm={searchTerm}
                        searchPlaceholder="Search by team name..."
                        filters={filters}
                        onSearchChange={setSearchTerm}
                        onFilterChange={handleFilterChange}
                        filterConfig={filterConfig}
                    />
                </div>
                <div className="flex-shrink-0">
                    <button
                        onClick={() => { setSelectedTeam(null); setTeamModalOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Team
                    </button>
                </div>
            </div>
          </div>
          
          <TeamTable
            teams={paginatedTeams}
            onAction={handleAction}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTeams.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
  
        <TeamManagementModal
            isOpen={isTeamModalOpen}
            onClose={() => setTeamModalOpen(false)}
            onSave={handleSaveTeam}
            team={selectedTeam}
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
          <p>Are you sure you want to delete the team "{teamToDelete?.name}"? This action cannot be undone.</p>
        </ConfirmationModal>
      </>
    );
  };
  
  export default TeamManagementPage;