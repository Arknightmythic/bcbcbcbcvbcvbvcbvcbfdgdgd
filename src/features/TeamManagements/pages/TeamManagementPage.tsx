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

// --- PERUBAHAN 1: Hapus interface Filters ---
// interface Filters { page: string; }

const TeamManagementPage = () => {
    const [searchInput, setSearchInput] = useState(''); // Untuk input
    const [searchTerm, setSearchTerm] = useState('');   // Untuk filter
    // --- PERUBAHAN 2: Hapus state 'filters' ---
    // const [filters, setFilters] = useState<Filters>({ page: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
  
    const [isTeamModalOpen, setTeamModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  
    // --- Integrasi React Query ---
    // (searchParams sudah benar, hanya menggunakan searchTerm)
    const searchParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set('limit', String(itemsPerPage));
        params.set('offset', String((currentPage - 1) * itemsPerPage));
        if (searchTerm) params.set('search', searchTerm);
        return params;
    }, [currentPage, itemsPerPage, searchTerm]);

    const { data: teamsData, isLoading: isLoadingTeams } = useGetTeams(searchParams);
    const { mutate: createTeam, isPending: isCreating } = useCreateTeam();
    const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam();
    const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam();

    const isSaving = isCreating || isUpdating;

    const teams = useMemo(() => teamsData?.teams || [], [teamsData]);
    const totalItems = useMemo(() => teamsData?.total || 0, [teamsData]);

    // --- PERUBAHAN 3: Hapus 'filteredTeams' dan 'paginatedTeams' ---
    // const filteredTeams = useMemo(() => { ... });
    // const paginatedTeams = useMemo(() => { ... });

    // --- PERUBAHAN 4: Hapus 'handleFilterChange' ---
    // const handleFilterChange = (filterName: keyof Filters, value: string) => { ... };

    // Handler untuk tombol search (sudah benar)
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

    // Handler onSave baru (sudah benar)
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

    // --- PERUBAHAN 5: Hapus 'accessRightsOptions' dan 'filterConfig' ---
    // const accessRightsOptions = useMemo(() => ... );
    // const filterConfig = [ ... ];
  
    return (
      <>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="bg-gray-50 rounded-t-lg shadow-md">
            <div className="px-4 flex items-center justify-between gap-4">
                <div className="flex-grow">
                    {/* --- PERUBAHAN 6: Update props TableControls --- */}
                    <TableControls
                        searchTerm={searchInput}
                        searchPlaceholder="Search by team name..."
                        filters={{}} // Kirim objek kosong
                        onSearchChange={setSearchInput}
                        onSearchSubmit={handleSearchSubmit} 
                        onFilterChange={() => {}} // Kirim fungsi kosong
                        filterConfig={[]} // Kirim array kosong
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
            // --- PERUBAHAN 7: Gunakan 'teams' dari server ---
            <TeamTable
                teams={teams} // Kirim data dari API
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
          isConfirming={isDeleting} 
        >
          <p>Are you sure you want to delete the team "{teamToDelete?.name}"? This action cannot be undone.</p>
        </ConfirmationModal>
      </>
    );
  };
  
  export default TeamManagementPage;