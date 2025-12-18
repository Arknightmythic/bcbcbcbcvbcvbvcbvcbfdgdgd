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
      { value: "qna", label: "Tanya Jawab" },
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
    key: "ingest_status",
    type: "select",
     options: [
      { value: "", label: "Semua Proses" },
      { value: "null", label: "Menunggu" }, 
      { value: "processing", label: "Sedang Diproses" },
      { value: "finished", label: "Selesai" },
      { value: "failed", label: "Gagal" },
      { value: "unprocessed", label: "Tidak Diproses" },
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
  // --- States ---
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [duplicateFilenames, setDuplicateFilenames] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "">("");
  
  // Table States
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

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
  const [currentDocumentIdForDetails, setCurrentDocumentIdForDetails] =
    useState<number | null>(null);
  const [isVersioningModalOpen, setIsVersioningModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  
  // PDF View States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewableUrl, setViewableUrl] = useState<string | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [viewableTitle, setViewableTitle] = useState<string>("");

  // --- React Query Hooks ---
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(itemsPerPage));
    params.set("offset", String((currentPage - 1) * itemsPerPage));
    
    if (searchTerm) params.set("search", searchTerm);
    if (activeFilters.type) params.append("data_type", activeFilters.type);
    if (activeFilters.category) params.append("category", activeFilters.category);
    if (activeFilters.status) params.append("status", activeFilters.status);
    if (activeFilters.ingest_status) params.append("ingest_status", activeFilters.ingest_status);
    if (activeFilters.start_date) params.append("start_date", activeFilters.start_date);
    if (activeFilters.end_date) params.append("end_date", activeFilters.end_date);
    
    if (sortColumn) {
      params.set("sort_by", sortColumn);
      params.set("sort_direction", sortDirection);
    }

    return params;
  }, [currentPage, itemsPerPage, searchTerm, sortColumn, sortDirection, activeFilters]);

  const { data: documentsData,
    isLoading: isLoadingDocs,
    isError,} = useGetDocuments(queryParams);
  const { mutate: upload, isPending: isUploading } = useUploadDocument();
  const { mutate: deleteDoc, isPending: isDeletingSingle } = useDeleteDocument();
  const { mutate: batchDelete, isPending: isBatchDeleting } = useBatchDeleteDocuments();
  const { mutate: updateDoc, isPending: isReplacing } = useUpdateDocument();
  
  const { data: versionHistoryData } = useGetDocumentDetails(
    currentDocumentIdForDetails
  );

  const isDeleting = isDeletingSingle||isBatchDeleting;
  const documents = useMemo(
    () => documentsData?.documents || [],
    [documentsData]
  );
  const totalItems = useMemo(() => documentsData?.total || 0, [documentsData]);
  // --- Handlers ---

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

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

  
  const handleUpload = () => {
    const filesToProcess = filesToUpload.filter(f => !duplicateFilenames.has(f.name));

    if (filesToProcess.length === 0) {
      toast.error("Tidak ada file valid untuk diunggah.");
      return;
    }

    handleOpenModal("upload", { count: filesToProcess.length })
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

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDocs(e.target.checked ? documents.map((d) => d.id) : []);
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

  const handleNewVersion = (doc: UploadedDocument) => {
    setCurrentDocument(doc);
    setIsReplaceModalOpen(true);
  };

  const handleOpenVersioningModal = (doc: UploadedDocument) => {
    setCurrentDocument(doc);
    setCurrentDocumentIdForDetails(doc.id);
    setIsVersioningModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsReplaceModalOpen(false);
    setIsVersioningModalOpen(false);
    setCurrentDocument(null);
    setCurrentDocumentIdForDetails(null);
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
      // --- PERUBAHAN TEKS DELETE (Request Delete) ---
      case "deleteSingle":
        return {
          title: "Ajukan Hapus Dokumen", // Updated Title
          body: `Apakah Anda yakin ingin mengajukan penghapusan untuk dokumen "${modalState.data?.document_name}"? \n\nTindakan ini memerlukan persetujuan Admin sebelum file benar-benar dihapus.`, // Updated Body
          confirmText: "Ajukan Hapus",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };
      case "deleteMultiple":
        return {
          title: "Ajukan Hapus Massal", // Updated Title
          body: `Apakah Anda yakin ingin mengajukan penghapusan untuk ${selectedDocs.length} dokumen terpilih? \n\nTindakan ini memerlukan persetujuan Admin.`, // Updated Body
          confirmText: "Ajukan Hapus",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };
      // ----------------------------------------------
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
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchInput} 
            searchPlaceholder="Cari nama dokumen..." 
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit} 
            filters={activeFilters}
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
          onDeleteMultiple={handleDeleteMultiple}
          onDeleteSingle={handleDeleteSingle}
          onNewVersion={handleNewVersion}
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