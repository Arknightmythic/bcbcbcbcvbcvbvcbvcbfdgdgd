// [UPDATE: src/features/HistoryValidation/components/HistoryValidationTable.tsx]

import React from "react";
import HistoryValidationTableRow from "./HistoryValidationRow";
import type {
  ActionType,
  ValidationHistoryItem,
  SortOrder,
} from "../utils/types"; 
import { ArrowUp, ArrowDown, ChevronRight, ChevronLeft } from "lucide-react"; 
import CustomSelect from "../../../shared/components/CustomSelect";

interface HistoryValidationTableProps {
  histories: ValidationHistoryItem[];
  onAction: (action: ActionType, history: ValidationHistoryItem) => void;
  onViewText: (title: string, content: string) => void;

  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;

  // Props Sorting
  currentSort: SortOrder;
  onSortToggle: () => void;
}

const itemsPerPageOptions = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

const HistoryValidationTable: React.FC<HistoryValidationTableProps> = ({
  histories,
  onAction,
  onViewText,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  currentSort,
  onSortToggle,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper Component untuk Sortable Header (Diadaptasi dari DocumentTable)
  // Karena di sini sortingnya global (hanya date), kita anggap isActive selalu true untuk kolom Date
  const SortableHeader = ({ 
    label, 
    onClick, 
    className = "" 
  }: { 
    label: string; 
    onClick?: () => void; 
    className?: string; 
  }) => {
    return (
      <th 
        className={`px-4 py-3 sticky top-0 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-center gap-1">
          {label}
          {/* Logika Icon: latest (desc) -> ArrowDown, oldest (asc) -> ArrowUp */}
          {currentSort === 'oldest' 
            ? <ArrowUp className="w-3 h-3 text-blue-600" /> 
            : <ArrowDown className="w-3 h-3 text-blue-600" />
          }
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      <div className="overflow-x-auto relative">
        <table className="min-w-full ">
          <thead className="bg-gray-100 sticky top-0">
            <tr className="text-left text-[10px] font-semibold text-gray-600">
              
              {/* Kolom 1: Request Date (Sortable) */}
              <SortableHeader label="Request Date" onClick={onSortToggle} />

              {/* Kolom 2: User */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100">
                User
              </th>

              {/* Kolom 3: Session ID */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100">
                Session ID
              </th>

              {/* Kolom 4: Question */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 max-w-xs">
                Question
              </th>

              {/* Kolom 5: AI Answer */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 max-w-xs">
                AI Answer
              </th>

              {/* Kolom 6: Not Answered */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                Not Answered
              </th>

              {/* Kolom 7: Status */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                Status
              </th>

              {/* Kolom 8: Action (Sticky Right) */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center right-0 z-10">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {histories.length > 0 ? (
              histories.map((history) => (
                <HistoryValidationTableRow
                  key={history.id}
                  history={history}
                  onAction={onAction}
                  onViewText={onViewText}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  <p>No validation history found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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

export default HistoryValidationTable;