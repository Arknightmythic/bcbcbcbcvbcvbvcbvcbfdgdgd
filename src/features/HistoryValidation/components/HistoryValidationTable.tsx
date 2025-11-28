// [UPDATE: src/features/HistoryValidation/components/HistoryValidationTable.tsx]

import React from "react";
import HistoryValidationTableRow from "./HistoryValidationRow";
import type {
  ActionType,
  ValidationHistoryItem,
  SortOrder,
} from "../utils/types"; 
import { ArrowUp, ArrowDown } from "lucide-react"; 
import TablePagination from "../../../shared/components/TablePagination";

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
              <SortableHeader label="Tanggal" onClick={onSortToggle} />

              {/* Kolom 2: User */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100">
                Pengguna
              </th>

              {/* Kolom 3: Session ID */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100">
                ID sesi
              </th>

              {/* Kolom 4: Question */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 max-w-xs">
                Pertanyaan
              </th>

              {/* Kolom 5: AI Answer */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 max-w-xs">
                Jawaban AI
              </th>

              {/* Kolom 6: Not Answered */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                Tidak terjawab
              </th>

              {/* Kolom 7: Status */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                Status
              </th>

              {/* Kolom 8: Action (Sticky Right) */}
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center right-0 z-10">
                aksi
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
                  <p>Tidak ada riwayat validasi ditemukan.</p>
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

export default HistoryValidationTable;