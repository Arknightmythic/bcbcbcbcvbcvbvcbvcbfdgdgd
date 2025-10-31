import React, { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// Mengimpor hooks yang telah dibuat untuk interaksi API
import { useGetDocuments, useUploadDocument, useUpdateDocument, useGetDocumentDetails } from "../hooks/useDocument";

import UploadZone from "../components/UploadZone";
import UploadProgress from "../components/UploadProgress";
import DocumentsTable from "../components/DocumentsTable";
import VersioningDocumentModal from "../components/VersioningDocument";
import VersioningModal from "../components/VersioningModal";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import TableControls, { type FilterConfig } from "../../../shared/components/TableControls";
import type { UploadedDocument, DocumentCategory, DocumentVersion } from "../types/types";

// Tipe untuk aksi pada modal konfirmasi
type ModalAction = "upload" | "deleteSingle" | "deleteMultiple";

// Konfigurasi untuk filter tabel
export interface Filters {
  date: string;
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
            { value: "docx", label: "DOCX" },
            { value: "txt", label: "TXT" },
            { value: "doc", label: "DOC" },
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


const UploadPage: React.FC = () => {
  // State untuk file yang akan diunggah
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "">("");

  // State untuk tabel dan paginasi
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState(""); // State untuk input
  const [searchTerm, setSearchTerm] = useState("");   // State untuk query API
  const [filters, setFilters] = useState<Filters>({ date: "", type: "", category: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk modals
  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);
  const [isVersioningModalOpen, setVersioningModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<UploadedDocument | null>(null);
  const [currentDocumentIdForDetails, setCurrentDocumentIdForDetails] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{ isOpen: boolean; action: ModalAction | null; data: any }>({
    isOpen: false,
    action: null,
    data: null,
  });

  // React Query hooks
  const queryClient = useQueryClient();

  // Fungsi baru untuk submit pencarian
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset ke halaman pertama saat search
  };

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', String(itemsPerPage));
    params.set('offset', String((currentPage - 1) * itemsPerPage));
    if (searchTerm) params.set('search', searchTerm);
    if (filters.type) params.set('data_type', filters.type);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    return params;
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  const { data: documentsData, isLoading: isLoadingDocs, isError } = useGetDocuments(searchParams);
  const { mutate: uploadFiles, isPending: isUploading } = useUploadDocument();
  const { mutate: replaceDocument, isPending: isReplacing } = useUpdateDocument();
  const { data: versionHistoryData } = useGetDocumentDetails(currentDocumentIdForDetails);

  const documents = useMemo(() => documentsData?.documents || [], [documentsData]);
  const totalItems = useMemo(() => documentsData?.total || 0, [documentsData]);

  const handleOpenModal = (action: ModalAction, data: any = null) => setModalState({ isOpen: true, action, data });
  const handleCloseModal = () => setModalState({ isOpen: false, action: null, data: null });

  const handleConfirmAction = async () => {
    if (modalState.action === "upload") {
      const formData = new FormData();
      filesToUpload.forEach(file => formData.append('file', file));
      formData.append('category', selectedCategory as DocumentCategory);

      uploadFiles(formData, {
        onSuccess: () => {
          toast.success(`Successfully uploaded ${filesToUpload.length} file(s).`);
          setFilesToUpload([]);
          setSelectedCategory("");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Upload failed.");
        }
      });
    }
    handleCloseModal();
  };
  
  const getModalContent = () => {
      const { action, data } = modalState;
      switch (action) {
          case "upload":
              return { title: "Confirm Upload", body: `Are you sure you want to upload the file(s) to the "${data.category}" category?`, confirmText: "Upload", confirmColor: "bg-blue-600 hover:bg-blue-700" };
          default: return {};
      }
  };

  const handleUpload = () => {
    if (filesToUpload.length === 0 || !selectedCategory) return;
    handleOpenModal("upload", { category: selectedCategory });
  };

  const handleFileSelect = useCallback((selectedFiles: FileList) => setFilesToUpload((prev) => [...prev, ...Array.from(selectedFiles)]), []);
  const handleRemoveFile = useCallback((fileName: string) => setFilesToUpload((prev) => prev.filter((f) => f.name !== fileName)), []);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value as any }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDocs(e.target.checked ? documents.map((d) => d.id) : []);
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, docId: number) => {
    setSelectedDocs(prev => e.target.checked ? [...prev, docId] : prev.filter((id) => id !== docId));
  };
  
  const handleCloseModals = () => {
    setReplaceModalOpen(false);
    setVersioningModalOpen(false);
    setCurrentDocument(null);
    setCurrentDocumentIdForDetails(null);
  };

  const handleOpenNewVersionModal = (doc: UploadedDocument) => {
    setCurrentDocument(doc);
    setReplaceModalOpen(true);
  };

  const handleOpenVersioningModal = (doc: UploadedDocument) => {
    setCurrentDocument(doc);
    setCurrentDocumentIdForDetails(doc.id);
    setVersioningModalOpen(true);
  };

  const handleConfirmNewVersion = async (newFile: File) => {
    if (!currentDocument) return;
    const formData = new FormData();
    formData.append("id", currentDocument.id.toString());
    formData.append("file", newFile);
    
    replaceDocument(formData, {
        onSuccess: () => {
            toast.success(`New version for "${currentDocument.document_name}" has been uploaded.`);
            handleCloseModals();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to upload new version.");
        }
    });
  };

  const modalContent = getModalContent();

  return (
    <>
      <div className="mt-6">
        <UploadZone
          stagedFiles={filesToUpload}
          isUploading={isUploading}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onFilesSelected={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          onUpload={handleUpload}
        />
      </div>

      {isUploading && <UploadProgress progress={uploadProgress} />}

      <div className="mt-8">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchInput}
            searchPlaceholder="Search by name, staff, team..."
            filters={filters}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onFilterChange={handleFilterChange as any}
            filterConfig={filterConfig}
          />
        </div>

        <DocumentsTable
          documents={documents}
          selectedDocs={selectedDocs}
          isLoading={isLoadingDocs}
          isError={isError}
          isDeleting={false}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onDeleteMultiple={() => {}}
          onDeleteSingle={() => {}}
          onNewVersion={handleOpenNewVersionModal}
          onViewVersions={handleOpenVersioningModal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {currentDocument && (
        <VersioningDocumentModal
          isOpen={isReplaceModalOpen}
          onClose={handleCloseModals}
          document={currentDocument}
          pendingDocument={null}
          onVersioning={handleConfirmNewVersion}
          isReplacing={isReplacing}
          isPending={false}
        />
      )}

      {currentDocument && (
        <VersioningModal
          isOpen={isVersioningModalOpen}
          onClose={handleCloseModals}
          versions={versionHistoryData?.data || []}
          documentTitle={currentDocument.document_name}
        />
      )}

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

export default UploadPage;