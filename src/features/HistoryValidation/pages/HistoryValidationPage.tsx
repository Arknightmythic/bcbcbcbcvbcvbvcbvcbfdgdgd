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

// Interface Filter State
interface HistoryPageFilters extends Record<string, any> {
    aiAnswer: string;       // "" | "answered" | "unanswered"
    validationStatus: string; // "" | "Pending" | "Validated" | "Rejected"
    start_date: string;
    end_date: string;
}

const filterConfig: FilterConfig<HistoryPageFilters>[] = [
  {
    key: "aiAnswer",
    type: "select",
    options: [
      { value: "", label: "All Answers" },
      { value: "answered", label: "Answered" },
      { value: "unanswered", label: "Unanswered" },
    ],
  },
  {
    key: "validationStatus",
    type: "select",
    options: [
      { value: "", label: "All Status" },
      { value: "Pending", label: "On Review (Pending)" },
      { value: "Validated", label: "Approved" },
      { value: "Rejected", label: "Rejected" },
    ],
  },
  {
    key: "date_range",
    type: "date-range",
    startDateKey: "start_date",
    endDateKey: "end_date",
    placeholder: "Select Date Range",
  },
];

// Mapping data dari Backend ke UI
const mapChatPairToValidationItem = (
  pair: ChatPair
): ValidationHistoryItem => {
  let status: ValidationStatus = "Pending";
  
  // Mapping bedasarkan is_validated dari backend (sesuai logika Anda)
  // Asumsi backend mengirim is_validated: boolean | null
  // null -> Pending, true -> Validated, false -> Rejected
  // Namun di ChatPair interface Anda sebelumnya pakai `feedback`. 
  // Kita harus sesuaikan ChatPair di types.ts nanti agar punya field `is_validated`
  
  // Fallback logic jika field backend bernama 'is_validated'
  // @ts-ignore (Abaikan jika TS complain sementara sebelum update types.ts)
  if (pair.is_validated === true) status = "Validated";
  // @ts-ignore
  else if (pair.is_validated === false) status = "Rejected";
  else status = "Pending";

  return {
    id: pair.question_id,
    answerId: pair.answer_id,
    tanggal: pair.created_at,
    user: "User", 
    session_id: pair.session_id,
    pertanyaan: pair.question_content,
    jawaban_ai: pair.answer_content,
    tidak_terjawab: pair.is_cannot_answer === true,
    status_validasi: status,
  };
};

const HistoryValidationPage = () => {
  // State Modals
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);

  // State Data & Filter
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Search text params
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

  // --- 1. Siapkan Parameter untuk Hook ---
  
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("page_size", String(itemsPerPage));
    if (searchTerm) {
      params.set("search", searchTerm); // Pastikan backend support 'search' query
    }
    return params;
  }, [currentPage, itemsPerPage, searchTerm]);

  // --- 2. Mapping Logic Filter UI ke Backend Params ---
  
  // Mapping Status: Pending -> "null", Validated -> "1", Rejected -> "0"
  const isValidatedParam = useMemo(() => {
    switch (filters.validationStatus) {
      case "Pending": return "null";
      case "Validated": return "1";
      case "Rejected": return "0";
      default: return ""; // All
    }
  }, [filters.validationStatus]);

  // Mapping Answered: Answered -> "true", Unanswered -> "false"
  const isAnsweredParam = useMemo(() => {
    switch (filters.aiAnswer) {
      case "answered": return "true";
      case "unanswered": return "false";
      default: return ""; // All
    }
  }, [filters.aiAnswer]);

  // --- 3. Panggil API Hook dengan Parameter Lengkap ---
  
  const { data: historyData, isLoading: isLoadingTable } =
    useGetValidationHistory(
      searchParams, 
      sortOrder, 
      filters.start_date, 
      filters.end_date,
      isValidatedParam, // Kirim param status
      isAnsweredParam   // Kirim param answered
    ); 

  const { mutate: submitValidation, isPending: isSubmitting } = useSubmitValidation();

  const { data: chatHistoryForModal, isLoading: isLoadingModal } =
    useGetChatHistory(selectedSessionId);


  // --- 4. Data Processing (Hanya Mapping, Tidak ada Filtering Client-side lagi) ---
  
  const paginatedHistories = useMemo(() => {
    if (!historyData?.data) return [];
    return historyData.data.map(mapChatPairToValidationItem);
  }, [historyData]);

  const totalItems = historyData?.total || 0;

  // Handlers
  const handleSearchSubmit = () => { setSearchTerm(searchInput); setCurrentPage(1); };
  const handleFilterChange = (filterName: keyof HistoryPageFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value })); 
    setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
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
      setIsApproveConfirmOpen(true);
    } else if (action === "reject") {
      setSelectedHistoryItem(item);
      setIsRejectConfirmOpen(true);
    } else if (action === "revise") {
      setSelectedHistoryItem(item);
      setIsReviseModalOpen(true);
    }
  };

  // Handlers Submit (Sama seperti sebelumnya)
  const handleApproveConfirm = () => {
    if (!selectedHistoryItem) return;
    submitValidation({
      question_id: selectedHistoryItem.id,
      question: selectedHistoryItem.pertanyaan,
      answer_id: selectedHistoryItem.answerId,
      answer: selectedHistoryItem.jawaban_ai,
      revision: selectedHistoryItem.jawaban_ai,
      validate: true
    }, {
      onSuccess: () => {
        toast.success("Jawaban berhasil divalidasi.");
        setIsApproveConfirmOpen(false);
        setSelectedHistoryItem(null);
      },
      onError: () => toast.error("Gagal memvalidasi.")
    });
  };

  const handleRejectConfirm = () => {
    if (!selectedHistoryItem) return;
    submitValidation({
      question_id: selectedHistoryItem.id,
      question: selectedHistoryItem.pertanyaan,
      answer_id: selectedHistoryItem.answerId,
      answer: selectedHistoryItem.jawaban_ai,
      revision: selectedHistoryItem.jawaban_ai,
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

  const handleReviseConfirm = (item: ValidationHistoryItem, correction: string) => {
    submitValidation({
      question_id: item.id,
      question: item.pertanyaan,
      answer_id: item.answerId,
      answer: item.jawaban_ai,
      revision: correction,
      validate: true
    }, {
      onSuccess: () => {
        toast.success("Revisi berhasil disimpan & divalidasi.");
        setIsReviseModalOpen(false);
        setSelectedHistoryItem(null);
      },
      onError: () => toast.error("Gagal menyimpan revisi.")
    });
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

      {/* Modal components ... (Sama seperti sebelumnya) */}
      <ChatHistoryModal isOpen={chatModalOpen} onClose={() => setChatModalOpen(false)} chatHistory={isLoadingModal ? [] : chatHistoryForModal || []} />
      <TextExpandModal isOpen={textModalState.isOpen} onClose={() => setTextModalState({ ...textModalState, isOpen: false })} title={textModalState.title} content={textModalState.content} />
      <ConfirmationModal isOpen={isApproveConfirmOpen} onClose={() => setIsApproveConfirmOpen(false)} onConfirm={handleApproveConfirm} title="Konfirmasi Validasi" confirmText="Ya, Validasi" confirmColor="bg-green-600 hover:bg-green-700" isConfirming={isSubmitting}>
        <p>Apakah Anda yakin jawaban ini <strong>Benar</strong> dan siap divalidasi?</p>
      </ConfirmationModal>
      <ConfirmationModal isOpen={isRejectConfirmOpen} onClose={() => setIsRejectConfirmOpen(false)} onConfirm={handleRejectConfirm} title="Konfirmasi Penolakan" confirmText="Ya, Tolak" confirmColor="bg-red-600 hover:bg-red-700" isConfirming={isSubmitting}>
        <p>Apakah Anda yakin ingin menandai jawaban ini sebagai <strong>Tidak Valid (Reject)?</strong></p>
      </ConfirmationModal>
      <ApproveWithCorrectionModal isOpen={isReviseModalOpen} onClose={() => setIsReviseModalOpen(false)} history={selectedHistoryItem} onConfirm={handleReviseConfirm} isConfirming={isSubmitting} />
    </>
  );
};

export default HistoryValidationPage;