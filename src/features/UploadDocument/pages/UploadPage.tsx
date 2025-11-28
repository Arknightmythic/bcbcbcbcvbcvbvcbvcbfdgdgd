import React, { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
// Hapus useQueryClient yang tidak digunakan
// import { useQueryClient } from "@tanstack/react-query";

import {
  useGetDocuments,
  useUploadDocument,
  useUpdateDocument,
  useGetDocumentDetails,
  useDeleteDocument,
  useBatchDeleteDocuments,
} from "../hooks/useDocument";
import UploadZone from "../components/UploadZone";

import DocumentsTable from "../components/DocumentsTable";
import VersioningDocumentModal from "../components/VersioningDocument";
import VersioningModal from "../components/VersioningModal";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import type {
  UploadedDocument,
  DocumentCategory,
  SortOrder,
} from "../types/types";
import { generateViewUrl } from "../api/document";
import PdfViewModal from "../../../shared/components/PDFViewModal";
import TableControls, {
  type FilterConfig,
} from "../../../shared/components/tablecontrols/TableControls";

type ModalAction = "upload" | "deleteSingle" | "deleteMultiple";

// Update Interface Filters untuk mendukung date range
export interface Filters extends Record<string, any> {
  type: string;
  category: DocumentCategory | "";
  status: string;
  start_date: string;
  end_date: string;
}

const filterConfig: FilterConfig<Filters>[] = [
  {
    key: "type",
    type: "select",
    options: [
      { value: "", label: "Semua tipe" },
      { value: "pdf", label: "PDF" },
      { value: "txt", label: "TXT" },
    ],
  },
  {
    key: "category",
    type: "select",
    options: [
      { value: "", label: "Semua Kategori" },
      { value: "panduan", label: "Panduan" },
      { value: "uraian", label: "Uraian" },
      { value: "peraturan", label: "Peraturan" },
    ],
  },
  {
    key: "status",
    type: "select",
    options: [
      { value: "", label: "Semua status" },
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
    placeholder: "Filter Tanggal",
  },
];

const UploadPage: React.FC = () => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    DocumentCategory | ""
  >("");

  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState<Filters>({
    type: "",
    category: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<SortOrder>("desc");

  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);
  const [isVersioningModalOpen, setVersioningModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] =
    useState<UploadedDocument | null>(null);
  const [currentDocumentIdForDetails, setCurrentDocumentIdForDetails] =
    useState<number | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: ModalAction | null;
    data: any;
  }>({
    isOpen: false,
    action: null,
    data: null,
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewableUrl, setViewableUrl] = useState<string | null>(null);
  const [viewableTitle, setViewableTitle] = useState<string>("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  // Hapus queryClient yang tidak digunakan
  // const queryClient = useQueryClient();

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(itemsPerPage));
    params.set("offset", String((currentPage - 1) * itemsPerPage));

    if (searchTerm) params.set("search", searchTerm);
    if (filters.type) params.set("data_type", filters.type);
    if (filters.category) params.set("category", filters.category);
    if (filters.status) params.set("status", filters.status);

    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);

    if (sortColumn) {
      params.set("sort_by", sortColumn);
      params.set("sort_direction", sortDirection);
    }

    return params;
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    filters,
    sortColumn,
    sortDirection,
  ]);

  const {
    data: documentsData,
    isLoading: isLoadingDocs,
    isError,
  } = useGetDocuments(searchParams);
  const { mutate: uploadFiles, isPending: isUploading } = useUploadDocument();
  const { mutate: replaceDocument, isPending: isReplacing } =
    useUpdateDocument();
  const { data: versionHistoryData } = useGetDocumentDetails(
    currentDocumentIdForDetails
  );

  // [UPDATE] Rename isPending single delete agar tidak bentrok
  const { mutate: deleteDocument, isPending: isDeletingSingle } =
    useDeleteDocument();

  // [BARU] Panggil hook batch delete
  const { mutate: batchDelete, isPending: isDeletingBatch } =
    useBatchDeleteDocuments();

  // Gabungkan status loading delete
  const isDeleting = isDeletingSingle || isDeletingBatch;

  const documents = useMemo(
    () => documentsData?.documents || [],
    [documentsData]
  );
  const totalItems = useMemo(() => documentsData?.total || 0, [documentsData]);

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleOpenModal = (action: ModalAction, data: any = null) =>
    setModalState({ isOpen: true, action, data });
  const handleCloseModal = () =>
    setModalState({ isOpen: false, action: null, data: null });

  const handleConfirmAction = async () => {
    const { action, data } = modalState;

    if (action === "upload") {
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append("files", file));
      formData.append("category", selectedCategory as DocumentCategory);

      uploadFiles(formData, {
        onSuccess: () => {
          toast.success(
            `Berhasil Upload ${filesToUpload.length} dokumen.`
          );
          setFilesToUpload([]);
          setSelectedCategory("");
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Gagal mengunggah dokumen.");
          handleCloseModal();
        },
      });
      return;
    }

    if (action === "deleteSingle") {
      if (!data?.id) return;
      deleteDocument(data.id, {
        onSuccess: () => handleCloseModal(),
        onError: () => handleCloseModal(),
      });
    }

    if (action === "deleteMultiple") {
      if (selectedDocs.length === 0) {
        handleCloseModal();
        return;
      }

      // Panggil API Batch Delete
      batchDelete(selectedDocs, {
        onSuccess: (response: any) => {
          // Tampilkan pesan sukses dari backend atau default
          const message =
            response?.message ||
            `Successfully deleted ${selectedDocs.length} document(s).`;
          toast.success(message);

          setSelectedDocs([]); // Reset seleksi
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Gagal menghapus dokumen."
          );
          handleCloseModal();
        },
      });
    }
  };

  const getModalContent = () => {
    const { action, data } = modalState;
    switch (action) {
      case "upload":
        return {
          title: "Konfirmasi Unggah",
          body: `Apakah Anda yakin ingin mengunggah file ke kategori "${data.category}"?`,
          confirmText: "Unggah",
          confirmColor: "bg-blue-600 hover:bg-blue-700",
        };

      case "deleteSingle":
        return {
          title: "Konfirmasi Hapus",
          body: `Apakah Anda yakin ingin menghapus "${data?.document_name}"? Tindakan ini akan menghapus dokumen utama dan SEMUA versinya.`,
          confirmText: "Hapus",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };

      case "deleteMultiple":
        return {
          title: "Konfirmasi Hapus",
          body: `Apakah Anda yakin ingin menghapus ${selectedDocs.length} dokumen yang dipilih? Tindakan ini akan menghapus seluruh dokumen utama dan SEMUA versinya.`,
          confirmText: `Hapus (${selectedDocs.length})`,
          confirmColor: "bg-red-600 hover:bg-red-700",
        };

      default:
        return {};
    }
  };

  const handleOpenViewFile = async (doc: {
    document_name: string;
    filename: string;
  }) => {
    setIsViewModalOpen(true);
    setIsGeneratingUrl(true);
    setViewableTitle(doc.document_name);

    try {
      const response = await generateViewUrl(doc.filename);
      setViewableUrl(response.data.url);
    } catch (error) {
      console.error("Failed to get view URL:", error);
      toast.error("Gagal memuat pratinjau dokumen.");
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

  const handleUpload = () => {
    if (filesToUpload.length === 0 || !selectedCategory) return;
    handleOpenModal("upload", { category: selectedCategory });
  };

  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    const allowedTypes = ["application/pdf", "text/plain"];
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (allowedTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(
        `Tipe file tidak cooc: ${invalidFiles.join(
          ", "
        )}. Hanya PDF dan txt.`
      );
    }

    if (validFiles.length > 0) {
      setFilesToUpload((prev) => [...prev, ...validFiles]);
    }
  }, []);
  const handleRemoveFile = useCallback((fileIndex: number) => {
    setFilesToUpload((prev) => prev.filter((_, index) => index !== fileIndex));
  }, []);

  // PERBAIKAN: Ubah tipe parameter filterName menjadi keyof Filters
  const handleFilterChange = (filterName: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDocs(e.target.checked ? documents.map((d) => d.id) : []);
  };

  const handleSelectOne = (
    e: React.ChangeEvent<HTMLInputElement>,
    docId: number
  ) => {
    setSelectedDocs((prev) =>
      e.target.checked ? [...prev, docId] : prev.filter((id) => id !== docId)
    );
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
        toast.success(
          `versi terbaru "${currentDocument.document_name}" telah diupload.`
        );
        handleCloseModals();
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message || "Gagal mengunggah versi terbaru."
        );
      },
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

      <div className="mt-8">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchInput}
            searchPlaceholder="Cari bedasarkan Nama, staff, tipe"
            filters={filters}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onFilterChange={handleFilterChange}
            filterConfig={filterConfig}
          />
        </div>

        <DocumentsTable
          documents={documents}
          selectedDocs={selectedDocs}
          isLoading={isLoadingDocs}
          isError={isError}
          isDeleting={isDeleting}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onDeleteMultiple={() => handleOpenModal("deleteMultiple")}
          onDeleteSingle={(doc) => handleOpenModal("deleteSingle", doc)}
          onNewVersion={handleOpenNewVersionModal}
          onViewVersions={handleOpenVersioningModal}
          onViewFile={handleOpenViewFile}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
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
          onViewVersion={handleOpenViewFile}
        />
      )}

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={modalContent.title}
        confirmText={modalContent.confirmText}
        confirmColor={modalContent.confirmColor}
        isConfirming={isUploading || isDeleting}
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

export default UploadPage;
