// src/features/Guide/components/GuideTable.tsx

import React from "react";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Eye, FileText } from "lucide-react";
import CustomSelect from "../../../shared/components/CustomSelect";
import type { Guide, SortOrder } from "../types/types";

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

const itemsPerPageOptions = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "30", label: "30" },
];

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
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

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
          {/* {isActive && (
            sortDirection === 'asc' 
              ? <ArrowUp className="w-3 h-3 text-blue-600" /> 
              : <ArrowDown className="w-3 h-3 text-blue-600" />
          )} */}
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
              <SortableHeader label="Date Created" columnKey="created_at" />
              <SortableHeader label="Title" columnKey="title" />
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-center sticky right-0 bg-gray-100 z-10">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  Loading data...
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
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  No guides found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav
        className="flex flex-col md:flex-row items-center justify-between pt-4 gap-4 md:gap-0"
        aria-label="Table navigation"
      >
        <span className="text-xs font-normal text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {startItem}-{endItem}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{totalItems}</span>
        </span>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-normal text-gray-500">
            Rows per page:
          </span>
          <CustomSelect
            value={String(itemsPerPage)}
            onChange={(value) => onItemsPerPageChange(Number(value))}
            options={itemsPerPageOptions}
            selectedType="pagerow"
            direction="up"
          />
          <ul className="inline-flex -space-x-px text-xs">
            <li>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center h-[30px] px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </li>
            <li>
              <span
                aria-current="page"
                className="flex items-center justify-center h-[30px] px-4 leading-tight text-gray-700 bg-white border border-gray-300"
              >
                Page {currentPage} of {totalPages > 0 ? totalPages : 1}
              </span>
            </li>
            <li>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center h-[30px] px-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default GuideTable;