import { useMemo, useState } from "react";
import type {
  ActionType,
  ValidationHistory,
  ChatMessage,
} from "../utils/types";
import HistoryValidationTable from "../components/HistoryValidationTable";
import ChatHistoryModal from "../components/ChatHistoryModal";
import TableControls, {
  type FilterConfig,
} from "../../../shared/components/TableControls";

export interface Filters {
  status: string;
}

const filterConfig: FilterConfig<Filters>[] = [
  {
    key: "status",
    options: [
      { value: "", label: "All Status" },
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
    ],
  },
];

const DUMMY_HISTORY: ValidationHistory[] = [
  {
    id: 1,
    tanggal: "2023-10-27T10:00:00Z",
    user: "John Doe",
    session_id: "sess_12345",
    konteks: "Pertanyaan tentang produk",
    status: "open",
  },
  {
    id: 2,
    tanggal: "2023-10-26T11:30:00Z",
    user: "Jane Smith",
    session_id: "sess_67890",
    konteks: "Keluhan layanan",
    status: "closed",
  },
];

const DUMMY_CHAT_HISTORY: ChatMessage[] = [
  { id: "1", sender: "user", text: "Halo, saya mau tanya tentang produk A." },
  {
    id: "2",
    sender: "agent",
    text: "Tentu, produk A adalah produk terbaik kami. Ada yang spesifik yang ingin anda tanyakan?",
  },
  { id: "3", sender: "user", text: "Berapa harganya?" },
  { id: "4", sender: "agent", text: "Harganya 100 ribu rupiah." },
];

const HistoryValidationPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({ status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredHistories = useMemo(() => {
    return DUMMY_HISTORY.filter((history) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const searchMatch =
        history.user.toLowerCase().includes(lowerSearchTerm) ||
        history.session_id.toLowerCase().includes(lowerSearchTerm) ||
        history.konteks.toLowerCase().includes(lowerSearchTerm);
      const statusMatch = filters.status
        ? history.status === filters.status
        : true;

      return searchMatch && statusMatch;
    });
  }, [searchTerm, filters]);

  const paginatedHistories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistories, currentPage, itemsPerPage]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };
  const handleOpenModal = (action: ActionType, doc: ValidationHistory) => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchTerm}
            searchPlaceholder="Search by user, session id, konteks..."
            filters={filters}
            onSearchChange={setSearchTerm}
            onFilterChange={handleFilterChange}
            filterConfig={filterConfig}
          />
        </div>

        <HistoryValidationTable
          histories={paginatedHistories}
          onAction={handleOpenModal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredHistories.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <ChatHistoryModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        chatHistory={DUMMY_CHAT_HISTORY}
      />
    </>
  );
};

export default HistoryValidationPage;
