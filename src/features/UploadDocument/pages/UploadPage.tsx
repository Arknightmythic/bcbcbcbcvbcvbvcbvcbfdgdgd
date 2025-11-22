import React, { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
// Hapus useQueryClient yang tidak digunakan
// import { useQueryClient } from "@tanstack/react-query";

import { useGetDocuments, useUploadDocument, useUpdateDocument, useGetDocumentDetails, useDeleteDocument } from "../hooks/useDocument";
import UploadZone from "../components/UploadZone";
import UploadProgress from "../components/UploadProgress";
import DocumentsTable from "../components/DocumentsTable";
import VersioningDocumentModal from "../components/VersioningDocument";
import VersioningModal from "../components/VersioningModal";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import TableControls, { type FilterConfig } from "../../../shared/components/TableControls";
import type { UploadedDocument, DocumentCategory, SortOrder } from "../types/types";
import { generateViewUrl } from "../api/document"; 
import PdfViewModal from "../../../shared/components/PDFViewModal";


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
    {
        key: "date_range",
        type: "date-range",
        startDateKey: "start_date",
        endDateKey: "end_date",
        placeholder: "Filter by Date",
    },
];


const UploadPage: React.FC = () => {
  
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  // Hapus setUploadProgress karena tidak digunakan saat ini
  const [uploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "">("");

  
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");   
  
  const [filters, setFilters] = useState<Filters>({ 
    type: "", category: "", status: "", start_date: "", end_date: "" 
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<SortOrder>("desc");

  
  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);
  const [isVersioningModalOpen, setVersioningModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<UploadedDocument | null>(null);
  const [currentDocumentIdForDetails, setCurrentDocumentIdForDetails] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{ isOpen: boolean; action: ModalAction | null; data: any }>({
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
    params.set('limit', String(itemsPerPage));
    params.set('offset', String((currentPage - 1) * itemsPerPage));
    
    if (searchTerm) params.set('search', searchTerm);
    if (filters.type) params.set('data_type', filters.type);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);

    if (sortColumn) {
        params.set('sort_by', sortColumn);
        params.set('sort_direction', sortDirection);
    }

    return params;
  }, [currentPage, itemsPerPage, searchTerm, filters, sortColumn, sortDirection]);


  const { data: documentsData, isLoading: isLoadingDocs, isError } = useGetDocuments(searchParams);
  const { mutate: uploadFiles, isPending: isUploading } = useUploadDocument();
  const { mutate: replaceDocument, isPending: isReplacing } = useUpdateDocument();
  const { data: versionHistoryData } = useGetDocumentDetails(currentDocumentIdForDetails);
  
  
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  const documents = useMemo(() => documentsData?.documents || [], [documentsData]);
  const totalItems = useMemo(() => documentsData?.total || 0, [documentsData]);

  
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
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

  const handleOpenModal = (action: ModalAction, data: any = null) => setModalState({ isOpen: true, action, data });
  const handleCloseModal = () => setModalState({ isOpen: false, action: null, data: null });

  
  const handleConfirmAction = async () => {
    const { action, data } = modalState;

    if (action === "upload") {
      const formData = new FormData();
      filesToUpload.forEach(file => formData.append('files', file));
      formData.append('category', selectedCategory as DocumentCategory);

      uploadFiles(formData, {
        onSuccess: () => {
          toast.success(`Successfully uploaded ${filesToUpload.length} file(s).`);
          setFilesToUpload([]);
          setSelectedCategory("");
          handleCloseModal(); 
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Upload failed.");
          handleCloseModal(); 
        }
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

      
      const results = await Promise.allSettled(
        selectedDocs.map(id => 
          new Promise((resolve, reject) => 
            deleteDocument(id, { onSuccess: resolve, onError: reject })
          )
        )
      );

      const successfulDeletes = results.filter(r => r.status === 'fulfilled').length;
      const failedDeletes = results.filter(r => r.status === 'rejected').length;

      if (successfulDeletes > 0) {
        toast.success(`Successfully deleted ${successfulDeletes} document(s).`);
      }
      if (failedDeletes > 0) {
        console.error(`Failed to delete ${failedDeletes} document(s).`);
      }

      setSelectedDocs([]); 
      handleCloseModal();
    }
  };
  
  
  const getModalContent = () => {
      const { action, data } = modalState;
      switch (action) {
          case "upload":
              return { title: "Confirm Upload", body: `Are you sure you want to upload the file(s) to the "${data.category}" category?`, confirmText: "Upload", confirmColor: "bg-blue-600 hover:bg-blue-700" };
          case "deleteSingle":
              return { title: "Confirm Deletion", body: `Are you sure you want to delete "${data?.document_name}"? This action will delete the main document and ALL its versions.`, confirmText: "Delete", confirmColor: "bg-red-600 hover:bg-red-700" };
          case "deleteMultiple":
              return { title: "Confirm Deletion", body: `Are you sure you want to delete ${selectedDocs.length} selected document(s)? This action will delete all main documents and ALL their versions.`, confirmText: `Delete (${selectedDocs.length})`, confirmColor: "bg-red-600 hover:bg-red-700" };
          default: return {};
      }
  };

  const handleOpenViewFile = async (doc: { document_name: string, filename: string }) => {
    setIsViewModalOpen(true);
    setIsGeneratingUrl(true);
    setViewableTitle(doc.document_name);
    
    try {
      const response = await generateViewUrl(doc.filename);
      setViewableUrl(response.data.url);
    } catch (error) {
      console.error("Failed to get view URL:", error);
      toast.error("Could not generate secure URL.");
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

    Array.from(selectedFiles).forEach(file => {
      if (allowedTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`File type not supported for: ${invalidFiles.join(", ")}. Only PDF and TXT are allowed.`);
    }

    if (validFiles.length > 0) {
      setFilesToUpload((prev) => [...prev, ...validFiles]);
    }
  }, []);
  const handleRemoveFile = useCallback((fileName: string) => setFilesToUpload((prev) => prev.filter((f) => f.name !== fileName)), []);

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