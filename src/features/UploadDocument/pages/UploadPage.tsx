import React, { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

import UploadZone from "../components/UploadZone";
import UploadProgress from "../components/UploadProgress";
import DocumentsTable from "../components/DocumentsTable";

import VersioningDocumentModal from "../components/VersioningDocument";
import VersioningModal from "../components/VersioningModal";

import type {
  UploadedDocument,
  PendingDocument,
  DocumentCategory,
  DocumentVersion,
} from "../types/types";

import { DUMMY_UPLOADED_DOCS, DUMMY_VERSIONS } from "../utils/DummyDataUpload";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import TableControls, {
  type FilterConfig,
} from "../../../shared/components/TableControls";

type ModalAction = "upload" | "deleteSingle" | "deleteMultiple";

const useMockApi = () => ({
  documents: DUMMY_UPLOADED_DOCS,
  isLoadingDocs: false,
  isError: false,
  uploadFiles: (files: File[], category: DocumentCategory) =>
    new Promise<void>((res) => {
      console.log(`Uploading ${files.length} files for category: ${category}`);
      setTimeout(res, 1500);
    }),
  isUploading: false,
  deleteFile: (id: number) =>
    new Promise<void>((res) => {
      console.log("Deleting file:", id);
      res();
    }),
  deleteMultiple: (ids: number[]) =>
    new Promise<void>((res) => {
      console.log("Deleting multiple files:", ids);
      res();
    }),
  isDeletingMultiple: false,
  getPendingDoc: (id: number) =>
    new Promise<PendingDocument | null>((res) => {
      if (id === 3 || id === 8)
        res({ document_name: "dokumen_revisi_v2.pdf", status: "pending" });
      else res(null);
    }),
  isCheckingPending: false,
  replaceDocument: (data: FormData) =>
    new Promise<void>((res) => {
      console.log("Uploading new version:", data.get("file"));
      res();
    }),
  isReplacing: false,
});

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
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
    ],
  },
];

const UploadPage: React.FC = () => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<
    DocumentCategory | ""
  >("");

  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    date: "",
    type: "",
    category: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);
  const [isVersioningModalOpen, setVersioningModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] =
    useState<UploadedDocument | null>(null);
  const [pendingDocument, setPendingDocument] =
    useState<PendingDocument | null>(null);
  const [versionHistory, setVersionHistory] = useState<DocumentVersion[]>([]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: ModalAction | null;
    data: any;
  }>({
    isOpen: false,
    action: null,
    data: null,
  });

  const api = useMockApi();

  const filteredDocuments = useMemo(() => {
    return api.documents.filter((doc) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const searchMatch =
        doc.document_name.toLowerCase().includes(lowerSearchTerm) ||
        doc.staff.toLowerCase().includes(lowerSearchTerm) ||
        doc.team.toLowerCase().includes(lowerSearchTerm);

      const typeMatch = filters.type
        ? doc.document_type === filters.type
        : true;
      const categoryMatch = filters.category
        ? doc.category === filters.category
        : true;
      const statusMatch = filters.status ? doc.status === filters.status : true;

      return searchMatch && typeMatch && categoryMatch && statusMatch;
    });
  }, [api.documents, searchTerm, filters]);

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const handleOpenModal = (action: ModalAction, data: any = null) => {
    setModalState({ isOpen: true, action, data });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, action: null, data: null });
  };

  const handleConfirmAction = async () => {
    const { action, data } = modalState;

    if (action === "upload") {
      setUploadProgress(1);
      await api.uploadFiles(
        filesToUpload,
        selectedCategory as DocumentCategory
      );
      setUploadProgress(100);
      toast.success(`Successfully uploaded ${filesToUpload.length} file(s).`);
      setTimeout(() => {
        setFilesToUpload([]);
        setSelectedCategory("");
        setUploadProgress(0);
      }, 1000);
    }

    if (action === "deleteSingle") {
      await api.deleteFile(data.docId);
      toast.success("Document successfully deleted.");
    }

    if (action === "deleteMultiple") {
      await api.deleteMultiple(selectedDocs);
      toast.success(
        `${selectedDocs.length} selected documents have been deleted.`
      );
      setSelectedDocs([]);
    }

    handleCloseModal();
  };

  const getModalContent = () => {
    const { action, data } = modalState;
    switch (action) {
      case "upload":
        return {
          title: "Confirm Upload",
          body: `Are you sure you want to upload the file(s) to the "${data.category}" category?`,
          confirmText: "Upload",
          confirmColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "deleteSingle":
        return {
          title: "Confirm Deletion",
          body: "Are you sure you want to delete this document? This action cannot be undone.",
          confirmText: "Delete",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };
      case "deleteMultiple":
        return {
          title: "Confirm Multiple Deletion",
          body: `Are you sure you want to delete the ${data.count} selected documents? This action cannot be undone.`,
          confirmText: "Delete All",
          confirmColor: "bg-red-600 hover:bg-red-700",
        };
      default:
        return {};
    }
  };

  const handleUpload = () => {
    if (filesToUpload.length === 0 || !selectedCategory) return;
    handleOpenModal("upload", { category: selectedCategory });
  };

  const handleDeleteSingle = (docId: number) => {
    handleOpenModal("deleteSingle", { docId });
  };

  const handleDeleteMultiple = () => {
    if (selectedDocs.length === 0) return;
    handleOpenModal("deleteMultiple", { count: selectedDocs.length });
  };

  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    setFilesToUpload((prev) => [...prev, ...Array.from(selectedFiles)]);
  }, []);
  const handleRemoveFile = useCallback((fileName: string) => {
    setFilesToUpload((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  // Fungsi ini sekarang tipenya cocok dengan yang diharapkan oleh TableControls
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDocs(
      e.target.checked ? paginatedDocuments.map((d) => d.id) : []
    );
  };

  const handleSelectOne = (
    e: React.ChangeEvent<HTMLInputElement>,
    docId: number
  ) => {
    if (e.target.checked) {
      setSelectedDocs((prev) => [...prev, docId]);
    } else {
      setSelectedDocs((prev) => prev.filter((id) => id !== docId));
    }
  };

  const handleOpenNewVersionModal = async (doc: UploadedDocument) => {
    setCurrentDocument(doc);
    const pending = await api.getPendingDoc(doc.id);
    setPendingDocument(pending);
    setReplaceModalOpen(true);
  };

  const handleOpenVersioningModal = (doc: UploadedDocument) => {
    setCurrentDocument(doc);
    setVersionHistory(DUMMY_VERSIONS[doc.id] || []);
    setVersioningModalOpen(true);
  };

  const handleCloseModals = () => {
    setReplaceModalOpen(false);
    setVersioningModalOpen(false);
    setCurrentDocument(null);
    setPendingDocument(null);
    setVersionHistory([]);
  };

  const handleConfirmNewVersion = async (newFile: File) => {
    if (!currentDocument) return;
    const formData = new FormData();
    formData.append("document_id", currentDocument.id.toString());
    formData.append("file", newFile);
    await api.replaceDocument(formData);
    toast.success(`Mengunggah v${currentDocument.version + 1} untuk approval.`);
    handleCloseModals();
  };

  const modalContent = getModalContent();

  return (
    <>
      {/* <p className="text-gray-500 text-md">
        This page is used to upload legal documents that will be used as a
        knowledge base.
      </p> */}

      <div className="mt-6">
        <UploadZone
          stagedFiles={filesToUpload}
          isUploading={
            api.isUploading || (uploadProgress > 0 && uploadProgress < 100)
          }
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onFilesSelected={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          onUpload={handleUpload}
        />
      </div>

      {uploadProgress > 0 && <UploadProgress progress={uploadProgress} />}

      <div className="mt-8">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchTerm}
            searchPlaceholder="Search by name, staff, team..."
            filters={filters}
            onSearchChange={setSearchTerm}
            onFilterChange={handleFilterChange}
            filterConfig={filterConfig}
          />
        </div>

        <DocumentsTable
          documents={paginatedDocuments}
          selectedDocs={selectedDocs}
          isLoading={api.isLoadingDocs}
          isError={api.isError}
          isDeleting={api.isDeletingMultiple}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onDeleteMultiple={handleDeleteMultiple}
          onDeleteSingle={handleDeleteSingle}
          onNewVersion={handleOpenNewVersionModal}
          onViewVersions={handleOpenVersioningModal}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredDocuments.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {currentDocument && (
        <VersioningDocumentModal
          isOpen={isReplaceModalOpen}
          onClose={handleCloseModals}
          document={currentDocument}
          pendingDocument={pendingDocument}
          onVersioning={handleConfirmNewVersion}
          isReplacing={api.isReplacing}
          isPending={api.isCheckingPending}
        />
      )}

      {currentDocument && (
        <VersioningModal
          isOpen={isVersioningModalOpen}
          onClose={handleCloseModals}
          versions={versionHistory}
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
