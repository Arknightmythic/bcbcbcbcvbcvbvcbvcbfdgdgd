import React from "react";
import DocumentTableRow from "./DocumentTableRow";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "../../../shared/components/CustomSelect"; // Import CustomSelect
import type { ActionType, Document } from "../types/types";

interface DocumentTableProps {
  documents: Document[];
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
  // Props Paginasi
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onViewFile: (doc: Document) => void;
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
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white p-6 rounded-b-lg shadow-md">
      <div className="overflow-y-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm font-semibold text-gray-600">
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                Request Date
              </th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">
                Document Name
              </th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                User Request
              </th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">Doc Type</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100">Kategori</th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                Status
              </th>
              <th className="px-4 py-3 sticky top-0 bg-gray-100 text-center">
                Actions
              </th>
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
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  <p>No documents found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Kontrol Paginasi */}
      <nav
        className="flex items-center justify-between pt-4"
        aria-label="Table navigation"
      >
        <span className="text-sm font-normal text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {totalItems > 0 ? startItem : 0}-{endItem}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{totalItems}</span>
        </span>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-normal text-gray-500">
            Rows per page:
          </span>
          <CustomSelect
              selectedType="pagerow"
              direction="up"
              value={String(itemsPerPage)}
              onChange={(value) => onItemsPerPageChange(Number(value))}
              options={itemsPerPageOptions}
            />
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center h-9 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </li>
            <li>
              <span
                aria-current="page"
                className="flex items-center justify-center h-9 px-4 leading-tight text-gray-700 bg-white border border-gray-300"
              >
                Page {currentPage} of {totalPages > 0 ? totalPages : 1}
              </span>
            </li>
            <li>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center h-9 px-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default DocumentTable;
