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
  isLoadingSkeleton?: boolean;
  onAction: (action: ActionType, history: ValidationHistoryItem) => void;
  onViewText: (title: string, content: string) => void;

  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  
  currentSort: SortOrder;
  onSortToggle: () => void;
}


interface SortableHeaderProps {
  label: string;
  onClick?: () => void;
  className?: string;
  currentSort: SortOrder; 
}


const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  label, 
  onClick, 
  className = "",
  currentSort 
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

const HistoryValidationTable: React.FC<HistoryValidationTableProps> = ({
  histories,
  isLoadingSkeleton = false,
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

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      <div className="overflow-x-auto relative">
        <table className="min-w-full ">
          <thead className="bg-gray-100 sticky top-0">
            <tr className="text-left text-[10px] font-semibold text-gray-600">
              
              {/* Kolom 1: Request Date (Sortable) */}
              {/* PERBAIKAN 3: Mengirim currentSort sebagai props */}
              <SortableHeader 
                label="Tanggal" 
                onClick={onSortToggle} 
                currentSort={currentSort}
              />

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

              {/* Kolom 6: Not Answered - Commented out as in original */}
              {/* <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                Tidak terjawab
              </th> */}

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
            {isLoadingSkeleton ? (
              Array.from({ length: itemsPerPage || 10 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse group hover:bg-gray-50 text-[10px] text-gray-700">
                  <td className="px-4 py-3 w-35">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
                  </td>
                  <td className="px-4 py-3 text-center sticky right-0 z-10">
                    <div className="flex justify-center gap-2">
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : histories.length > 0 ? (
              /* KONDISI NORMAL JIKA ADA DATA */
              histories.map((history) => (
                <HistoryValidationTableRow
                  key={history.id}
                  history={history}
                  onAction={onAction}
                  onViewText={onViewText}
                />
              ))
            ) : (
              /* KONDISI KOSONG/TIDAK ADA HASIL */
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