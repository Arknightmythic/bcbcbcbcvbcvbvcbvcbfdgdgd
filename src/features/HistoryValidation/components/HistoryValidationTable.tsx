import React from "react";
import HistoryValidationTableRow from "./HistoryValidationRow";
import type {
  ActionType,
  ValidationHistoryItem,
  SortOrder,
} from "../utils/types"; // Import SortOrder
import { ArrowUp, ArrowDown, ChevronRight, ChevronLeft } from "lucide-react"; // Import icons
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

  // --- Props baru untuk Sorting ---
  currentSort: SortOrder;
  onSortToggle: () => void;
  // ------------------------------
}

// --- Definisi itemsPerPageOptions ---
const itemsPerPageOptions = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];
// -----------------------------------

const HistoryValidationTable: React.FC<HistoryValidationTableProps> = ({
  histories,
  onAction,
  onViewText,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  // Props baru
  currentSort,
  onSortToggle,
}) => {
  // Fungsi helper untuk menampilkan ikon sort yang sesuai
  // 'latest' (descending) -> ArrowDown
  // 'oldest' (ascending) -> ArrowUp
  const SortIcon = currentSort === "latest" ? ArrowDown : ArrowUp;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // --- Definisi startItem dan endItem ---
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  // --------------------------------------

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md z-0">
      <div className="flex flex-col flex-1 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div
                  className="flex items-center justify-center gap-1"
                  onClick={onSortToggle}
                >
                  Tanggal
                  <button
                    className="p-0.5 text-gray-500 hover:text-blue-600 transition-colors"
                    title={`Sort by ${
                      currentSort === "latest" ? "Oldest" : "Latest"
                    }`}
                  >
                    <SortIcon className="w-3 h-3" />
                  </button>
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Session ID
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider max-w-xs"
              >
                Pertanyaan
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider max-w-xs"
              >
                Jawaban AI
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Tidak Terjawab
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider"
              >
                Status Validasi
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-20 border-l border-gray-200"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                  Tidak ada data riwayat validasi yang ditemukan.
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

export default HistoryValidationTable;