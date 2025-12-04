import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface TablePaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

const itemsPerPageOptions = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '50', label: '50' }, 
  { value: '100', label: '100' },
];

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Filter opsi yang relevan (misalnya jika itemsPerPage 50, pastikan ada di opsi)
  const availableOptions = itemsPerPageOptions.filter(
    (opt) => 
      Number(opt.value) >= 10 && (Number(opt.value) >= itemsPerPage || Number(opt.value) % 10 === 0)
  );
  
  // Pastikan opsi yang sedang aktif ada di daftar, jika tidak tambahkan
  if (!availableOptions.find(opt => Number(opt.value) === itemsPerPage)) {
    availableOptions.push({ value: String(itemsPerPage), label: String(itemsPerPage) });
    availableOptions.sort((a, b) => Number(a.value) - Number(b.value));
  }


  return (
    <nav
      className="flex flex-col md:flex-row items-center justify-between pt-4 gap-4 md:gap-0"
      aria-label="Table navigation"
    >
      <span className="text-xs font-normal text-gray-500">
        Menampilkan{" "}
        <span className="font-semibold text-gray-900">
          {startItem}-{endItem}
        </span>{" "}
        dari <span className="font-semibold text-gray-900">{totalItems}</span>
      </span>
      <div className="flex items-center space-x-3">
        <span className="text-xs font-normal text-gray-500">
          Baris per halaman:
        </span>
        <CustomSelect
          value={String(itemsPerPage)}
          onChange={(value) => onItemsPerPageChange(Number(value))}
          options={availableOptions}
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
              <span className="sr-only">Sebelumnya</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </li>
          <li>
            <span
              aria-current="page"
              className="flex items-center justify-center h-[30px] px-4 leading-tight text-gray-700 bg-white border border-gray-300"
            >
              Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}
            </span>
          </li>
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center justify-center h-[30px] px-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <span className="sr-only">Selanjutnya</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default TablePagination;