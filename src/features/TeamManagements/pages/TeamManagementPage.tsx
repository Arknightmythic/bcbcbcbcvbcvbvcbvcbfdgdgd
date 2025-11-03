// src/features/TeamManagements/pages/TeamManagementPage.tsx

import { useState, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import type { ActionType, Team, TeamPayload } from '../utils/types';

// Import hooks
import {
  useGetTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from '../hooks/useTeamManagement';

import TableControls from '../../../shared/components/TableControls';
import TeamTable from '../components/TeamTable';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import TeamManagementModal from '../components/TeamManagementModal';

// --- HAPUS DUMMY DATA ---

// Ubah 'access' menjadi 'page'
interface Filters {
  page: string;
}

const TeamManagementPage = () => {
    // Hapus state 'teams'
    const [searchInput, setSearchInput] = useState(''); // Untuk input
    const [searchTerm, setSearchTerm] = useState('');   // Untuk filter
    const [filters, setFilters] = useState<Filters>({ page: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
  
    const [isTeamModalOpen, setTeamModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  
    // --- Integrasi React Query ---
    const searchParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set('limit', String(itemsPerPage));
        params.set('offset', String((currentPage - 1) * itemsPerPage));
        // Backend GET /api/teams tidak support search, jadi kita tidak kirim
        return params;
    }, [currentPage, itemsPerPage]);

    const { data: teamsData, isLoading: isLoadingTeams } = useGetTeams(searchParams);
    const { mutate: createTeam, isPending: isCreating } = useCreateTeam();
    const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam();
    const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam();

    const isSaving = isCreating || isUpdating;

    const teams = useMemo(() => teamsData?.teams || [], [teamsData]);
    const totalItems = useMemo(() => teamsData?.total || 0, [teamsData]);

    const filteredTeams = useMemo(() => {
        return teams.filter(team => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          // Filter client-side
          const searchMatch = team.name.toLowerCase().includes(lowerSearchTerm);
          // Ubah 'filters.access' menjadi 'filters.page' dan 'team.access' ke 'team.pages'
          const pageMatch = filters.page ? team.pages.includes(filters.page) : true;
    
          return searchMatch && pageMatch;
        });
      }, [teams, searchTerm, filters]);

    const paginatedTeams = useMemo(() => {
        // Paginasi sudah ditangani server, tapi filter client-side,
        // jadi kita tetap filter data yang diterima
        return filteredTeams; 
        // NOTE: Jika data > itemsPerPage, logic paginasi client-side diperlukan
        // Tapi backend sudah paginasi, jadi ini seharusnya oke
    }, [filteredTeams]);

    const handleFilterChange = (filterName: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1); // Filter client-side, tidak perlu reset
    };

    // Handler untuk tombol search
    const handleSearchSubmit = () => {
        setSearchTerm(searchInput);
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

    // Handler onSave baru
    const handleSaveTeam = (teamData: TeamPayload, id?: number) => {
        if (id) { // Edit mode
            updateTeam({ id, data: teamData }, {
                onSuccess: () => setTeamModalOpen(false)
            });
        } else { // Create mode
            createTeam(teamData, {
                onSuccess: () => setTeamModalOpen(false)
            });
        }
    };
    
    const handleConfirmDelete = () => {
        if (teamToDelete) {
            deleteTeam(teamToDelete.id, {
                onSuccess: () => {
                    setConfirmModalOpen(false);
                    setTeamToDelete(null);
                }
            });
        }
    };

    // Buat opsi filter dari data 'pages' yang ada
    const accessRightsOptions = useMemo(() => [
        { value: '', label: 'All Access Rights' },
        ...Array.from(new Set(teams.flatMap(t => t.pages))).map(page => ({ value: page, label: page.replace(/-/g, ' ') }))
    ], [teams]);

    const filterConfig = [
        // Ubah key menjadi 'page'
        { key: 'page' as keyof Filters, options: accessRightsOptions },
    ];
  
    return (
      <>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="bg-gray-50 rounded-t-lg shadow-md">
            <div className="px-4 flex items-center justify-between gap-4">
                <div className="flex-grow">
                    <TableControls
                        searchTerm={searchInput}
                        searchPlaceholder="Search by team name..."
                        filters={filters}
                        onSearchChange={setSearchInput}
                        onSearchSubmit={handleSearchSubmit} // Hubungkan handler search
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
          
          {isLoadingTeams && teams.length === 0 ? (
             <div className="flex-1 flex justify-center items-center p-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
             </div>
          ) : (
            <TeamTable
                teams={paginatedTeams} // Kirim data dari API
                onAction={handleAction}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems} // Kirim total dari API
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
            />
          )}
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
          isConfirming={isDeleting} // Tambahkan status loading delete
        >
          <p>Are you sure you want to delete the team "{teamToDelete?.name}"? This action cannot be undone.</p>
        </ConfirmationModal>
      </>
    );
  };
  
  export default TeamManagementPage;