// [GANTI: src/shared/components/TableControls.tsx]

import React, { useCallback, useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import CustomSelect from "./CustomSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper untuk format tanggal ke string (YYYY-MM-DD)
const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset*60*1000));
  return adjustedDate.toISOString().split('T')[0];
};

export interface FilterOption {
  value: string;
  label: string;
}

// Update FilterConfig untuk mendukung tipe date-range
export interface FilterConfig<T extends Record<string, any>> {
  key: string; // Menggunakan string agar fleksibel
  label?: string;
  type?: 'select' | 'date-range'; // Tipe filter
  options?: FilterOption[];       // Wajib untuk select, opsional untuk date-range
  placeholder?: string;
  startDateKey?: string;          // Key state untuk tanggal mulai (date-range)
  endDateKey?: string;            // Key state untuk tanggal akhir (date-range)
}

// Update generic T menjadi Record<string, any> agar bisa menampung string date
interface TableControlsProps<T extends Record<string, any>> {
  searchTerm: string;
  searchPlaceholder: string;
  filters: T;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onFilterChange: (filterName: keyof T, value: any) => void;
  filterConfig: FilterConfig<T>[];
  sortState?: {
      order: 'latest' | 'oldest' | string;
      onSortToggle: () => void;
      sortKey: string;
  }
}

const TableControls = <T extends Record<string, any>>({
  searchTerm,
  searchPlaceholder,
  filters,
  onSearchChange,
  onSearchSubmit,
  onFilterChange,
  filterConfig,
  sortState
}: React.PropsWithChildren<TableControlsProps<T>>) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 1. Pisahkan konfigurasi Date Range dan Dropdown Select
  const dateRangeConfig = filterConfig.find(c => c.type === 'date-range');
  const dropdownFilters = filterConfig.filter(c => c.type !== 'date-range');

  // 2. Handler untuk perubahan Date Range
  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    if (!dateRangeConfig || !dateRangeConfig.startDateKey || !dateRangeConfig.endDateKey) return;
    
    const [start, end] = dates;
    // Update Start Date
    onFilterChange(dateRangeConfig.startDateKey as keyof T, start ? formatDate(start) : '');
    // Update End Date
    onFilterChange(dateRangeConfig.endDateKey as keyof T, end ? formatDate(end) : '');
  };

  // 3. Parse value dari state filters (string) kembali ke Date object untuk DatePicker
  const startDateVal = dateRangeConfig?.startDateKey && filters[dateRangeConfig.startDateKey] 
    ? new Date(filters[dateRangeConfig.startDateKey]) 
    : null;
  const endDateVal = dateRangeConfig?.endDateKey && filters[dateRangeConfig.endDateKey] 
    ? new Date(filters[dateRangeConfig.endDateKey]) 
    : null;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        onSearchSubmit();
      }
    },
    [onSearchSubmit]
  );
  
  return (
    <div className="flex flex-col md:flex-row gap-3 py-4">
      {/* --- Search Input (TIDAK BERUBAH) --- */}
      <div className="max-w-md relative flex-grow md:w-1/3">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        <button
          onClick={onSearchSubmit}
          className="absolute left-0 top-0 mt-2.5 ml-3 text-gray-400 hover:text-gray-600"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* --- Date Range Picker (MENGGANTIKAN INPUT DATE LAMA) --- */}
        {dateRangeConfig && (
            <div className="relative z-20">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDateVal}
                        endDate={endDateVal}
                        onChange={handleDateRangeChange}
                        isClearable={true}
                        placeholderText={dateRangeConfig.placeholder || "Select Date Range"}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white cursor-pointer"
                    />
                </div>
                {/* Custom Style untuk DatePicker agar sesuai tema */}
                <style>{`
                    .react-datepicker-wrapper { width: auto; }
                    .react-datepicker__input-container input { width: 240px; }
                    .react-datepicker__day--in-range, .react-datepicker__day--in-selecting-range {
                        background-color: #eff6ff !important;
                        color: #2563eb !important;
                    }
                    .react-datepicker__day--selected, .react-datepicker__day--range-start, .react-datepicker__day--range-end {
                        background-color: #2563eb !important;
                        color: white !important;
                    }
                    .react-datepicker__close-icon::after {
                        background-color: #ef4444;
                    }
                `}</style>
            </div>
        )}
        
        {/* --- Dropdown Filters (TIDAK BERUBAH LOGIC-NYA) --- */}
        {dropdownFilters.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            
            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200 p-3"
                onBlur={() => setTimeout(() => setIsFilterOpen(false), 200)}
              >
                {dropdownFilters.map((config) => (
                  <div key={config.key as string} className="mb-3 last:mb-0">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {config.options && config.options[0]?.label.replace("All ", "").replace("AI ", "") || config.label}
                    </label>
                    <CustomSelect
                      options={config.options || []}
                      value={filters[config.key]}
                      onChange={(value) => onFilterChange(config.key, value)}
                      selectedType="default"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableControls;