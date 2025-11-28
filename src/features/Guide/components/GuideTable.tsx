// src/features/Guide/components/GuideTable.tsx

import React from "react";
import { ArrowUp, ArrowDown, Eye, FileText } from "lucide-react";
import type { Guide, SortOrder } from "../types/types";
import TablePagination from "../../../shared/components/TablePagination";

interface GuideTableProps {
  guides: Guide[];
  isLoading: boolean;
  isError: boolean;
  
  // Pagination Props
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;

  // Sorting Props
  sortColumn: string;
  sortDirection: SortOrder;
  onSort: (column: string) => void;

  // Actions
  onViewFile: (guide: Guide) => void;
}


const GuideTable: React.FC<GuideTableProps> = ({
  guides,
  isLoading,
  isError,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  sortColumn,
  sortDirection,
  onSort,
  onViewFile,
}) => {
 
  // Helper Component untuk Sortable Header
  const SortableHeader = ({ label, columnKey, className = "" }: { label: string; columnKey: string; className?: string }) => {
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
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-gray-500 min-w-[800px]">
          <thead className="text-[10px] text-gray-700 bg-gray-100 sticky top-0">
            <tr>
              {/* Backend guide/repository.go mendukung sort: created_at, title, updated_at */}
              <SortableHeader label="Tanggal Dibuat" columnKey="created_at" />
              <SortableHeader label="Judul" columnKey="title" />
              <th className="px-6 py-4">Deskripsi</th>
              <th className="px-6 py-4 text-center sticky right-0 bg-gray-100 z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  memuat data...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-red-500">
                  Failed to load guides.
                </td>
              </tr>
            ) : guides.length > 0 ? (
              guides.map((guide) => (
                <tr key={guide.id} className="group hover:bg-gray-50 text-[10px] text-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(guide.created_at).toLocaleDateString("id-ID", {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      {guide.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={guide.description}>
                    {guide.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
                    <button
                      onClick={() => onViewFile(guide)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                      title="Lihat Dokumen"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  Tidak ada panduan ditemukan.
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

export default GuideTable;