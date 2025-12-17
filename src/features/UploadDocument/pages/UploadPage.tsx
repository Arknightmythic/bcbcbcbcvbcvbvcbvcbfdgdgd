import React, { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

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
import { generateViewUrl, checkDuplicates } from "../api/document";
import PdfViewModal from "../../../shared/components/PDFViewModal";
import TableControls, {
  type FilterConfig,
} from "../../../shared/components/tablecontrols/TableControls";

type ModalAction = "upload" | "deleteSingle" | "deleteMultiple";

export interface Filters extends Record<string, any> {
  type: string;
  category: DocumentCategory | "";
  status: string;
  ingest_status: string;
  start_date: string;
  end_date: string;
}

const filterConfig: FilterConfig<Filters>[] = [
  {
    key: "type",
    type: "select",
    options: [
      { label: "Semua Tipe", value: "" },
      { label: "PDF", value: "pdf" },
      { label: "TXT", value: "txt" },
    ],
    placeholder: "Tipe File",
  },
  {
    key: "category",
    type: "select",
    options: [
      { label: "Semua Kategori", value: "" },
      { label: "Panduan", value: "panduan" },
      { label: "Tanya Jawab", value: "qna" },
      { label: "Peraturan", value: "peraturan" },
    ],
    placeholder: "Kategori",
  },
  {
    key: "status",
    type: "select",
    options: [
      { label: "Semua Status", value: "" },
      { label: "Approved", value: "Approved" },
      { label: "Pending", value: "Pending" },
      { label: "Rejected", value: "Rejected" },
    ],
    placeholder: "Status Izin",
  },
  {
    key: "ingest_status",
    type: "select",
    options: [
      { label: "Semua Proses", value: "" },
      { label: "Completed", value: "completed" },
      { label: "Processing", value: "processing" },
      { label: "Failed", value: "failed" },
    ],
    placeholder: "Status Proses",
  },
  {
    key: "dateRange",
    type: "date-range", 
    placeholder: "Tanggal Upload",
  },
];

const UploadPage: React.FC = () => {
  // --- States ---
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [duplicateFilenames, setDuplicateFilenames] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "">("");
  
  // Table States
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<SortOrder>("desc");
  const [activeFilters, setActiveFilters] = useState<Filters>({
    type: "",
    category: "",
    status: "",
    ingest_status: "",
    start_date: "",
    end_date: "",
  });

  // Modal States
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: ModalAction | null;
    data?: any;
  }>({ isOpen: false, action: null });

  // View & Versioning States
  const [currentDocument, setCurrentDocument] = useState<UploadedDocument | null>(null);
  const [isVersioningModalOpen, setIsVersioningModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  
  // PDF View States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewableUrl, setViewableUrl] = useState<string>("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  // --- React Query Hooks ---
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", itemsPerPage.toString());
    params.append("sort_by", sortColumn);
    params.append("sort_order", sortDirection);
    
    if (searchQuery) params.append("search", searchQuery);
    if (activeFilters.type) params.append("type", activeFilters.type);
    if (activeFilters.category) params.append("category", activeFilters.category);
    if (activeFilters.status) params.append("status", activeFilters.status);
    if (activeFilters.ingest_status) params.append("ingest_status", activeFilters.ingest_status);
    if (activeFilters.start_date) params.append("start_date", activeFilters.start_date);
    if (activeFilters.end_date) params.append("end_date", activeFilters.end_date);

    return params;
  }, [currentPage, itemsPerPage, searchQuery, sortColumn, sortDirection, activeFilters]);

  const { data, isLoading, isError } = useGetDocuments(queryParams);
  const { mutate: upload, isPending: isUploading } = useUploadDocument();
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument();
  const { mutate: batchDelete, isPending: isBatchDeleting } = useBatchDeleteDocuments();
  const { mutate: updateDoc, isPending: isReplacing } = useUpdateDocument();
  
  const { data: versionHistoryData } = useGetDocumentDetails(
    isVersioningModalOpen && currentDocument ? currentDocument.id : null
  );

  // --- Handlers ---

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const allowedTypes = new Set(["application/pdf", "text/plain"]);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    // 1. Client-side validation
    for (const file of Array.from(selectedFiles)) {
      if (allowedTypes.has(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      toast.error(`Tipe file tidak cocok: ${invalidFiles.join(", ")}`);
    }

    if (validFiles.length === 0) return;

    // 2. Scan Duplicates
    setIsScanning(true);
    try {
      const alreadyStagedNames = new Set(filesToUpload.map(f => f.name));
      const uniqueNewFiles = validFiles.filter(f => !alreadyStagedNames.has(f.name));

      if (uniqueNewFiles.length === 0) {
        toast("File sudah ada di daftar unggahan.");
        return;
      }

      const namesToCheck = uniqueNewFiles.map(f => f.name);
      const duplicates = (await checkDuplicates(namesToCheck)) || [];

      // 3. Update State
      setDuplicateFilenames(prev => {
        const newSet = new Set(prev);
        duplicates.forEach(d => newSet.add(d));
        return newSet;
      });

      setFilesToUpload((prev) => [...prev, ...uniqueNewFiles]);

      if (duplicates.length > 0) {
        toast(
          <span>
             Ditemukan <b>{duplicates.length}</b> dokumen duplikat. 
             Dokumen tersebut ditandai merah dan <b>tidak akan diunggah</b>.
          </span>
        , { duration: 5000, icon: '⚠️' });
      }

    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Gagal memindai duplikasi dokumen.");
    } finally {
      setIsScanning(false);
    }
  }, [filesToUpload]);

  const handleRemoveFile = (index: number) => {
    setFilesToUpload((prev) => {
      const fileToRemove = prev[index];
      if (fileToRemove) {
        setDuplicateFilenames(currentSet => {
          const newSet = new Set(currentSet);
          newSet.delete(fileToRemove.name);
          return newSet;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = () => {
    const filesToProcess = filesToUpload.filter(f => !duplicateFilenames.has(f.name));

    if (filesToProcess.length === 0) {
      toast.error("Tidak ada file valid untuk diunggah.");
      return;
    }

    setModalState({
      isOpen: true,
      action: "upload",
      data: { count: filesToProcess.length },
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (filterName: string | keyof Filters, value: any) => {
    setActiveFilters((prev) => {
      if (filterName === "dateRange" && value && typeof value === 'object') {
         return {
           ...prev,
           start_date: value.startDate || "",
           end_date: value.endDate || "",
         };
      }

      return {
        ...prev,
        [filterName]: value,
      };
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && data?.documents) {
      setSelectedDocs(data.documents.map((doc) => doc.id));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, docId: number) => {
    if (e.target.checked) {
      setSelectedDocs((prev) => [...prev, docId]);
    } else {
      setSelectedDocs((prev) => prev.filter((id) => id !== docId));
    }
  };

  const handleDeleteMultiple = () => {
    setModalState({ isOpen: true, action: "deleteMultiple" });
  };

  const handleDeleteSingle = (doc: UploadedDocument) => {
    setModalState({ isOpen: true, action: "deleteSingle", data: doc });
  };

  const handleOpenViewFile = async (doc: UploadedDocument | any) => {
    setIsGeneratingUrl(true);
    setIsViewModalOpen(true);
    setCurrentDocument(doc as UploadedDocument); 
    
    try {
      const result = await generateViewUrl(doc.filename);
      setViewableUrl(result.data.url);
    } catch (error) {
      toast.error("Gagal membuka dokumen");
      setIsViewModalOpen(false);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewableUrl("");
    setCurrentDocument(null);
  };

  const handleNewVersion = (doc: UploadedDocument) => {
    setCurrentDocument(doc);
    setIsReplaceModalOpen(true);
  };

  const handleViewVersions = (doc: UploadedDocument) => {
    setCurrentDocument(doc);
    setIsVersioningModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsReplaceModalOpen(false);
    setIsVersioningModalOpen(false);
    setCurrentDocument(null);
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, action: null });
  };

  const handleConfirmAction = () => {
    const { action, data: modalData } = modalState;

    if (action === "upload") {
      const validFiles = filesToUpload.filter(f => !duplicateFilenames.has(f.name));
      
      if (validFiles.length === 0) {
        toast.error("Semua file terpilih adalah duplikat.");
        handleCloseModal();
        return;
      }

      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("category", selectedCategory);

      upload(formData, {
        onSuccess: () => {
          toast.success(`${validFiles.length} Dokumen berhasil diunggah!`);
          setFilesToUpload([]);
          setDuplicateFilenames(new Set());
          setSelectedCategory("");
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Gagal mengunggah dokumen.");
          handleCloseModal();
        },
      });
    } else if (action === "deleteSingle" && modalData) {
      deleteDoc(modalData.id, {
        onSuccess: () => handleCloseModal(),
      });
    } else if (action === "deleteMultiple") {
      batchDelete(selectedDocs, {
        onSuccess: () => {
          setSelectedDocs([]);
          handleCloseModal();
        },
      });
    }
  };
  
  const handleConfirmNewVersion = (file: File) => {
    if (!currentDocument) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_id", currentDocument.id.toString());

    updateDoc(formData, {
      onSuccess: () => {
        toast.success("Versi baru berhasil diajukan!");
        handleCloseModals();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Gagal mengunggah versi baru.");
      },
    });
  };

  const modalContent = useMemo(() => {
    switch (modalState.action) {
      case "upload":
        const displayCategory =
          selectedCategory === "qna" ? "Tanya Jawab" : selectedCategory;

        return {
          title: "Konfirmasi Unggah",
          body: `Apakah Anda yakin ingin mengunggah ${modalState.data?.count} dokumen ke kategori "${displayCategory}"? (Dokumen duplikat akan diabaikan)`,
          confirmText: "Ya, Unggah",
          confirmColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "deleteSingle":
        return {
          title: "Hapus Dokumen",
          body: `Apakah Anda yakin ingin menghapus dokumen "${modalState.data?.document_name}"?`,
          confirmText: "Hapus",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };
      case "deleteMultiple":
        return {
          title: "Hapus Banyak Dokumen",
          body: `Apakah Anda yakin ingin menghapus ${selectedDocs.length} dokumen terpilih?`,
          confirmText: "Hapus Semua",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };
      default:
        return { title: "", body: "", confirmText: "", confirmColor: "bg-blue-600 hover:bg-blue-700" };
    }
  }, [modalState, selectedDocs, selectedCategory]);

  return (
    <>
      <div className="mt-6">
        <UploadZone
          stagedFiles={filesToUpload}
          duplicateFilenames={duplicateFilenames}
          isUploading={isUploading}
          isScanning={isScanning}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onFilesSelected={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          onUpload={handleUpload}
        />
      </div>

      <div className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-800">Daftar Dokumen</h2>
          <TableControls
            searchTerm={searchQuery} // FIXED: Menggunakan 'searchTerm'
            searchPlaceholder="Cari nama dokumen..." // FIXED: Prop wajib
            onSearchChange={setSearchQuery}
            onSearchSubmit={() => setCurrentPage(1)} // FIXED: Prop wajib
            filters={activeFilters}
            onFilterChange={handleFilterChange}
            filterConfig={filterConfig}
          />
        </div>

        <DocumentsTable
          documents={data?.documents || []}
          selectedDocs={selectedDocs}
          isLoading={isLoading}
          isError={isError}
          isDeleting={isDeleting || isBatchDeleting}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onDeleteMultiple={handleDeleteMultiple}
          onDeleteSingle={handleDeleteSingle}
          onNewVersion={handleNewVersion}
          onViewVersions={handleViewVersions}
          onViewFile={handleOpenViewFile}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={data?.total || 0}
          onPageChange={handlePageChange}
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
        confirmColor={modalContent.confirmColor as "blue" | "red"}
        isConfirming={isUploading || isDeleting || isBatchDeleting}
      >
        <p>{modalContent.body}</p>
      </ConfirmationModal>

      <PdfViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        url={viewableUrl}
        isLoading={isGeneratingUrl}
        title={currentDocument?.document_name || "Dokumen"}
      />
    </>
  );
};

export default UploadPage;