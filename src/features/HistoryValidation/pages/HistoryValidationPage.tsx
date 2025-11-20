// [GANTI: src/features/HistoryValidation/pages/HistoryValidationPage.tsx]

import { useMemo, useState } from "react";
import type {
  ActionType,
  ValidationHistoryItem,
  ChatPair,
  ValidationStatus,
  SortOrder,
} from "../utils/types";
import {
  useGetValidationHistory,
  useUpdateFeedback,
  useGetChatHistory,
} from "../hooks/useHistoryValidation";

import HistoryValidationTable from "../components/HistoryValidationTable";
import ChatHistoryModal from "../components/ChatHistoryModal";
import TableControls, {
  type FilterConfig,
} from "../../../shared/components/TableControls";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import toast from "react-hot-toast";
import TextExpandModal from "../../../shared/components/TextExpandModal";
import { Loader2 } from "lucide-react";
import ApproveWithCorrectionModal from "../../../shared/components/ApproveWithCorrectionModal";

// Definisikan tipe Filters lokal untuk halaman ini
// extends Record<string, any> agar kompatibel dengan index signature TableControls
interface HistoryPageFilters extends Record<string, any> {
    aiAnswer: string;
    validationStatus: string;
    start_date: string;
    end_date: string;
}

// PERBAIKAN: Menambahkan Generic Type <HistoryPageFilters>
const filterConfig: FilterConfig<HistoryPageFilters>[] = [
  {
    key: "aiAnswer",
    type: "select",
    options: [
      { value: "", label: "AI Answer" },
      { value: "answered", label: "Answered" },
      { value: "unanswered", label: "Unanswered" },
    ],
  },
  {
    key: "validationStatus",
    type: "select",
    options: [
      { value: "", label: "All Status" },
      { value: "Pending", label: "Pending" },
      { value: "Validated", label: "Validated" },
      { value: "Rejected", label: "Rejected" },
    ],
  },
  {
    key: "date_range", // Key dummy untuk config (tidak masuk ke state filter)
    type: "date-range",
    startDateKey: "start_date",
    endDateKey: "end_date",
    placeholder: "Select Date Range",
  },
];

const mapChatPairToValidationItem = (
  pair: ChatPair
): ValidationHistoryItem => {
  let status: ValidationStatus = "Pending";
  if (pair.feedback === true) status = "Validated";
  if (pair.feedback === false) status = "Rejected";

  return {
    id: pair.question_id,
    answerId: pair.answer_id,
    tanggal: pair.question_time,
    user: "User", // Dummy user name
    session_id: pair.session_id,
    pertanyaan: pair.question_content,
    jawaban_ai: pair.answer_content,
    tidak_terjawab: pair.is_cannot_answer === true,
    status_validasi: status,
  };
};

const HistoryValidationPage = () => {
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filters, setFilters] = useState<HistoryPageFilters>({
    aiAnswer: "",
    validationStatus: "",
    start_date: "", 
    end_date: "",
  });
  
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [textModalState, setTextModalState] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({ isOpen: false, title: "", content: "" });

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<ValidationHistoryItem | null>(null);

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("page_size", String(itemsPerPage));
    return params;
  }, [currentPage, itemsPerPage]);

  const { data: historyData, isLoading: isLoadingTable } =
    useGetValidationHistory(
        searchParams, 
        sortOrder, 
        filters.start_date, 
        filters.end_date
    ); 

  const { mutate: updateFeedback, isPending: isUpdatingFeedback } = useUpdateFeedback();

  const { data: chatHistoryForModal, isLoading: isLoadingModal } =
    useGetChatHistory(selectedSessionId);

  const filteredHistories = useMemo(() => {
    const tableData = historyData?.data.map(mapChatPairToValidationItem) || [];

    return tableData.filter((history) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const searchMatch =
        history.user.toLowerCase().includes(lowerSearchTerm) ||
        history.session_id.toLowerCase().includes(lowerSearchTerm) ||
        history.pertanyaan.toLowerCase().includes(lowerSearchTerm) ||
        history.jawaban_ai.toLowerCase().includes(lowerSearchTerm);

      const answerMatch = filters.aiAnswer
        ? filters.aiAnswer === "answered"
          ? !history.tidak_terjawab
          : history.tidak_terjawab
        : true;
      const statusMatch = filters.validationStatus
        ? history.status_validasi === filters.validationStatus
        : true;
      
      return searchMatch && answerMatch && statusMatch;
    });
  }, [searchTerm, filters, historyData]);

  const paginatedHistories = useMemo(() => {
    return filteredHistories;
  }, [filteredHistories]);
  
  const totalItems = historyData?.total || 0;

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName: keyof HistoryPageFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };
  
  const handleSortToggle = () => {
    setSortOrder(prev => (prev === "latest" ? "oldest" : "latest"));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleCloseApproveModal = () => {
    setIsApproveModalOpen(false);
    setSelectedHistoryItem(null);
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedHistoryItem(null);
  };

  const handleAction = (action: ActionType, item: ValidationHistoryItem) => {
    if (action === "view") {
      setSelectedSessionId(item.session_id);
      setChatModalOpen(true);
    } else if (action === "approve") {
      setSelectedHistoryItem(item);
      setIsApproveModalOpen(true);
    } else if (action === "reject") {
      setSelectedHistoryItem(item);
      setIsRejectModalOpen(true);
    }
  };

  const handleApproveConfirm = (
    item: ValidationHistoryItem,
    correction: string
  ) => {
    updateFeedback(
      { id: item.answerId, feedback: true, correction: correction },
      {
        onSuccess: () => {
          toast.success("Pertanyaan telah divalidasi.");
          handleCloseApproveModal();
        },
        onError: (e: any) =>
          toast.error(e.response?.data?.message || "Gagal memvalidasi."),
      }
    );
  };

  const handleRejectConfirm = () => {
    if (!selectedHistoryItem) return;

    updateFeedback(
      { id: selectedHistoryItem.answerId, feedback: false },
      {
        onSuccess: () => {
          toast.success("Pertanyaan ditandai tidak valid.");
          handleCloseRejectModal();
        },
        onError: (e: any) =>
          toast.error(e.response?.data?.message || "Gagal menolak."),
      }
    );
  };

  const handleCloseChatModal = () => {
    setChatModalOpen(false);
    setSelectedSessionId(null);
  };

  const handleViewText = (title: string, content: string) => {
    setTextModalState({ isOpen: true, title, content });
  };

  const handleCloseTextModal = () => {
    setTextModalState({ isOpen: false, title: "", content: "" });
  };

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchInput}
            searchPlaceholder="Search by user, session ID, or question...."
            filters={filters}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onFilterChange={handleFilterChange}
            filterConfig={filterConfig}
          />
        </div>

        {isLoadingTable && (
          <div className="flex-1 flex justify-center items-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!isLoadingTable && (
          <HistoryValidationTable
            histories={paginatedHistories}
            onAction={handleAction}
            onViewText={handleViewText}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            currentSort={sortOrder}
            onSortToggle={handleSortToggle}
          />
        )}
      </div>

      <ChatHistoryModal
        isOpen={chatModalOpen}
        onClose={handleCloseChatModal}
        chatHistory={isLoadingModal ? [] : chatHistoryForModal || []}
      />

      <TextExpandModal
        isOpen={textModalState.isOpen}
        onClose={handleCloseTextModal}
        title={textModalState.title}
        content={textModalState.content}
      />

      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={handleCloseRejectModal}
        onConfirm={handleRejectConfirm}
        title="Konfirmasi Penolakan"
        confirmText="Ya, Tolak"
        confirmColor="bg-red-600 hover:bg-red-700"
        isConfirming={isUpdatingFeedback}
      >
        <p>Apakah Anda yakin ingin menandai jawaban ini sebagai <strong>Tidak Valid (Reject)?</strong> Tindakan ini tidak dapat dibatalkan.</p>
      </ConfirmationModal>

      <ApproveWithCorrectionModal
        isOpen={isApproveModalOpen}
        onClose={handleCloseApproveModal}
        history={selectedHistoryItem}
        onConfirm={handleApproveConfirm}
        isConfirming={isUpdatingFeedback}
      />
    </>
  );
};

export default HistoryValidationPage;