// [UPDATE: src/features/DocumentManagement/components/DocumentTable.tsx]

import React from "react";
import DocumentTableRow from "./DocumentTableRow";

import {  ArrowUp, ArrowDown } from "lucide-react";
import type { ActionType, Document, SortOrder } from "../types/types"; 
import TablePagination from "../../../shared/components/TablePagination";

interface DocumentTableProps {
  documents: Document[];
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onViewFile: (doc: Document) => void;
  sortColumn: string;
  sortDirection: SortOrder;
  onSort: (column: string) => void;
}



const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  hasManagerAccess,
  onAction,
  onViewFile,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  sortColumn,
  sortDirection,
  onSort,
}) => {


  const SortableHeader = ({ label, columnKey, className = "" }: { label: string; columnKey: string; className?: string }) => {
    const isActive = sortColumn === columnKey;
    return (
      <th 
        className={`px-4 py-3 sticky top-0 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
        onClick={() => onSort(columnKey)}
      >
        <div className="flex items-center justify-center gap-1">
          {label}
          {isActive && (
            sortDirection === 'asc' 
              ? <ArrowUp className="w-3 h-3 text-blue-600" /> 
              : <ArrowDown className="w-3 h-3 text-blue-600" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      <div className="overflow-x-auto relative">
        {/* Tambahkan min-w-full agar tabel bisa scroll horizontal di layar kecil */}
        <table className="min-w-full min-w-[1000px]">
          <thead className="bg-gray-100 sticky top-0 ">
            <tr className="text-left text-[10px] font-semibold text-gray-600">
              <SortableHeader label="Tanggal Unggah" columnKey="created_at" />
              <SortableHeader label="Nama Dokumen" columnKey="document_name" className="text-left !justify-start" />
              <SortableHeader label="Staff" columnKey="staff" />
              
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Tipe</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Kategori</th>
              
              {/* --- PERUBAHAN DI SINI: Tambahkan Header Team --- */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Tim</th>
              
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Status</th>
              
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center right-0 z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <DocumentTableRow
                  key={doc.id}
                  document={doc}
                  hasManagerAccess={hasManagerAccess}
                  onAction={onAction}
                  onViewFile={onViewFile}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500"> {/* Update colSpan jadi 8 */}
                  <p>Tidak ada dokumen ditemukan</p>
                </td>
              </tr>
            )}
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

export default DocumentTable;