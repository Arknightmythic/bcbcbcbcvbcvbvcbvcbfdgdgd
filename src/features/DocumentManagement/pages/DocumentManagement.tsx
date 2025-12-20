import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import type { ActionType, Document, DocumentCategory, SortOrder } from "../types/types"; 
import { useGetDocuments, useApproveDocument, useRejectDocument, useDeleteDocument } from "../hooks/useDocument";
import { generateViewUrl} from "../api/document";
import DocumentTable from "../components/DocumentTable";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import TableControls, { type FilterConfig } from "../../../shared/components/tablecontrols/TableControls";
import PdfViewModal from "../../../shared/components/PDFViewModal";

export interface Filters extends Record<string, any> {
  request_type: string; // Diubah dari 'type'
  category: DocumentCategory | "";
  status: string;
  start_date: string; 
  end_date: string;   
}

const filterConfig: FilterConfig<Filters>[] = [
    {
        key: "request_type", // Ganti dari 'type' ke 'request_type'
        type: "select",
        options: [
            { value: "", label: "Semua Tipe Request" },
            { value: "NEW", label: "Baru" },
            { value: "UPDATE", label: "Versi" },
            { value: "DELETE", label: "Hapus" },
        ],
    },
    {
        key: "category",
        type: "select",
        options: [
            { value: "", label: "Semua Kategori" },
            { value: "panduan", label: "Panduan" },
            { value: "qna", label: "Tanya Jawab" },
            { value: "peraturan", label: "Peraturan" },
        ],
    },
    {
        key: "status",
        type: "select",
        options: [
            { value: "", label: "Semua Status" },
            { value: "Approved", label: "Disetujui" },
            { value: "Pending", label: "Menunggu" },
            { value: "Rejected", label: "Ditolak" },
        ],
    },
    {
        key: "date_range",
        type: "date-range",
        startDateKey: "start_date",
        endDateKey: "end_date",
        placeholder: "Filter Tanggal Permintaan", // Label diperbarui
    },
];

const DocumentManagementPage = () => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; action: ActionType | null; document: Document | null }>({ isOpen: false, action: null, document: null });
  
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filters, setFilters] = useState<Filters>({ request_type: "", category: "", status: "", start_date: "", end_date: "" });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // UBAH: Default sort ke requested_at
  const [sortColumn, setSortColumn] = useState<string>("requested_at");
  const [sortDirection, setSortDirection] = useState<SortOrder>("desc");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewableUrl, setViewableUrl] = useState<string | null>(null);
  const [viewableTitle, setViewableTitle] = useState<string>("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', String(itemsPerPage));
    params.set('offset', String((currentPage - 1) * itemsPerPage));
    
    if (searchTerm) params.set('search', searchTerm);
    if (filters.request_type) params.set('request_type', filters.request_type); // UBAH: Kirim request_type
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    
    // Backend akan memfilter requested_at berdasarkan parameter ini
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);

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

  const handleFilterChange = (filterName: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
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
              toast.success("Permintaan disetujui.");
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
              toast.success("Permintaan ditolak.");
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
    if (!document) return { title: "", body: "", confirmText: "", confirmColor: "" };

    // Ambil reqType dari document
    const reqType = document.request_type;

    const requestLabels: Record<string, string> = {
      NEW: "Penambahan",
      UPDATE: "Pembaruan Versi",
      DELETE: "Penghapusan",
    };

    /** * PERBAIKAN: 
     * Gunakan pengecekan (reqType && requestLabels[reqType]) 
     * untuk memastikan reqType tidak null/undefined sebelum melakukan indexing.
     */
    const reqLabel = (reqType && requestLabels[reqType]) || "Penghapusan";

    switch (action) {
      case "approve":
        return { 
          title: "Konfirmasi Persetujuan", 
          body: `Apakah Anda yakin ingin menyetujui permintaan ${reqLabel} untuk dokumen "${document.document_name}"?`, 
          confirmText: "Setujui", 
          confirmColor: "bg-green-600 hover:bg-green-700" 
        };
      case "reject":
        return { 
          title: "Konfirmasi Penolakan", 
          body: `Apakah Anda yakin ingin menolak permintaan ${reqLabel} untuk dokumen "${document.document_name}"?`, 
          confirmText: "Tolak", 
          confirmColor: "bg-orange-600 hover:bg-orange-700" 
        };
      case "delete":
        return { 
          title: "Konfirmasi Penghapusan", 
          body: `Apakah Anda yakin ingin menghapus "${document.document_name}" secara paksa? Tindakan ini akan menghapus dokumen dan seluruh versinya.`, 
          confirmText: "Hapus", 
          confirmColor: "bg-red-600 hover:bg-red-700" 
        };
      default:
        return { title: "", body: "", confirmText: "", confirmColor: "" };
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
                searchPlaceholder="Cari berdasarkan nama, staff, tim..."
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
        <p className="whitespace-pre-line">{modalContent.body}</p>
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