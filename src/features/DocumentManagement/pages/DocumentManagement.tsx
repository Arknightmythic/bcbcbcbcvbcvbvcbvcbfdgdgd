import { useMemo, useState } from "react";
import type { ActionType, Document, DocumentCategory } from "../types/types";
import DocumentTable from "../components/DocumentTable";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import TableControls, {
  type FilterConfig,
} from "../../../shared/components/TableControls";

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
      { value: "PDF", label: "PDF" },
      { value: "TXT", label: "TXT" },
     
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

const DUMMY_DOCUMENTS: Document[] = [
  {
    id: 1,
    upload_date: "2023-10-26T10:00:00Z",
    document_name: "Surat Perjanjian Kerja.pdf",
    staff: "Budi Santoso",
    document_type: "PDF",
    status: "pending",
    file_path: "documents/spk.pdf",
    category: "peraturan",
  },
  {
    id: 2,
    upload_date: "2023-10-25T11:30:00Z",
    document_name: "Invoice Q4 2023.pdf",
    staff: "Citra Lestari",
    document_type: "TXT",
    status: "approved",
    file_path: "documents/invoice.pdf",
    category: "uraian",
  },
  {
    id: 3,
    upload_date: "2023-10-24T09:00:00Z",
    document_name: "file2.pdf",
    staff: "Budi Santoso",
    document_type: "TXT",
    status: "rejected",
    file_path: "documents/file.txt",
    category: "panduan",
  },
];

const DocumentManagementPage = () => {
  const isLoading = false;
  const isError = false;
  const documents = DUMMY_DOCUMENTS;

  // State untuk modal konfirmasi
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: ActionType | null;
    document: Document | null;
  }>({ isOpen: false, action: null, document: null });

  // State BARU untuk filter dan paginasi
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    type: "",
    category: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Logika untuk izin (tetap sama)
  const hasManagerAccess = true;

  // Logika BARU untuk filtering dan paginasi
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const searchMatch =
        doc.document_name.toLowerCase().includes(lowerSearchTerm) ||
        doc.staff.toLowerCase().includes(lowerSearchTerm);
      const typeMatch = filters.type
        ? doc.document_type === filters.type
        : true;
      const categoryMatch = filters.category
        ? doc.category === filters.category
        : true;
      const statusMatch = filters.status ? doc.status === filters.status : true;

      return searchMatch && typeMatch && categoryMatch && statusMatch;
    });
  }, [documents, searchTerm, filters]);

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const handleFilterChange = (filterName: string, value: string) => {
    // highlight-end
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset ke halaman pertama
  };
  const handleOpenModal = (action: ActionType, doc: Document) => {
    setModalState({ isOpen: true, action, document: doc });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, action: null, document: null });
  };

  const handleConfirmAction = () => {
    const { action, document } = modalState;
    if (!document) return;

    console.log(`Performing ${action} on document ID: ${document.id}`);

    handleCloseModal();
  };

  const getModalContent = () => {
    const { action, document } = modalState;
    if (!document) return {};

    switch (action) {
      case "approve":
        return {
          title: "Confirm Approval",
          body: `Approve "${document.document_name}"?`,
          confirmText: "Approve",
          confirmColor: "bg-green-600 hover:bg-green-700",
        };
      case "reject":
        return {
          title: "Confirm Rejection",
          body: `Reject "${document.document_name}"?`,
          confirmText: "Reject",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };
      case "delete":
        return {
          title: "Confirm Deletion",
          body: `Delete "${document.document_name}"? This is final.`,
          confirmText: "Delete",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };
      default:
        return {};
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading documents...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600">Failed to load documents.</div>;
  }

  const modalContent = getModalContent();

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchTerm}
            searchPlaceholder="Search by name, staff..."
            filters={filters}
            onSearchChange={setSearchTerm}
            onFilterChange={handleFilterChange}
            filterConfig={filterConfig}
          />
        </div>

        <DocumentTable
          documents={paginatedDocuments} // Kirim data yang sudah dipaginasi
          hasManagerAccess={hasManagerAccess}
          onAction={handleOpenModal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredDocuments.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={modalContent.title}
        confirmText={modalContent.confirmText}
        confirmColor={modalContent.confirmColor}
      >
        <p>{modalContent.body}</p>
      </ConfirmationModal>
    </>
  );
};

export default DocumentManagementPage;
