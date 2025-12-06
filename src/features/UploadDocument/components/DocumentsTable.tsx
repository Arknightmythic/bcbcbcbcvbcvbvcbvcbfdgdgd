import React from "react";
import { Loader2, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import DocumentRow from "./DocumentRow";
import type { UploadedDocument, SortOrder } from "../types/types";
import TablePagination from "../../../shared/components/TablePagination";

// --- Interfaces ---

interface DocumentsTableProps {
  documents: UploadedDocument[];
  selectedDocs: number[];
  isLoading: boolean;
  isError: boolean;
  isDeleting: boolean;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (
    event: React.ChangeEvent<HTMLInputElement>,
    docId: number
  ) => void;
  onDeleteMultiple: () => void;
  onDeleteSingle: (doc: UploadedDocument) => void; 
  onNewVersion: (doc: UploadedDocument) => void;
  onViewVersions: (doc: UploadedDocument) => void;
  onViewFile: (doc: UploadedDocument) => void
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;  
  sortColumn: string;
  sortDirection: SortOrder;
  onSort: (column: string) => void;
}

interface SortableHeaderProps {
  label: string; 
  columnKey: string; 
  className?: string;
  sortColumn: string;
  sortDirection: SortOrder;
  onSort: (column: string) => void;
}

// --- Sub-Component (Moved Outside) ---

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  label, 
  columnKey, 
  className = "",
  sortColumn,
  sortDirection,
  onSort
}) => {
  const isActive = sortColumn === columnKey;
  
  return (
    <th 
      className={`px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
      onClick={() => onSort(columnKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive && (
          sortDirection === 'asc' 
            ? <ArrowUp className="w-3 h-3 text-blue-600" /> 
            : <ArrowDown className="w-3 h-3 text-blue-600" />
        )}
        {!isActive && <div className="w-3 h-3" />} 
      </div>
    </th>
  );
};

// --- Main Component ---

const DocumentsTable: React.FC<DocumentsTableProps> = (props) => {  
  const {
    documents,
    selectedDocs,
    isLoading,
    isError,
    isDeleting,
    onSelectAll,
    onSelectOne,
    onDeleteMultiple,
    onDeleteSingle,
    onNewVersion,
    onViewVersions,
    onViewFile,
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
    sortColumn,
    sortDirection,
    onSort,
  } = props;

  const allSelected =
    documents.length > 0 && selectedDocs.length === documents.length;

  // Helper function to handle table content rendering logic (Replacing Nested Ternary)
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-10">
            <Loader2 className="animate-spin inline-block" />
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-10 text-red-500">
            gagal menampilkan data.
          </td>
        </tr>
      );
    }

    if (documents.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-10">
            tidak ada data ditemukan.
          </td>
        </tr>
      );
    }

    // Default case: Render list of documents
    return documents.map((doc) => (
      <DocumentRow
        key={doc.id}
        document={doc}
        isSelected={selectedDocs.includes(doc.id)}
        onSelect={onSelectOne}
        onDelete={onDeleteSingle} 
        onNewVersion={onNewVersion}
        onViewVersions={onViewVersions}
        onViewFile={onViewFile}
      />
    ));
  };

  return (
    <div className="bg-white p-6 rounded-b-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-bold">Dokumen tersimpan</h2>
        {selectedDocs.length > 0 && (
          <button
            onClick={onDeleteMultiple}
            disabled={isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center disabled:bg-gray-400"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <Trash2 className="h-5 w-5 mr-2" />
            )}
            Hapus ({selectedDocs.length})
          </button>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 min-w-[900px]">
          <thead className="text-[10px] text-gray-700 bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-4 w-1/24">
                <input
                  type="checkbox"
                  onChange={onSelectAll}
                  checked={allSelected}
                  className="h-3 w-3"
                />
              </th>
              <SortableHeader 
                label="Tanggal Unggah" 
                columnKey="created_at" 
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader 
                label="Nama Dokumen" 
                columnKey="document_name" 
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader 
                label="Staff" 
                columnKey="staff" 
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Tim</th>
              <th className="px-6 py-4">Status Proses</th>
              <th className="px-6 py-4">Status Izin</th>
              <th className="px-6 py-4 text-center sticky right-0 bg-gray-100 z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {renderTableContent()}
          </tbody>
        </table>
      </div>

     <TablePagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </div>
  );
};

export default DocumentsTable;