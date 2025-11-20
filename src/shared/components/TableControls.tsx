// [GANTI: src/shared/components/TableControls.tsx]

import React, { useCallback, useState } from "react";
import { Search, Filter, Calendar } from "lucide-react"; // Import Calendar
import CustomSelect from "./CustomSelect";

// Interface untuk opsi filter (diasumsikan sudah ada)
export interface FilterOption {
  value: string;
  label: string;
}

// Interface untuk konfigurasi filter (diasumsikan sudah ada)
export interface FilterConfig<T extends Record<string, string>> {
  key: keyof T;
  options: FilterOption[];
}

// Interface props komponen TableControls
interface TableControlsProps<T extends Record<string, string>> {
  searchTerm: string;
  searchPlaceholder: string;
  filters: T;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onFilterChange: (filterName: keyof T, value: string) => void;
  filterConfig: FilterConfig<T>[];
  // --- Props baru untuk Sorting ---
  sortState?: {
      order: 'latest' | 'oldest' | '';
      onSortToggle: () => void;
      sortKey: string;
  }
  // --------------------------------
}

const TableControls = <T extends Record<string, string>>({
  searchTerm,
  searchPlaceholder,
  filters,
  onSearchChange,
  onSearchSubmit,
  onFilterChange,
  filterConfig,
  // Props baru
  sortState
}: React.PropsWithChildren<TableControlsProps<T>>) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Asumsi 'date' adalah kunci filter untuk date selector
  const dateFilterKey = 'date' as keyof T; 
  const hasDateFilter = filters.hasOwnProperty(dateFilterKey);
  const otherFilters = filterConfig.filter(
      (config) => config.key !== dateFilterKey
  );
  
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
      {/* Search Input */}
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

      {/* Filter and Date Input Section */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Date Selector Filter */}
        {hasDateFilter && (
            <div className="relative">
                <input
                    type="date"
                    id="date-filter"
                    // Ambil format YYYY-MM-DD dari state filters
                    value={filters[dateFilterKey] as string} 
                    onChange={(e) => onFilterChange(dateFilterKey, e.target.value)}
                    // Styling disesuaikan dengan tema Tailwind
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700 appearance-none bg-white"
                    title="Filter by specific date"
                />
                <label 
                    htmlFor="date-filter" 
                    className="absolute left-0 top-0 mt-2.5 ml-3 text-gray-400 pointer-events-none"
                >
                    <Calendar className="w-4 h-4" />
                </label>
            </div>
        )}
        
        {/* Dropdown Filters (aiAnswer, validationStatus) */}
        {otherFilters.length > 0 && (
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
                onBlur={() => setTimeout(() => setIsFilterOpen(false), 100)} // Menutup dropdown saat klik di luar
              >
                {otherFilters.map((config) => (
                  <div key={config.key as string} className="mb-3 last:mb-0">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {config.options[0].label.replace("All ", "").replace("AI ", "")}
                    </label>
                    <CustomSelect
                      options={config.options}
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