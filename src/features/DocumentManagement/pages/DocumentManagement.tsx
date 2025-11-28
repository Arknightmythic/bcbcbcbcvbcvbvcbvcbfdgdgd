// [UPDATE: src/features/DocumentManagement/pages/DocumentManagement.tsx]

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import type { ActionType, Document, DocumentCategory, SortOrder } from "../types/types"; // Import SortOrder
import { useGetDocuments, useApproveDocument, useRejectDocument, useDeleteDocument } from "../hooks/useDocument";
import { generateViewUrl} from "../api/document";
import DocumentTable from "../components/DocumentTable";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import TableControls, { type FilterConfig } from "../../../shared/components/tablecontrols/TableControls";
import PdfViewModal from "../../../shared/components/PDFViewModal";

// Update Interface Filters
export interface Filters extends Record<string, any> {
  type: string;
  category: DocumentCategory | "";
  status: string;
  start_date: string; // Tambahan
  end_date: string;   // Tambahan
}

const filterConfig: FilterConfig<Filters>[] = [
    {
        key: "type",
        type: "select",
        options: [
            { value: "", label: "All Types" },
            { value: "pdf", label: "PDF" },
            { value: "txt", label: "TXT" },
        ],
    },
    {
        key: "category",
        type: "select",
        options: [
            { value: "", label: "All Categories" },
            { value: "panduan", label: "Panduan" },
            { value: "uraian", label: "Uraian" },
            { value: "peraturan", label: "Peraturan" },
        ],
    },
    {
        key: "status",
        type: "select",
        options: [
            { value: "", label: "All Status" },
            { value: "Approved", label: "Approved" },
            { value: "Pending", label: "Pending" },
            { value: "Rejected", label: "Rejected" },
        ],
    },
    // --- TAMBAHAN: Config Date Range ---
    {
        key: "date_range",
        type: "date-range",
        startDateKey: "start_date",
        endDateKey: "end_date",
        placeholder: "Filter Tanggal",
    },
];

const DocumentManagementPage = () => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; action: ActionType | null; document: Document | null }>({ isOpen: false, action: null, document: null });
  
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // State Filters default
  const [filters, setFilters] = useState<Filters>({ type: "", category: "", status: "", start_date: "", end_date: "" });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- TAMBAHAN: State Sorting ---
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<SortOrder>("desc");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewableUrl, setViewableUrl] = useState<string | null>(null);
  const [viewableTitle, setViewableTitle] = useState<string>("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  // --- UPDATE: Search Params Logic ---
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', String(itemsPerPage));
    params.set('offset', String((currentPage - 1) * itemsPerPage));
    
    if (searchTerm) params.set('search', searchTerm);
    if (filters.type) params.set('data_type', filters.type);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    
    // Date Params
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);

    // Sort Params
    if (sortColumn) {
        params.set('sort_by', sortColumn);
        params.set('sort_direction', sortDirection);
    }

    return params;
  }, [currentPage, itemsPerPage, searchTerm, filters, sortColumn, sortDirection]);

  const { data: documentsData, isLoading, isError } = useGetDocuments(searchParams);
  const { mutate: approve, isPending: isApproving } = useApproveDocument();
  const { mutate: reject, isPending: isRejecting } = useRejectDocument();
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument();

  const documents = useMemo(() => documentsData?.documents || [], [documentsData]);
  const totalItems = useMemo(() => documentsData?.total || 0, [documentsData]);

  const hasManagerAccess = true;

  // Handler Filter
  const handleFilterChange = (filterName: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // --- TAMBAHAN: Handler Sort ---
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle asc/desc
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Kolom baru, default asc/desc
      setSortColumn(column);
      setSortDirection('asc'); 
    }
    setCurrentPage(1);
  };
  
  const handleOpenModal = (action: ActionType, doc: Document) => {
    setModalState({ isOpen: true, action, document: doc });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, action: null, document: null });
  };

  const handleConfirmAction = async () => { 
    const { action, document } = modalState;
    if (!document) return;

    if (action === "approve") {
        approve(document.id, {
            onSuccess: () => {
              toast.success("Dokumen disetujui.");
              handleCloseModal();
            },
            onError: (e: any) => {
              toast.error(e.response?.data?.message || "Gagal menyetujui.");
              handleCloseModal();
            },
        });
    } else if (action === "reject") {
        reject(document.id, {
            onSuccess: () => {
              toast.success("Dokumen ditolak.");
              handleCloseModal();
            },
            onError: (e: any) => {
              toast.error(e.response?.data?.message || "Gagal menolak.");
              handleCloseModal();
            },
        });
    } else if (action === "delete") {
        deleteDoc(document.id, {
            onSuccess: handleCloseModal,
            onError: handleCloseModal, 
        });
    }
  };
  
  const getModalContent = () => {
    const { action, document } = modalState;
    if (!document) return {};

    switch (action) {
      case "approve":
        return { 
          title: "Konfirmasi Persetujuan", 
          body: `Apakah Anda yakin ingin menyetujui "${document.document_name}"?`, 
          confirmText: "Setujui", 
          confirmColor: "bg-green-600 hover:bg-green-700" 
        };
      case "reject":
        return { 
          title: "Konfirmasi Penolakan", 
          body: `Apakah Anda yakin ingin menolak "${document.document_name}"?`, 
          confirmText: "Tolak", 
          confirmColor: "bg-orange-600 hover:bg-orange-700" 
        };
      case "delete":
        return { 
          title: "Konfirmasi Penghapusan", 
          body: `Apakah Anda yakin ingin menghapus "${document.document_name}"? Tindakan ini akan menghapus dokumen utama dan SEMUA versinya.`, 
          confirmText: "Hapus", 
          confirmColor: "bg-red-600 hover:bg-red-700" 
        };
      default:
        return {};
    }
  };
  
  const modalContent = getModalContent();

  const handleOpenViewFile = async (doc: Document) => {
    setIsViewModalOpen(true);
    setIsGeneratingUrl(true);
    setViewableTitle(doc.document_name);
    
    try {
      const response = await generateViewUrl(doc.filename); 
      setViewableUrl(response.data.url);
    } catch (error) {
      console.error("Failed to get view URL:", error);
      toast.error("tidak dapat memuat pratinjau dokumen.");
      setIsViewModalOpen(false); 
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewableUrl(null);
    setViewableTitle("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500">Loading documents...</span>
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-center text-red-600">Failed to load documents. Please try again later.</div>;
  }

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
            <TableControls
                searchTerm={searchInput}
                searchPlaceholder="Cari bedasarkan nama, staff, tim..."
                filters={filters}
                onSearchChange={setSearchInput}
                onSearchSubmit={handleSearchSubmit} 
                onFilterChange={handleFilterChange}
                filterConfig={filterConfig}
            />
        </div>

        <DocumentTable
          documents={documents}
          hasManagerAccess={hasManagerAccess}
          onAction={handleOpenModal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onViewFile={handleOpenViewFile}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        isConfirming={isApproving || isRejecting || isDeleting} 
        title={modalContent.title}
        confirmText={modalContent.confirmText}
        confirmColor={modalContent.confirmColor}
      >
        <p>{modalContent.body}</p>
      </ConfirmationModal>

      <PdfViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        url={viewableUrl}
        isLoading={isGeneratingUrl}
        title={viewableTitle}
      />
    </>
  );
};

export default DocumentManagementPage;