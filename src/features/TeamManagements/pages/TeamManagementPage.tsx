import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import type { ActionType, Team, TeamPayload } from "../utils/types";

import {
  useGetTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from "../hooks/useTeamManagement";

import TableControls from "../../../shared/components/tablecontrols/TableControls";
import TeamTable from "../components/TeamTable";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import TeamManagementModal from "../components/TeamManagementModal";

const TeamManagementPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isTeamModalOpen, setTeamModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(itemsPerPage));
    params.set("offset", String((currentPage - 1) * itemsPerPage));
    if (searchTerm) params.set("search", searchTerm);
    return params;
  }, [currentPage, itemsPerPage, searchTerm]);

  const { data: teamsData, isLoading: isLoadingTeams } =
    useGetTeams(searchParams);
  const { mutate: createTeam, isPending: isCreating } = useCreateTeam();
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam();
  const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam();

  const isSaving = isCreating || isUpdating;

  const teams = useMemo(() => teamsData?.teams || [], [teamsData]);
  const totalItems = useMemo(() => teamsData?.total || 0, [teamsData]);

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleAction = (action: ActionType, team: Team) => {
    if (action === "edit") {
      setSelectedTeam(team);
      setTeamModalOpen(true);
    } else if (action === "delete") {
      setTeamToDelete(team);
      setConfirmModalOpen(true);
    }
  };

  const handleSaveTeam = (teamData: TeamPayload, id?: number) => {
    if (id) {
      updateTeam(
        { id, data: teamData },
        {
          onSuccess: () => setTeamModalOpen(false),
        }
      );
    } else {
      createTeam(teamData, {
        onSuccess: () => setTeamModalOpen(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete.id, {
        onSuccess: () => {
          setConfirmModalOpen(false);
          setTeamToDelete(null);
        },
      });
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="bg-gray-50 rounded-t-lg shadow-md">
          {/* --- PERUBAHAN DI SINI: Bungkus dengan flex container --- */}
          <div className="px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-grow">
              <TableControls
                searchTerm={searchInput}
                searchPlaceholder="Cari berdasarkan nama tim..."
                filters={{}}
                onSearchChange={setSearchInput}
                onSearchSubmit={handleSearchSubmit}
                onFilterChange={() => {}}
                filterConfig={[]}
              />
            </div>
            {/* --- PERUBAHAN DI SINI: Atur lebar tombol --- */}
            <div className="w-full lg:w-auto flex-shrink-0 text-xs">
              <button
                onClick={() => {
                  setSelectedTeam(null);
                  setTeamModalOpen(true);
                }}
                /* Tambahkan w-full lg:w-auto dan justify-center */
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center w-full lg:w-auto"
              >
                <Plus className="w-3 h-3 mr-2" />
                Buat Tim
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
            teams={teams}
            onAction={handleAction}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
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
        title="Konfirmasi Penghapusan"
        confirmText="Hapus"
        confirmColor="bg-red-600 hover:bg-red-700"
        isConfirming={isDeleting}
      >
        <p>
          Apakah Anda yakin akan menghapus tim "{teamToDelete?.name}"? Aksi ini tidak dapat dibatalkan
        </p>
      </ConfirmationModal>
    </>
  );
};

export default TeamManagementPage;
