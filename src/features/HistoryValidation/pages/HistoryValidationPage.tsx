// src/features/HistoryValidation/pages/HistoryValidationPage.tsx

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
  useSubmitValidation,
  useGetChatHistory,
  useDownloadChatHistory,
} from "../hooks/useHistoryValidation";

import HistoryValidationTable from "../components/HistoryValidationTable";
import ChatHistoryModal from "../components/ChatHistoryModal";
import TableControls, {
  type FilterConfig,
} from "../../../shared/components/tablecontrols/TableControls";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import toast from "react-hot-toast";
import TextExpandModal from "../../../shared/components/TextExpandModal";
import { Loader2, Download } from "lucide-react";
import ApproveWithCorrectionModal from "../../../shared/components/ApproveWithCorrectionModal";
import DownloadPopup from "../components/DownloadPopup";
import { useAuthStore } from "../../../shared/store/authStore";


interface HistoryPageFilters extends Record<string, any> {
    aiAnswer: string;
    validationStatus: string;
    start_date: string;
    end_date: string;
}

const filterConfig: FilterConfig<HistoryPageFilters>[] = [
  {
    key: "validationStatus",
    type: "select",
    options: [
      { value: "", label: "Semua Tipe" },
      { value: "Pending", label: "Ditinjau" },
      { value: "Validated", label: "Disetujui" },
      { value: "Rejected", label: "Ditolak" },
    ],
  },
  {
    key: "date_range",
    type: "date-range",
    startDateKey: "start_date",
    endDateKey: "end_date",
    placeholder: "FIlter Tanggal",
  },
];

const mapChatPairToValidationItem = (
  pair: ChatPair
): ValidationHistoryItem => {
  let status: ValidationStatus = "Pending";
  
  // @ts-ignore
  if (pair.is_validated === true) {
    status = "Validated";
  }
  // @ts-ignore
  else if (pair.is_validated === false) {
    status = "Rejected";
  }

  return {
    id: pair.question_id,
    answerId: pair.answer_id,
    tanggal: pair.created_at, 
    user: pair.platform_unique_id || "Anonymous User",
    session_id: pair.session_id,
    pertanyaan: pair.question_content,
    jawaban_ai: pair.answer_content,
    tidak_terjawab: pair.is_cannot_answer === true,
    status_validasi: status,
  };
};

const HistoryValidationPage = () => {

  const { user } = useAuthStore();
  const userRoleName = user?.role?.name;
  // State Modals
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);

  // State Data & Filter
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

  // Selected Items
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ValidationHistoryItem | null>(null);
  const [textModalState, setTextModalState] = useState<{
    isOpen: boolean; title: string; content: string;
  }>({ isOpen: false, title: "", content: "" });

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("page_size", String(itemsPerPage));
    if (searchTerm) {
      params.set("search", searchTerm);
    }
    return params;
  }, [currentPage, itemsPerPage, searchTerm]);

  const isValidatedParam = useMemo(() => {
    switch (filters.validationStatus) {
      case "Pending": return "null";
      case "Validated": return "1";
      case "Rejected": return "0";
      default: return "";
    }
  }, [filters.validationStatus]);

  const isAnsweredParam = useMemo(() => {
    switch (filters.aiAnswer) {
      case "answered": return "true";
      case "unanswered": return "false";
      default: return "";
    }
  }, [filters.aiAnswer]);

  const { data: historyData, isLoading: isLoadingTable } =
    useGetValidationHistory(
      searchParams, 
      sortOrder, 
      filters.start_date, 
      filters.end_date,
      isValidatedParam,
      isAnsweredParam
    ); 

  const { mutate: submitValidation, isPending: isSubmitting } = useSubmitValidation();
  const { mutate: downloadHistory, isPending: isDownloading } = useDownloadChatHistory();

  const { data: chatHistoryForModal, isLoading: isLoadingModal } =
    useGetChatHistory(selectedSessionId);

  const paginatedHistories = useMemo(() => {
    if (!historyData?.data) return [];
    return historyData.data.map(mapChatPairToValidationItem);
  }, [historyData]);

  const totalItems = historyData?.total || 0;

  // Handlers
  const handleSearchSubmit = () => { setSearchTerm(searchInput); setCurrentPage(1); };
  const handleFilterChange = (filterName: keyof HistoryPageFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value })); 
    setCurrentPage(1);
  };
  const handleSortToggle = () => { setSortOrder(prev => (prev === "latest" ? "oldest" : "latest")); setCurrentPage(1); };
  const handleItemsPerPageChange = (items: number) => { setItemsPerPage(items); setCurrentPage(1); };

  // Action Dispatcher
  const handleAction = (action: ActionType, item: ValidationHistoryItem) => {
    if (action === "view") {
      setSelectedSessionId(item.session_id);
      setChatModalOpen(true);
    } else if (action === "approve") {
      setSelectedHistoryItem(item);
      setIsApproveModalOpen(true); 
    } else if (action === "reject") {
      setSelectedHistoryItem(item);
      setIsRejectConfirmOpen(true);
    }
  };

  // Handle Approve
  const handleApproveSubmit = (item: ValidationHistoryItem, correction: string) => {
    const isModified = correction.trim() !== item.jawaban_ai.trim();
    const revisionPayload = isModified ? correction : "";

    submitValidation({
      question_id: item.id,
      question: item.pertanyaan,
      answer_id: item.answerId,
      answer: item.jawaban_ai,
      revision: revisionPayload,
      validate: true
    }, {
      onSuccess: () => {
        const msg = isModified ? "Revisi berhasil disimpan & divalidasi." : "Jawaban berhasil divalidasi.";
        toast.success(msg);
        setIsApproveModalOpen(false);
        setSelectedHistoryItem(null);
      },
      onError: () => toast.error("Gagal memproses validasi.")
    });
  };

  // Handle Reject
  const handleRejectConfirm = () => {
    if (!selectedHistoryItem) return;
    submitValidation({
      question_id: selectedHistoryItem.id,
      question: selectedHistoryItem.pertanyaan,
      answer_id: selectedHistoryItem.answerId,
      answer: selectedHistoryItem.jawaban_ai,
      revision: "",
      validate: false
    }, {
      onSuccess: () => {
        toast.success("Jawaban ditandai tidak valid.");
        setIsRejectConfirmOpen(false);
        setSelectedHistoryItem(null);
      },
      onError: () => toast.error("Gagal menolak.")
    });
  };

  // Handle Download
  const handleDownload = (startDate: string, endDate: string, type: string) => {
    downloadHistory(
      { startDate, endDate, type },
      {
        onSuccess: () => {
          toast.success("File berhasil didownload!");
          setIsDownloadPopupOpen(false);
        },
        onError: () => {
          toast.error("Gagal mendownload file.");
        }
      }
    );
  };

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <div className="flex items-center justify-between mb-3">
            <TableControls
              searchTerm={searchInput}
              searchPlaceholder="Cari berdasarkan nama, nomor, email...."
              filters={filters}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
              onFilterChange={handleFilterChange}
              filterConfig={filterConfig}
            />
            
            {/* Download Button */}
            <button
              onClick={() => setIsDownloadPopupOpen(true)}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {isLoadingTable ? (
          <div className="flex-1 flex justify-center items-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <HistoryValidationTable
            histories={paginatedHistories}
            onAction={handleAction}
            onViewText={(title, content) => setTextModalState({ isOpen: true, title, content })}
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

      {/* Modal Components */}
      <ChatHistoryModal 
        isOpen={chatModalOpen} 
        onClose={() => setChatModalOpen(false)} 
        chatHistory={isLoadingModal ? [] : chatHistoryForModal || []} 
      />
      
      <TextExpandModal 
        isOpen={textModalState.isOpen} 
        onClose={() => setTextModalState({ ...textModalState, isOpen: false })} 
        title={textModalState.title} 
        content={textModalState.content} 
      />

      <ApproveWithCorrectionModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        history={selectedHistoryItem}
        onConfirm={handleApproveSubmit}
        isConfirming={isSubmitting}
      />

      <ConfirmationModal
        isOpen={isRejectConfirmOpen}
        onClose={() => setIsRejectConfirmOpen(false)}
        onConfirm={handleRejectConfirm}
        title="Konfirmasi Penolakan"
        confirmText="Ya, Tolak"
        confirmColor="bg-red-600 hover:bg-red-700"
        isConfirming={isSubmitting}
      >
        <p>Apakah Anda yakin ingin menandai jawaban ini sebagai <strong>Tidak Valid (Reject)?</strong></p>
      </ConfirmationModal>

      {userRoleName === "superadmin" && (
        <DownloadPopup
        isOpen={isDownloadPopupOpen}
        onClose={() => setIsDownloadPopupOpen(false)}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
      )}
    </>
  );
};

export default HistoryValidationPage;