
import React from "react";
import { Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import DocumentRow from "./DocumentRow";
import type { UploadedDocument } from "../types/types";
import CustomSelect from "../../../shared/components/CustomSelect";


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
}

const itemsPerPageOptions = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "30", label: "30" },
];

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
  } = props;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const allSelected =
    documents.length > 0 && selectedDocs.length === documents.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white p-6 rounded-b-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-bold">Document Saved</h2>
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
            Delete ({selectedDocs.length})
          </button>
        )}
      </div>

      {/* Wrapper untuk overflow/scroll horizontal */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 min-w-[900px]">
          <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-4 w-1/24">
                <input
                  type="checkbox"
                  onChange={onSelectAll}
                  checked={allSelected}
                  className="h-3 w-3"
                />
              </th>
              <th className="px-6 py-4">Uploaded Date</th>
              <th className="px-6 py-4">Document Name</th>
              <th className="px-6 py-4">Staff</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4 ">Team</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center sticky right-0 bg-gray-100 z-10">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-10">
                  <Loader2 className="animate-spin inline-block" />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-red-500">
                  Failed to load data.
                </td>
              </tr>
            ) : documents.length > 0 ? (
              documents.map((doc) => (
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
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-10">
                  No documents found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Responsive */}
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

export default DocumentsTable;