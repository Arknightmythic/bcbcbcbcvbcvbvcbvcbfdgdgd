// [UPDATE: src/features/DocumentManagement/components/DocumentTable.tsx]

import React from "react";
import DocumentTableRow from "./DocumentTableRow";

import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import CustomSelect from "../../../shared/components/CustomSelect"; 
import type { ActionType, Document, SortOrder } from "../types/types"; 

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

const itemsPerPageOptions = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "30", label: "30" },
];

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
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

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
              <SortableHeader label="Request Date" columnKey="created_at" />
              <SortableHeader label="Document Name" columnKey="document_name" className="text-left !justify-start" />
              <SortableHeader label="User Request" columnKey="staff" />
              
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Doc Type</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Category</th>
              
              {/* --- PERUBAHAN DI SINI: Tambahkan Header Team --- */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Team</th>
              
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Status</th>
              
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center right-0 z-10">Actions</th>
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
                  <p>No documents found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default DocumentTable;