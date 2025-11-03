import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import type { ActionType, Document, DocumentCategory } from "../types/types";
import { useGetDocuments, useApproveDocument, useRejectDocument } from "../hooks/useDocument";
import { generateViewUrl, getDocumentDetails } from "../api/document";
import DocumentTable from "../components/DocumentTable";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import TableControls, { type FilterConfig } from "../../../shared/components/TableControls";
import PdfViewModal from "../../../shared/components/PDFViewModal";

export interface Filters {
  type: string;
  category: DocumentCategory | "";
  status: string;
}

const filterConfig: FilterConfig<Filters>[] = [
    {
        key: "type",
        options: [
            { value: "", label: "All Types" },
            { value: "pdf", label: "PDF" },
            { value: "txt", label: "TXT" },
        ],
    },
    {
        key: "category",
        options: [
            { value: "", label: "All Categories" },
            { value: "panduan", label: "Panduan" },
            { value: "uraian", label: "Uraian" },
            { value: "peraturan", label: "Peraturan" },
        ],
    },
    {
        key: "status",
        options: [
            { value: "", label: "All Status" },
            { value: "approved", label: "Approved" },
            { value: "pending", label: "Pending" },
            { value: "rejected", label: "Rejected" },
        ],
    },
];

const DocumentManagementPage = () => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; action: ActionType | null; document: Document | null }>({ isOpen: false, action: null, document: null });
  
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({ type: "", category: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    if (filters.type) params.set('data_type', filters.type);
    if (filters.category) params.set('category', filters.category);
    return params;
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  const { data: documentsData, isLoading, isError } = useGetDocuments(searchParams);
  const { mutate: approve, isPending: isApproving } = useApproveDocument();
  const { mutate: reject, isPending: isRejecting } = useRejectDocument();

  const documents = useMemo(() => documentsData?.documents || [], [documentsData]);
  const totalItems = useMemo(() => documentsData?.total || 0, [documentsData]);

  const hasManagerAccess = true;

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value as any }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
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

    try {
        const details = await getDocumentDetails(document.id);
        if (!details || details.length === 0) {
            throw new Error("Document details not found.");
        }
        
        const detailId = details[0].id;

        if (action === "approve") {
            approve(detailId, {
                onSuccess: () => toast.success("Document approved successfully."),
                onError: (e: any) => toast.error(e.response?.data?.message || "Failed to approve."),
            });
        } else if (action === "reject") {
            reject(detailId, {
                onSuccess: () => toast.success("Document rejected successfully."),
                onError: (e: any) => toast.error(e.response?.data?.message || "Failed to reject."),
            });
        }
    } catch (error) {
        toast.error("An error occurred while fetching document details.");
    } finally {
        handleCloseModal();
    }
  };
  
  const getModalContent = () => {
    const { action, document } = modalState;
    if (!document) return {};

    switch (action) {
      case "approve":
        return { title: "Confirm Approval", body: `Are you sure you want to approve "${document.document_name}"?`, confirmText: "Approve", confirmColor: "bg-green-600 hover:bg-green-700" };
      case "reject":
        return { title: "Confirm Rejection", body: `Are you sure you want to reject "${document.document_name}"?`, confirmText: "Reject", confirmColor: "bg-orange-600 hover:bg-orange-700" };
      case "delete":
        return { title: "Confirm Deletion", body: `Are you sure you want to delete "${document.document_name}"? This action cannot be undone.`, confirmText: "Delete", confirmColor: "bg-red-600 hover:bg-red-700" };
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
      const response = await generateViewUrl(doc.filename); //
      setViewableUrl(response.data.url);
    } catch (error) {
      console.error("Failed to get view URL:", error);
      toast.error("Could not generate secure URL.");
      setIsViewModalOpen(false); // Tutup modal jika gagal
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
                searchPlaceholder="Search by name, staff..."
                filters={filters}
                onSearchChange={setSearchInput}
                onSearchSubmit={handleSearchSubmit} // Prop ditambahkan
                onFilterChange={handleFilterChange as any}
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
        />
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        isConfirming={isApproving || isRejecting} // Prop ditambahkan
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